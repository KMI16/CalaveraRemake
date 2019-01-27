var baseURL = 'http://localhost:4200/api/';
var containerList = [];
var imageList = [];
var canRefresh = true;

window.onbeforeunload = function () { return canRefresh; }

window.onload = function () {
    getAllImages();
    getAllDockerContainer();
}

/**
 * Sends a GET request to {@code baseRL/image} in order to
 * retrieve all images that are currently available. After retrieving
 * the data will be populated in the image select.
 */
var getAllImages = function () {
    var url = baseURL + 'image';
    sendRequest(url, 'GET', null, null, function (http) {
        var images = JSON.parse(http.responseText).images;

        // filter all images that are currently still in progress
        var processingImages = [];
        for (var img of imageList) {
            if (img.status == "in process") {
                processingImages.push(img);
            }
        }
        console.log(processingImages);

        imageList = [];
        for (var i = 0; i < images.length; i++) {
            if (images[i].name) {
                imageList.push(new Image(images[i].name, images[i].size, images[i].status));
            }
        }

        if (processingImages.length > 0) {
            for (var imgProcess of processingImages) {
                imageList.push(imgProcess);
            }
        }

        var imageDropdown = document.getElementById('imageSelection');
        imageDropdown.innerHTML = null;

        var option = document.createElement('option');
        option.value = "default";
        option.innerHTML = "Image auswählen";
        imageDropdown.appendChild(option);

        // populate the images into the select box
        for (var image of imageList) {
            var element = document.createElement('option');
            console.log(image);

            element.textContent = image.name.substring(image.name.indexOf('-') + 1);
            element.value = image.name;
            imageDropdown.appendChild(element);
        }
        // update the image table
        updateImageTable();
    });
}

/**
 * Handler to react to an onClick event of the button that creates a new image
 */
var handleCreateImageButton = function () {
    canRefresh = false;
    var features = [];

    // retrieve selected modules from the checkboxes
    // and push them into the features list
    var componentDiv = document.getElementById("component-checkboxes");
    var selectedBoxes = componentDiv.querySelectorAll('input[type="checkbox"]:checked');

    for (var i = 0; i < selectedBoxes.length; i++) {
        features.push(selectedBoxes[i].value);
    }

    // construct the post body
    var body = {
        "title": document.getElementById('imageNameInput').value,
        "features": features
    };

    // if available, send the course description as well
    var courseDescriptionInput = document.getElementById('courseDescriptionInput').value;
    if (courseDescriptionInput != "") {
        body.courseName = courseDescriptionInput;
    }

    // tag the title of the image with the 'swe-' tag
    var title = 'swe-' + body.title.toLowerCase();
    if (body.courseName) {
        title += '-' + body.courseName.toLowerCase();
    }
    imageList.push(new Image(title, 'n/a', 'in process'));
    updateImageTable();

    sendRequest(baseURL + 'image', 'POST', JSON.stringify(body), 'application/json; charset=utf-8', function (http) {
        console.log(http.responseText);
        getAllImages();
    });

}

var handleStartContainerButton = function () {
    var container = {};
    container.Image = document.getElementById("imageSelection").value;

    var gitReposUrl = document.getElementById('gitReposURL').value;

    if (document.getElementById('isInternalGit').checked) {
        gitReposUrl = "ssh://git@localhost:2222/git-server/repos/" + gitReposUrl.replace(/\.git/g, '') + ".git";
    }

    var envs = [];

    envs.push('GIT_REPOS_URL=' + gitReposUrl);
    envs.push('GIT_USER_NAME=' + document.getElementById('gitReposUser').value);
    envs.push('GIT_PASSWORD=' + document.getElementById('gitReposPassword').value);
    envs.push('VNC_RESOLUTION=1366x768');

    // check if enviroenment variables are present
    if (document.getElementById('environmentVariables').value != '') {
        for (var line of document.getElementById('environmentVariables').value.split('\n')) {
            // if line is a valid environment variable name=value
            if (line.match(/[a-zA-Z]+([a-zA-Z\d_]+)?=.+/g)) {
                envs.push(line);
            }
        }
    }

    container.Env = envs;

    container.ExposedPorts = {
        "6901/tcp": {},
        "5901/tcp": {}
    };

    container.PortBindings = {
        "6901/tcp": [{ "HostPort": document.getElementById('noVncPort').value }],
        "5901/tcp": [{ "HostPort": document.getElementById('vncPort').value }]
    };

    if (document.getElementById('isInternalGit').checked) {
        container.NetworkMode = "host";
    }
    createAndStartContainer(container);

}


