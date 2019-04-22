// Setup basic express server
//const fs = require('fs');

var express = require('express');
var app = express();
//var path = require('path');
//const https = require('https')

/*
var server = require('https').createServer({
	key: fs.readFileSync('hanajung.key'),
    cert: fs.readFileSync('hanajung.crt')
}, app);
*/

var server = require('http').createServer(app);

var io = require('socket.io')(server);
var port = process.env.PORT || 8085;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
//app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

// Chatroom

var numUsers = 0;
var userNames = {};
const defaultRoom = 'Lobby';
var rooms = [defaultRoom]; //default room Lobby

io.on('connection', (socket) => {
  
  console.log("user socket id: " + socket.id);

  var addedUser = false;

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {

	 console.log("addedUser => " + addedUser + ', username => ' + username + ', socket id => ' + socket.id);

    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
	socket.room = defaultRoom; //set by default "Lobby"
	userNames[username] = username;
	socket.join(defaultRoom);

	console.log('socket join room => ' + socket.room);

    ++numUsers;
    addedUser = true;

	//echo user for welcome message from client, only one
    socket.emit('login', {
      numUsers: numUsers
    });
	
    // echo globally (all clients) that a person has connected
	socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
	
	//other update chat message welcome
	socket.emit('updatechat', 'SERVER', 'you have connected to ' + defaultRoom);
	socket.broadcast.to(defaultRoom).emit('updatechat', 'SERVER', username + ' has connected to this room'); //Lobby
    socket.emit('updaterooms', rooms, defaultRoom);

  });
	
  //when client create new room
  socket.on('create room', function(room) {
      rooms.push(room);
      socket.emit('updaterooms', rooms, socket.room);
  });

  socket.on('switchRoom', function(newroom) {
	var oldroom;
	oldroom = socket.room;

	console.log('switch room, old room => ' + oldroom + ', new room => ' + newroom);

	socket.leave(socket.room);
	socket.join(newroom);
	socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
	socket.broadcast.to(oldroom).emit('updatechat', 'SERVER', socket.username + ' has left this room');
	socket.room = newroom;
	socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
	socket.emit('updaterooms', rooms, newroom);
  });

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {

	console.log('new msg: => ' + data + ', room => ' + socket.room);

	//io.sockets["in"](socket.room).emit('updatechat', socket.username, data);
	//Mesasge for client with room
	io.sockets["in"](socket.room).emit('new message', {
      username: socket.username,
      message: data
	});
	 
  });

   //send private message to someone by socket id
  socket.on('send private someone', (data) => {
	    console.log("private msg from server, " + data.socketId)
		// sending to individual socketid (private message)
		io.to(data.socketId).emit('private message', {username: socket.username, message: data.message + ', From:' + socket.id});
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
	  	
	  //Room action
	  delete usernames[socket.username];
	  io.sockets.emit('updateusers', usernames); //update user in client ****
	  socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	  socket.leave(socket.room);

    }
  });


 // when the client emits 'typing', we broadcast it to others
  socket.on('add notification', (data) => {
    socket.broadcast.emit('notification', {
      message: data
    });
  });

});