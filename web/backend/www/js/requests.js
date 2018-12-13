var baseURL = 'http://127.0.0.1:8000/api/';

var fetchTableData = function() {
    //getRequest("");
    getAllDockerContainer();
}

var handleDeleteButton = function (dockerID) {
//    deleteRequest(dockerID);
//    postRequest(dockerID);
}

var handleDuplicateButton = function (dockerID) {
    //getRequest('/' + dockerID);
    getAllDockerContainer();
}

var handleEditButton = function(dockerID) {
    console.log("hallo");
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
        //TODO Refresh table
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
        var container = JSON.parse(http.responseText);
        //TODO update table
    });
}

/**
 * Sends a GET request to {@code baseRL/container} in order to
 * retrieve all containers that are currently running. After retrieving
 * the data will be populated in the container table. {@see #updateTable(containers) }.
 */
var getAllDockerContainer = function () {
    var url = baseURL + 'container';
    sendRequest(url, 'GET', null, null, function (http) {
        var containers = JSON.parse(http.responseText).containers;
        updateTable(containers);
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
    var data = {};
    data.dockerID = container;
    data.name = "Foo";

    sendRequest(url, 'POST', JSON.stringify(data), 'application/json; charset=utf-8', function (http) {
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
var sendRequest = function (url, operation, params, contentType, callback) {
    var http = new XMLHttpRequest();
    http.open(operation, url);

    if (contentType != null) {
        http.setRequestHeader('Content-type', contentType);
    }

    http.onreadystatechange = function () {
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
 * {@link #addColumnsToRow(number, object, DOMObject)}.
 * 
 * @param {Array} containers array containing all container instances
 */
var updateTable = function (containers) {
    var table = document.getElementById('container-table').getElementsByTagName('tbody')[0];
        
    // clear table 
    table.innerHTML = null;        
    
    for(var i = 0; i < containers.length; i++) {
        var tr = createTableRowFromContainer(i, containers[i]);
        table.appendChild(tr);
    }
}

/**
 * Creates at least (container.props.length + 2) columns and adds them to the given
 * table row {@code tr}. The first column contains the row number following the columns 
 * for each property in the container. The last column is the button bar created by 
 * the following method {@link #createButtonRow(number)}.
 * 
 * @param {number} [i] the row number to insert the row at
 * @param {Object} container the docker container object containing the table data
 * @return the table row {DOMObject} that was created
 */
var createTableRowFromContainer = function(i, container) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<th scope="row">' + (i + 1) + '</th>';
    
    for(var prop in container) {
        var td = document.createElement('td');
        td.innerHTML = container[prop];
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
                ' <button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="Container clonen und starten" onclick="handleDuplicateButton(\''+id+'\');">' + 
                    '<span class="glyphicon glyphicon-duplicate"></span>' + 
                '</button>' + 
                '<button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="Container stoppen und löschen" onclick="handleDeleteButton(\''+id+'\');">' + 
                    '<span class="glyphicon glyphicon-stop"></span>' + 
                '</button>' + 
            '</div>';

}
