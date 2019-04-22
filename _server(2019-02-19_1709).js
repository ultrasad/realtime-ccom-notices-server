// Setup basic express server
const fs = require('fs');

var express = require('express');
var app = express();
var path = require('path');

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
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

// Chatroom

var numUsers = 0;

io.on('connection', (socket) => {
  
  console.log("user socket id: " + socket.id);

  var addedUser = false;

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {

	 console.log("addedUser => " + addedUser + ', username => ' + username + ', socket id => ' + socket.id);

    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
	
    // echo globally (all clients) that a person has connected
	socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });

  });

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
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
    }
  });


 // when the client emits 'typing', we broadcast it to others
  socket.on('add notification', (data) => {
    socket.broadcast.emit('notification', {
      message: data
    });
  });


});
