var baseURL = 'http://127.0.0.1:4200/api/';
var containerList = [];
var imageList = [];

window.onload = function() {
    getAllImages();
    getAllDockerContainer();
}

/**
 * Sends a GET request to {@code baseRL/image} in order to
 * retrieve all images that are currently available. After retrieving
 * the data will be populated in the image select.
 */
var getAllImages = function() {
    var url = baseURL + 'image';
    sendRequest(url, 'GET', null, null, function(http) {
        var images = JSON.parse(http.responseText).image_names;
        imageList = [];
        for (var imageName of images) {
            imageList.push(imageName);
        }

        var imageDropdown = document.getElementById('imageSelection');
        for (var image of imageList) {
            var element = document.createElement('option');
            element.textContent = image.substring(image.indexOf('-') + 1);
            element.value = image;
            imageDropdown.appendChild(element);
        }
    });
}

var handleStartContainerButton = function() {
    var container = {};
    container.Image = document.getElementById("imageSelection").value;

    var envs = [];
    envs.push('GIT_REPOS_URL=' + document.getElementById('gitReposURL').value);
    envs.push('GIT_USER_NAME=' + document.getElementById('gitReposUser').value);
    envs.push('GIT_PASSWORD=' + document.getElementById('gitReposPassword').value);
    envs.push('VNC_RESOLUTION=1366x768');


    for (var line in document.getElementById('environmentVariables').value.split('\n')) {
        envs.push(line);
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
    container.NetworkMode = "host";
    createAndStartContainer(container);

}


var handleDuplicateButton = function(dockerID) {
    getAllDockerContainer();
}

var handleEditButton = function(dockerID) {
    console.log("hallo");
    createAndStartContainer('');
}

/**
 * Sends a DELETE request to {@code baseURL/container/:container_id} in order to 
 * delete and stop the docker with the given {@code dockerID}. After deleting
 * the table will be refreshed.
 * 
 * @param {String} dockerID the docker to be deleted / stopped
 */
var deleteDockerContainer = function(dockerID) {
    var url = baseURL + 'container/' + dockerID;
    sendRequest(url, 'DELETE', null, null, function(http) {
        console.log(http.responseText);

        var indexToRemove = getIndexFromContainerId(dockerID);
        containerList.splice(indexToRemove, 1);
        updateTable();
    });
}

/**
 * Sends a GET request to {@code baseURL/container/:container_id} in order to
 * retrieve the container with the given id.
 * 
 * @param {String} dockerID the docker to be retrieved
 */
var getDockerContainerById = function(dockerID) {
    var url = baseURL + 'container/' + dockerID;
    sendRequest(url, 'GET', null, null, function(http) {
        var containerToInsert = JSON.parse(http.responseText);
        var indexToInsert = getIndexFromContainerId(containerToInsert.id);

        if (indexToInsert != -1) {
            containerList[indexToInsert] = containerToInsert;
        }

        updateTable();
    });
}

/**
 * Loops through the {@code containerList } and searches for a container
 * with the given {@code containerID }.
 * @param {number} containerID the id of the container to be found 
 * 
 * @returns the position of the container in the array or -1
 */
var getIndexFromContainerId = function(containerID) {
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
 * the data will be populated in the container table. {@see #updateTable(containers) }.
 */
var getAllDockerContainer = function() {
    var url = baseURL + 'container';
    sendRequest(url, 'GET', null, null, function(http) {
        var containers = JSON.parse(http.responseText).containers;

        containerList = [];

        for (var i = 0; i < containers.length; i++) {
            var c = containers[i];
            var obj = new Container(c.id, c.name, c.status, c.image);
            containerList.push(obj);
        }

        updateTable();
    });
}

/**
 * Sends a POST request to {@code baseURL/containers} in order to create
 * and start a new docker. The attributes are provided by the {@code container}.
 * 
 * @param {Object} container the container to be added and started
 */
var createAndStartContainer = function(container) {
    var url = baseURL + 'container';

    sendRequest(url, 'POST', JSON.stringify(container), 'application/json; charset=utf-8', function(http) {
        console.log(http.responseText);
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
var sendRequest = function(url, operation, params, contentType, callback) {
    var http = new XMLHttpRequest();
    http.open(operation, url);

    if (contentType != null) {
        http.setRequestHeader('Content-type', contentType);
    }

    http.onreadystatechange = function() {
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
var updateTable = function() {
    var table = document.getElementById('container-table').getElementsByTagName('tbody')[0];

    // clear table 
    table.innerHTML = null;

    for (var i = 0; i < containerList.length; i++) {
        var tr = createTableRowFromContainer(i, containerList[i]);
        table.appendChild(tr);
    }
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
var createTableRowFromContainer = function(i, container) {
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

/**
 * Creates the control buttons for each row. Each row has a edit, clone and stop button.
 * @param {String} id the docker id 
 */
var createButtonRow = function(id) {
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