var handleDuplicateButton = function (dockerID) {
    getAllDockerContainer();
}

var handleEditButton = function (dockerID) {
    createAndStartContainer('');
}

/**
 * Sends a DELETE request to {@code baseURL/container/:container_id} in order to 
 * delete and stop the docker with the given {@code dockerID}. After deleting
 * the table will be refreshed.
 * 
 * @param {String} dockerID the docker to be deleted / stopped
 */
var deleteDockerContainer = function (dockerID) {
    var url = baseURL + 'container/' + dockerID;
    sendRequest(url, 'DELETE', null, null, function (http) {
        console.log(http.responseText);

        var indexToRemove = getIndexFromContainerId(dockerID);
        containerList.splice(indexToRemove, 1);
        updateContainerTable();
    });
}

var handleDeleteImage = function (i) {
    var image = imageList[i];
    deleteDockerImage(image.name);
}

var deleteDockerImage = function (name) {
    var url = baseURL + 'image/' + name;
    sendRequest(url, 'DELETE', null, null, function (http) {
        console.log(http.responseText);
        getAllImages();
    });
}

/**
 * Sends a GET request to {@code baseURL/container/:container_id} in order to
 * retrieve the container with the given id.
 * 
 * @param {String} dockerID the docker to be retrieved
 */
var getDockerContainerById = function (dockerID) {
    var url = baseURL + 'container/' + dockerID;
    sendRequest(url, 'GET', null, null, function (http) {
        var containerToInsert = JSON.parse(http.responseText);
        var indexToInsert = getIndexFromContainerId(containerToInsert.id);

        if (indexToInsert != -1) {
            containerList[indexToInsert] = containerToInsert;
        }

        updateContainerTable();
    });
}

/**
 * Loops through the {@code containerList } and searches for a container
 * with the given {@code containerID }.
 * @param {number} containerID the id of the container to be found 
 * 
 * @returns the position of the container in the array or -1
 */
var getIndexFromContainerId = function (containerID) {
    for (var i = 0; i < containerList.length; i++) {
        if (containerList[i].id === containerID) {
            return i;
        }
    }
    return -1;
}


/**
 * Sends a GET request to {@code baseRL/container} in order to
 * retrieve all containers that are currently running. After retrieving
 * the data will be populated in the container table. {@see #updateContainerTable(containers) }.
 */
var getAllDockerContainer = function () {
    var url = baseURL + 'container';
    sendRequest(url, 'GET', null, null, function (http) {
        var containers = JSON.parse(http.responseText).containers;

        containerList = [];

        for (var i = 0; i < containers.length; i++) {
            var c = containers[i];
            var obj = new Container(c.id, c.name, c.status, c.image);
            containerList.push(obj);
        }

        updateContainerTable();
    });
}

/**
 * Sends a POST request to {@code baseURL/containers} in order to create
 * and start a new docker. The attributes are provided by the {@code container}.
 * 
 * @param {Object} container the container to be added and started
 */
var createAndStartContainer = function (container) {
    var url = baseURL + 'container';
    canRefresh = false;
    sendRequest(url, 'POST', JSON.stringify(container), 'application/json; charset=utf-8', function (http) {
        console.log(http.responseText);
        canRefresh = true;
        getAllDockerContainer();
    });
}

