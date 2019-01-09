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

router.use(function(request, response, next) {
    next();
});

function createDockerContent(features) {

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

    return featureString; //"\nRUN apt-get install zip unzip";
}

router.route('/image')
    .post(function(request, response) {
        fs.copyFile(__dirname + '/Dockerfile.sample', __dirname + '/../../Dockerfile', function(error) {
            if (error) {
                response.status(500).send('An internal server error occured while creating the docker image');
                return;
            }

            var content = createDockerContent(request.body.features);
            fs.appendFile(__dirname + '/../../Dockerfile', content, function(error) {
                if (error) {
                    response.status(500).send('Error while creating Dockerfile.');
                    return;
                }

                var tarStream = tar.pack(__dirname + '/../../');
                var imageName = 'swe-' + request.body.title;

                if (request.body.courseName) {
                    imageName += "-" + request.body.courseName;
                }

                imageName += ":latest";
                imageName = imageName.toLocaleLowerCase();

                docker.image.build(tarStream, { t: imageName })
                    .then(stream => new Promise((resolve, reject) => {
                        stream.on('data', data => console.log(data.toString()))
                        stream.on('end', resolve)
                        stream.on('error', reject)
                    }))
                    .then(() =>
                        fs.unlink(__dirname + '/../../', function(error) {
                            response.status(200).send("Docker image has been created successfully.");
                        })
                    ) //console.log("done"))
                    .catch(error => {
                        response.status(500).send("An internal server error occurred while creating the docker image");
                    });
            });
        });
    })
    .get(function(request, response) {
        docker.image.list().then(images => {
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
    .delete(function(request, response) {
        docker.image.list().then(images => {
            for (var i = 0; i < images.length; i++) {
                var names = images[i].data.RepoTags;
                if (names.includes(request.params.image_name)) {
                    /*if (names.length == 1) {
                        images[i].remove({ force: true });
                        console.log("Image " + request.params.image_name + " deleted successfully");

                        response.status(200).send("Image " + request.params.image_name + " deleted successfully");
                    } else {
                        response.status(200).send("Image " + request.params.image_name + " untagged successfully");*/
                    var exec = require('child_process').exec;

                    exec("docker rmi " + request.params.image_name + " -f", (error, stdout, stderr) => {
                        if (error != null) {
                            response.status(500).send("Image " + request.params.image_name + " could not be removed");
                        } else {
                            response.status(200).send("Image " + request.params.image_name + " remvoed successfully");
                        }
                    });
                    //}
                }
            }
        })
    });

router.route('/container')
    .post(function(request, response) {
        //response.send("Got a POST request at /api/containers with " + request.body);

        console.log(request.body);

        docker.container.create(request.body).then(container => {
            container.start();
            response.status(200).send("Container has been started");
        }).catch(error => {
            response.status(500).send('Container hasn\'t been started ' + error);
        });
    })
    .get(function(request, response) {
        var containerArray = [];

        docker.container.list().then(containers => {
            for (var i = 0; i < containers.length; i++) {
                if (containers[i].data.Image.startsWith('swe-')) {
                    var tempContainer = {};
                    tempContainer.name = containers[i].data.Names[0];
                    tempContainer.id = containers[i].data.Id;
                    tempContainer.status = containers[i].data.Status;
                    tempContainer.image = containers[i].data.Image;
                    console.log(containers[i].data);
                    containerArray.push(tempContainer);
                }
            }
            console.log(containerArray);
            response.send(JSON.stringify({ "containers": containerArray }));
        });


    });


router.route('/container/:container_id')
    .get(function(request, response) {

        response.send("Got a GET request at /api/containers/" + request.params.container_id);

    })
    .delete(
        function(request, response) {
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
        function(err, obj) {
            response.send("Something went wrong with DELETE request at /api/containers/" + request.params.container_id);
        }
    );


app.use('/api', router);

var port = process.env.PORT || 4200;

app.listen(port, () => {
    console.log("Server running on port " + port);
});