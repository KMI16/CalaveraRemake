var { Docker } = require('node-docker-api');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

var tar = require('tar-fs');
var fs = require('fs');

var express = require('express');
var cors = require('cors');
var router = express.Router();

var app = express();

app.use(express.static(__dirname + '/www/'));
app.use(cors());
app.use(express.json());

router.use(function (request, response, next) {
    next();
});

/**
 * This maps takes a String array and builds the corresponding installation command.
 * It loops through the array and graps the installation instruction for the corresponding
 * module name that shall be installed.
 * 
 * @param {String[]} features an array providing the keywords from the modules to be installed
 * @return {String} a String containing the installation instructions for the given features list
 */
function createInstallationInstructionsForFeatureList(features) {
    var featureCommandMap = {
        "git": "#install git\nRUN apt-get install -y git",
        "java": "#install java\nRUN apt-get install -y default-jdk",
        "c": "#install c\nRUN apt-get install -y gcc",
        "c++": "#install c++\nRUN apt-get install -y g++",
        "netbeans": "#install netbeans\nRUN add-apt-repository ppa:vajdics/netbeans-installer && apt-get update\n" +
            "RUN apt-get install -y netbeans-installer\n" +
            "RUN ln -s $(which netbeans) Desktop",
        "atom": "#install atom\nRUN add-apt-repository ppa:webupd8team/atom && apt-get update\n" +
            "RUN apt-get install -y atom"
    };

    var featureString = "";

    for (var i = 0; i < features.length; i++) {
        featureString += featureCommandMap[features[i]] + "\n\n";
    }

    return featureString;
}

router.route('/image')
    /** image creation request */
    .post(function (request, response) {

        // Step one is to copy the sample file, containing the general instructions for all docker files,
        // into the root directory 
        fs.copyFile(__dirname + '/Dockerfile.sample', __dirname + '/../../Dockerfile', function (error) {

            if (error) {
                response.status(500).send('An internal server error occured while creating the docker image');
                return;
            }


            var featureInstallationInstructions = createInstallationInstructionsForFeatureList(request.body.features);
            fs.appendFile(__dirname + '/../../Dockerfile', featureInstallationInstructions, function (error) {
                if (error) {
                    response.status(500).send('Error while creating Dockerfile.');
                    return;
                }

                var tarStream = tar.pack(__dirname + '/../../');

                // construct the image name
                var imageName = 'swe-' + request.body.title;
                if (request.body.courseName) {
                    imageName += "-" + request.body.courseName;
                }
                imageName += ":latest";
                imageName = imageName.toLocaleLowerCase();

                // build the actual docker image and link the error,data,end Streams
                // to the console
                docker.image.build(tarStream, { t: imageName })
                    .then(stream => new Promise((resolve, reject) => {
                        stream.on('data', data => console.log(data.toString()))
                        stream.on('end', resolve)
                        stream.on('error', reject)
                    }))
                    .then(() => {
                        console.log("Done");
                        fs.unlink(__dirname + '/../../Dockerfile', function (error) {
                            response.status(200).send("Docker image has been created successfully.");
                        });
                    })
                    .catch(error => {
                        response.status(500).send("An internal server error occurred while creating the docker image");
                    });
            });
        });
    })
    /** get Docker images request */
    .get(function (request, response) {
        docker.image.list().then(images => {

            // find all images that are prefixed with 'swe-'
            // and send the list back to the client
            var imageList = [];
            for (var image of images) {
                if (image.data && image.data.RepoTags[0].startsWith('swe-')) {
                    for (var name of image.data.RepoTags) {
                        imageList.push({
                            "name": name,
                            "size": image.data.Size,
                            "status": "available"
                        });
                    }
                }
            }
            response.send(JSON.stringify({ 'images': imageList }));
        });
    });

router.route('/image/:image_name')
    /** image delete request */
    .delete(function (request, response) {
        docker.image.list().then(images => {
            // loop through all images and delete the image with the
            // given name `request.params.image_name` 
            for (var i = 0; i < images.length; i++) {
                var names = images[i].data.RepoTags;
                if (names.includes(request.params.image_name)) {
                    var exec = require('child_process').exec;

                    // docker rmi removes the image from the system 
                    exec("docker rmi " + request.params.image_name + " -f", (error, stdout, stderr) => {
                        if (error != null) {
                            response.status(500).send("Image " + request.params.image_name + " could not be removed");
                        } else {
                            response.status(200).send("Image " + request.params.image_name + " remvoed successfully");
                        }
                    });
                }
            }
        })
    });

router.route('/container')
    /** container creation request */
    .post(function (request, response) {
        console.log(request.body);
        docker.container.create(request.body).then(container => {
            container.start();
            response.status(200).send("Container has been started");
        }).catch(error => {
            response.status(500).send('Container hasn\'t been started ' + error);
        });
    })
    /** get container list request */
    .get(function (request, response) {
        var containerArray = [];

        docker.container.list().then(containers => {
            // loop through all containers and find all
            // that are prefixed with 'swe' 
            for (var i = 0; i < containers.length; i++) {
                if (containers[i].data.Image.startsWith('swe-')) {
                    var tempContainer = {};

                    // grep all necessary information
                    tempContainer.name = containers[i].data.Names[0];
                    tempContainer.id = containers[i].data.Id;
                    tempContainer.status = containers[i].data.Status;
                    tempContainer.image = containers[i].data.Image;
                    console.log(containers[i].data);

                    // add container in the form
                    // {
                    //     "name": "<name>",
                    //      "id": "<id>",
                    //      "status": "<status>"
                    //      "image": "<image>"
                    // }
                    containerArray.push(tempContainer);
                }
            }
            console.log(containerArray);
            response.send(JSON.stringify({ "containers": containerArray }));
        });


    });


router.route('/container/:container_id')
    /** get container with certain id */
    .get(function (request, response) {
        response.send("Got a GET request at /api/containers/" + request.params.container_id);
    })
    /** delete container with certain id */
    .delete(
        function (request, response) {
            docker.container.list().then(containers => {
                for (var i = 0; i < containers.length; i++) {
                    if (containers[i].data.Id == request.params.container_id) {
                        containers[i].stop();
                        containers[i].delete({ force: true });
                    }
                }
            });
            response.send("Container " + request.params.container_id + ' deleted successfully.');
        },
        function (err, obj) {
            response.send("Something went wrong with DELETE request at /api/containers/" + request.params.container_id);
        }
    );


app.use('/api', router);

var port = process.env.PORT || 4200;

const server = app.listen(port, () => {
    console.log("Server running on localhost" + port);
});
server.timeout = 600000;