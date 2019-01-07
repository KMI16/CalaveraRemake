var { Docker } = require('node-docker-api');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

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

router.route('/image')
    .post(function(request, response) {
        response.send('Got a POST request at /api/image with ' + request.body);
    })
    .get(function(request, response) {
        var imageNames = [];
        docker.image.list().then(images => {
            for (var image of images) {
                if (image.data.RepoTags[0].startsWith('swe-')) {
                    console.log("Adding: " + image.data.RepoTags[0]);
                    imageNames.push(image.data.RepoTags[0]);
                }
            }
            response.send(JSON.stringify({ 'image_names': imageNames }));
        });
        //response.send('Got a GET request at /api/image');
    });

router.route('/container')
    .post(function(request, response) {
        response.send("Got a POST request at /api/containers with " + request.body);

        console.log(request.body);

        docker.container.create(request.body).then(container => container.start()).catch(error => console.log(error));
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

app.listen(4200, () => {
    console.log("Server running on port 4200");
});