var Users = require('mongoose').model('Users'); //call module mongoose, Chat model
module.exports = function(io){
    
    // Chatroom

    var numUsers = 0;
    var userNames = {};
    const defaultRoom = 'Lobby';
    //var rooms = [defaultRoom]; //default room Lobby
    var rooms = []; //default empty
    var userRooms = {};
    //var userSocket = {};
    var userInfo = [];

    console.log("Chat Lobby >>>");

    io.on('connection', (socket) => {
    
    //console.log("socketio controller, user socket id: " + socket.id);
    
    var addedUser = false;
    
    // when the client emits 'add user', this listens and executes
    socket.on('add user', (username) => {

        console.log("addedUser => " + addedUser + ', username => ' + username + ', socket id => ' + socket.id);
        
        if (addedUser) return;

        /*
        var query  = Users.where({ username: 'username' });
            query.findOne(function (err, user) {
            
            console.log('user err => ' + err);

            if (err) return handleError(err);
            if (user) {
                console.log('user exists => ' + user);
                // doc may be null if no document matched
            }
        });
        */
        
        // check user rooms
        Users.findOne({username:username}, function (err, user, next) {
            
            console.log('if err => ' + err +', user => '+ user + ', next => ' + next);

            if (err) return next(err);
            /*
            if(err){
                var err = new Error('User: '+ username +' does not exists.');
                // Add user as a custom property
                err.user = err;
                next(err);  
            } 
            */
            
            //fix default undefined
            socket.username = undefined;

            if(user){

                console.log("User: ", user._id, user.username, user.first_name, user.last_name, user.groups);
                console.log("default user rooms => " + userRooms[username]);

                //var clientInfo = new Object();
                /*
                var clientInfo = {};
                clientInfo.customId = user._id;
                clientInfo.clientId = socket.id;
                userInfo.push(clientInfo);
                */
                
                userInfo[username] = userInfo[username] || [];
                //userInfo[user._id] = [];
                userInfo[username].push(socket.id);

                console.log('userInfo => ' + userInfo[username]);
                
                socket.username = username;
                var user_rooms = [];
                
                var arrayLength = user.groups.length;
                for (var i = 0; i < arrayLength; i++) {
                    //console.log('user group: ', user.groups[i].group_id, user.groups[i].group_name);
                    console.log('user group: ', user.groups[i].group_id, user.groups[i].group_name);

                    if (user_rooms.indexOf(user.groups[i].group_name) == -1) {
                        user_rooms.push(user.groups[i].group_name);
                        //userRooms[username] = user.groups[i].group_name;
                        
                        console.log('user rooms => ' + userRooms[socket.username]);
                        
                        //rooms.push(user.groups[i].group_name);
                        //console.log("push rooms => " + rooms);
                    }
                    
                    /*
                    //Push user rooms, check exists
                    if (rooms.indexOf(user.groups[i].group_name) == -1) {
                        //rooms.push(user.groups[i].group_name);
                        //console.log("exists rooms => " + rooms);
                        
                        //2019-03-04, push user rooms
                        user_rooms.push(user.groups[i].group_name);
                        //userRooms[username] = user.groups[i].group_name;
                        
                        console.log('user rooms => ' + userRooms[username]);
                        
                        rooms.push(user.groups[i].group_name);
                        console.log("push rooms => " + rooms);
                    } else {
                        //rooms.push(user.groups[i].group_name);
                        //console.log("push rooms => " + rooms);
                
                        console.log("exists rooms => " + rooms);
                    }
                    */
                }

                userRooms[socket.username] = user_rooms;
                
                //Update rooms
                //socket.emit('updaterooms', rooms, socket.room);
                //2019-03-04, update user rooms

                console.log('socket.room => ' + socket.room + ', userRooms => ' + userRooms[socket.username]);
                socket.emit('updaterooms', userRooms[socket.username], socket.room);

                //** socket user */
                // we store the username in the socket session for this client
                //socket.username = username;
                socket.room = defaultRoom; //set by default "Lobby"
                userNames[socket.username] = username;
                //socket.join(defaultRoom); //old ok

                //2019-03-08, join all user room
                for(var user_group of user.groups) {
                    console.log('user group join => '+ username + ',group => '+ user_group.group_name);
                    socket.join(user_group.group_name);
                }

                console.log('socket join room => ' + socket.room);

                ++numUsers;
                addedUser = true;

                //echo user for welcome message from client, only one
                socket.emit('login', {
                    numUsers: numUsers,
                    login: true
                });
                
                // echo globally (all clients) that a person has connected
                socket.broadcast.emit('user joined', {
                    username: socket.username,
                    numUsers: numUsers
                });
                
                //other update chat message welcome
                socket.emit('updatechat', 'SERVER', 'you have connected to ' + defaultRoom);
                socket.broadcast.to(defaultRoom).emit('updatechat', 'SERVER', socket.username + ' has connected to this room'); //Lobby
                //socket.emit('updaterooms', rooms, defaultRoom);
                //2019-03-04, update user rooms
                socket.emit('updaterooms', userRooms[socket.username], defaultRoom);
            } else {
                //echo user for welcome message from client, only one
                socket.emit('login', {
                    numUsers: numUsers,
                    login: false,
                    msg: "User "+ username +" does not exists."
                });
            }
        
        });

        /*
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
        */

    });
        
    //when client create new room
    socket.on('create room', function(room) {
        rooms.push(room);
        socket.emit('updaterooms', rooms, socket.room);
    });
        
    /*
    socket.on('sendchat', function(data) {
            io.sockets["in"](socket.room).emit('updatechat', socket.username, data);
    });
    */

    socket.on('switchRoom', function(newroom) {
        
        var oldroom;
        oldroom = socket.room;

        console.log('switch room, old room => ' + oldroom + ', new room => ' + newroom);

        //old OK
        /*
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
        socket.broadcast.to(oldroom).emit('updatechat', 'SERVER', socket.username + ' has left this room');
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
        //socket.emit('updaterooms', rooms, newroom);
        
        socket.emit('updaterooms', userRooms[socket.username], newroom);
        */

       console.log('socket username => ' + socket.username + ', length => ' + userInfo[socket.username].length);

       for (var i in io.sockets.connected) {
            console.log('client connect => ' + i);
            //var s = io.sockets.connected[i];
            //console.log('client  => ' + s);
       }
       
       for(var user_socket of userInfo[socket.username]) {
            console.log('user socket id => ' + user_socket + ', new room => ' + newroom);
            var socket_user = io.sockets.connected[user_socket];
            
            //2019-03-08, not leave other room
            //socket_user.leave(socket.room); //old ok
            socket_user.join(newroom);
            socket_user.room = newroom;

            socket_user.emit('updaterooms', userRooms[socket.username], newroom);

            //io.sockets.connected[socketID].emit('updaterooms', userRooms[socket.username], newroom);
            /*
            io.sockets.connected[socketID].leave(socket.room);
            io.sockets.connected[socketID].join(newroom);

            io.sockets.connected[socketID].room = newroom;
            io.sockets.connected[socketID].emit('updaterooms', userRooms[socket.username], newroom);
            */
        }

    });
        
    /*
    socket.on('disconnect', function() {
        delete usernames[socket.username];
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });
    */

    // when the client emits 'new message', this listens and executes
    socket.on('new message', (data) => {
        /*OK for all client
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
        username: socket.username,
        message: data
        });
        */

        console.log('new msg: => ' + data + ', room => ' + socket.room);

        //io.sockets["in"](socket.room).emit('updatechat', socket.username, data);
        //Mesasge for client with room
        io.sockets["in"](socket.room).emit('new message', {
            room: socket.room,
            username: socket.username,
            message: data
        });
        
    });

    //send private message to someone by socket id
    socket.on('send private someone', (data) => {
            console.log("private msg from server, " + data.socketId)
            // sending to individual socketid (private message)
            //io.to(data.socketId).emit('private message', {username: socket.username, message: data.message + ', From:' + socket.id});

            //2019-03-05, loop for user socket
            for(var user_socket of userInfo[data.username]) {
                console.log('user socket id => ' + user_socket);
                //io.to(user_socket).emit('private message', {username: socket.username, message: data.message + ', From:' + socket.id});
                io.to(user_socket).emit('private message', {username: socket.username, message: data.message});
            }

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

            //delete user info by socket id
            //userInfo[socket.username].filter(user => user !== socket.id);
            const secket_index = userInfo[socket.username].indexOf(socket.id);
            console.log('del index => ' + secket_index);

            if (secket_index >= 0) {
                userInfo[socket.username].splice(secket_index, 1);
            }

            console.log('del user disconnect => ' + userInfo[socket.username] + ', count user current => ' + userInfo[socket.username].length);
            
            //Room action
            //delete usernames[socket.username];
            //2019-03-05, check current user online
            if(userInfo[socket.username].length < 1){
                delete userNames[socket.username];
                io.sockets.emit('updateusers', userNames); //update user in client ****
                socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
                socket.leave(socket.room);
            }

        }
    });

    /*
        socket.on('disconnect', function() {
            delete usernames[socket.username];
            io.sockets.emit('updateusers', usernames);
            socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
            socket.leave(socket.room);
        });
    */


    // when the client emits 'typing', we broadcast it to others
    socket.on('add notification', (data) => {
        socket.broadcast.emit('notification', {
        message: data
        });
    });

    //test change on local to server, ftp-simple, Remote directory open to workspace (Beta version)
    //local to server ahh
    //(Caution : So remote delete a files is only possible using 'Delete' in the context menu)

    });

}