module.exports = function(app, server) {
    var socketIO = require('socket.io').listen(server);
    app.set('io', socketIO);
    
    require('../app/controllers/socketio.controller')(socketIO); //chat controller

    /*
	global.socketIO = socketIO;

	socketIO.set("transports", ["xhr-polling"]);
	socketIO.sockets.on('connection', function (socket) {

	  socket.on('disconnect', function () {
	  });

    });
    */

}