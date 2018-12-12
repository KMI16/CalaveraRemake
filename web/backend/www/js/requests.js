var baseURL = 'http://127.0.0.1:8000/api/containers';

var fetchTableData = function() {
    getRequest("");
}

var handleDeleteButton = function (dockerID) {
//    deleteRequest(dockerID);
//    postRequest(dockerID);
}


var handleDuplicateButton = function (dockerID) {
    getRequest('/' + dockerID);
}

var deleteRequest = function (dockerID) {
    var url = baseURL + '/' + dockerID;
    sendRequest(url, 'DELETE', null, null, function (http) {
        console.log(http.responseText);
    });
}

var getRequest = function (url) {
    var url = baseURL + url;
    sendRequest(url, 'GET', null, null, function (http) {
        var containers = JSON.parse(http.responseText).containers;
        var table = document.getElementById('container-table').getElementsByTagName('tbody')[0];
        
        // clear table 
        table.innerHTML = null;        
        
        for(var i = 0; i < containers.length; i++) {
            console.log(containers[i].id);
            
            var tr = document.createElement('tr');

            var numberCol = document.createElement('td');
            numberCol.innerHTML = (i+1);
            tr.appendChild(numberCol);

            for(var prop in containers[i]) {
                var td = document.createElement('td');
                td.innerHTML = containers[i][prop];
                tr.appendChild(td);
            }

            var buttonCol = document.createElement('td');
            buttonCol.innerHTML = createButtonRow(i);
            tr.appendChild(buttonCol);
            
            table.appendChild(tr);
        }
    });
}

var createButtonRow = function(i) {
    // var div = document.createElement('div');
    // div.className += " btn-group";

    // var btnPencil = document.createElement('button');


    
    return '<div class="btn-group" role="group" aria-label="...">' + 
                                '<button type="button" class="btn btn-default">' + 
                                    '<span class="glyphicon glyphicon-pencil"></span>' + 
                                '</button>' + 
                               ' <button type="button" class="btn btn-default" onclick="handleDuplicateButton(1);">' + 
                                    '<span class="glyphicon glyphicon-duplicate"></span>' + 
                                '</button>' + 
                                '<button type="button" class="btn btn-default" onclick="handleDeleteButton(1);">' + 
                                    '<span class="glyphicon glyphicon-trash"></span>' + 
                                '</button>' + 
                            '</div>';

}

var postRequest = function (dockerID) {
    var url = baseURL;
    var data = {};
    data.dockerID = dockerID;
    data.name = "Foo";

    sendRequest(url, 'POST', JSON.stringify(data), 'application/json; charset=utf-8', function (http) {
        console.log(http.responseText);
    });
}


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

var updateTable = function (containers) {
    //TODO update table
}
