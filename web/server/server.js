var express = require('express');
var app = express();

app.use(express.static(__dirname + '/www/'));

app.listen('4200');
console.log('working on 4200');