/**
 * Sends a {@code operation} request to the given url. You can specify the content type
 * of the request via the  {@code contentType} field and provide a custom callback function
 * incase the request is successfull.
 * 
 * @param {String} url the request url
 * @param {String} operation the http operation
 * @param {Array} params the post parameter - can be null 
 * @param {String} contentType the content type - can be null to use default
 * @param {Function} callback function on success (status == 200 && readyState == 4)
 */
var sendRequest = function (url, operation, params, contentType, callback) {
    var http = new XMLHttpRequest();
    http.open(operation, url);

    if (contentType != null) {
        http.setRequestHeader('Content-type', contentType);
    }

    http.onreadystatechange = function () {
        console.log(http);
        if (http.readyState === 4) {
            if (http.status == 200) {
                callback(http);
            } else {
                alert("Something went wrong: " + http.responseText);
            }
        }
    }

    http.send(params);
}

/**
 * This array contains all container instances and populates them in the table with
 * the id {@code container-table}. Before populating the data it clears the table.
 * {@see #createTableRowFromContainer(number, container) }.
 */
var updateContainerTable = function () {
    var table = document.getElementById('container-table').getElementsByTagName('tbody')[0];

    // clear table 
    table.innerHTML = null;

    for (var i = 0; i < containerList.length; i++) {
        var tr = createTableRowFromContainer(i, containerList[i]);
        table.appendChild(tr);
    }
}

var updateImageTable = function () {
    var table = document.getElementById('image-table').getElementsByTagName('tbody')[0];

    //clear table
    table.innerHTML = null;

    for (var i = 0; i < imageList.length; i++) {
        var tr = createTableRowFromImage(i, imageList[i]);
        table.appendChild(tr);
    }
    canRefresh = true;
}

/**
 * Creates at least (container.props.length + 2) columns and adds them to the given
 * table row {@code tr}. The first column contains the row number following the columns 
 * for each property in the container. The last column is the button bar created by 
 * the following method {@see #createButtonRow(number)}.
 * 
 * @param {number} [i] the row number to insert the row at
 * @param {Container} container the docker container object containing the table data
 * @return the table row {DOMObject} that was created
 */
var createTableRowFromContainer = function (i, container) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<th scope="row">' + (i + 1) + '</th>';

    for (var prop in container) {
        var td = document.createElement('td');
        if (prop == 'id') {
            td.innerHTML = container[prop].substring(0, 12);
        } else {
            td.innerHTML = container[prop];
        }
        tr.appendChild(td);
    }

    var buttonCol = document.createElement('td');
    buttonCol.innerHTML = createButtonRow(container.id);
    tr.appendChild(buttonCol);

    return tr;
}

var createTableRowFromImage = function (i, image) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<th scope="row">' + (i + 1) + '</th>'

    for (var prop in image) {
        var td = document.createElement('td');
        if (prop == 'name') {
            td.innerHTML = image[prop].substring(image.name.indexOf('-') + 1);
        } else {
            td.innerHTML = image[prop];
        }
        tr.appendChild(td);
    }
    var td = document.createElement('td');
    td.innerHTML = '<button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="Image löschen" onclick="handleDeleteImage(\'' + i + '\');"><span class="glyphicon glyphicon-trash"></span></button>';
    tr.appendChild(td);

    return tr;
}

/**
 * Creates the control buttons for each row. Each row has a edit, clone and stop button.
 * @param {String} id the docker id 
 */
var createButtonRow = function (id) {
    id = id + "";
    return '<div class="btn-group" role="group" aria-label="...">' +
        '<button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="Container bearbeiten" onclick="handleEditButton(\'' + id + '\');">' +
        '<span class="glyphicon glyphicon-pencil"></span>' +
        '</button>' +
        ' <button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="Container clonen und starten" onclick="handleDuplicateButton(\'' + id + '\');">' +
        '<span class="glyphicon glyphicon-duplicate"></span>' +
        '</button>' +
        '<button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="Container stoppen und löschen" onclick="deleteDockerContainer(\'' + id + '\');">' +
        '<span class="glyphicon glyphicon-stop"></span>' +
        '</button>' +
        '</div>';

}