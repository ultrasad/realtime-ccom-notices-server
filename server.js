process.env.NODE_ENV = process.env.NODE_ENV || 'development'; //set default if nil, (production, development)
var mongoose = require('./config/mongoose');
var express = require('./config/express');

var db = mongoose(); //load first, db
//var app = express(); //new express()
var server = express(); //new express server
var port = process.env.PORT || 8085;

//var server = require('http').createServer(app);
//var socketio = require('socket.io')(server);
//app.set('io', socketio);

//app.listen(port);
/*
var server = app.listen(port, () => {
    console.log('Server listening at port %d', port);
});
*/

//2019-04-16, move app into express and return server
server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

//socket io
//require('./config/socket-io')(app, server);

//export app
//module.exports = app;

//console.log('server running....');
//console.log('Server running at http://localhost:'+ port);