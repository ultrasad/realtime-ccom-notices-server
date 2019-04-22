//module.exports = function(io, server) {
    module.exports = function(app, io) {
    //var socketIO = require('socket.io').listen(server);
    //app.set('io', socketIO);
    app.set('io', io);
    
    //require('../app/controllers/socketio.controller')(socketIO); //chat controller
    require('../app/controllers/socketio.controller')(io); //chat controller

    /*
	global.socketIO = socketIO;

	socketIO.set("transports", ["xhr-polling"]);
	socketIO.sockets.on('connection', function (socket) {

	  socket.on('disconnect', function () {
	  });

    });
    */

}