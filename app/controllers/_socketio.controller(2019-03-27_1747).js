var Users = require('mongoose').model('Users'); //call module mongoose, Chat model
var Broadcasts = require('mongoose').model('Broadcasts'); //call module mongoose, Broadcasts model

var Crypto = require('crypto');
var Groups = require('mongoose').model('Groups'); //call module mongoose, Chat model

const db = require('mongoose');

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

    var userRoomMembers = {};

    //var roomMsg;

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
                socket.userid = user._id;
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
                    userid: socket.userid,
                    login: true
                });
                
                // echo globally (all clients) that a person has connected
                socket.broadcast.emit('user joined', {
                    username: socket.username,
                    userid: socket.userid,
                    numUsers: numUsers
                });
                
                //other update chat message welcome
                socket.emit('updatechat', 'SERVER', 'you have connected to ' + defaultRoom);
                socket.broadcast.to(defaultRoom).emit('updatechat', 'SERVER', socket.username + ' has connected to this room'); //Lobby
                //socket.emit('updaterooms', rooms, defaultRoom);
                //2019-03-04, update user rooms
                socket.emit('updaterooms', userRooms[socket.username], defaultRoom);

                //2019-03-11, find broadcast room
                Broadcasts.findOne({"groups.group_name":defaultRoom}, function (err, msg, next) {
                    if (err) return next(err);
                    
                    console.log('broadcast msg => ' + msg.message);
                    socket.emit('broadcast room message', {message: msg.message, priority:msg.priority});
                });
                
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

    //2019-03-26, socket get users room
    socket.on('members room', function(room) {
        
        // if(userInfo[socket.username].length < 1)
        //console.log('userRoomMembers => ' + userRoomMembers[room]);
        //if ((typeof userRoomMembers[room] === 'undefined')) {
        if(!userRoomMembers[room] || Object.keys(userRoomMembers[room]).length === 0){
            var member_in_room = [];

            Users.find({'groups.group_name':room}, function (err, members, next) {
                if (err) return next(err);
                
                for(var user of members) {
                    //console.log('new user room => '+ room + ',username => '+ user.username +', user id => '+ user._id);
                    member_in_room.push({username:user.username, firstname: user.first_name, userid:user._id});
                }
            });

            userRoomMembers[room] = member_in_room;
            socket.emit('updateMemberRooms', room, userRoomMembers[room]);
            
        } else {
            console.log('member room is exists => ' + room);
            socket.emit('updateMemberRooms', room, userRoomMembers[room]);
            /*
            userRoomMembers[room].forEach(function (member) {
                console.log('member exists in array => ' + member.username + ', user id =>' + member.userid);
            });
            */

            /*for (var client in userRoomMembers[room] ) {
                console.log('user room exists => '+ room + ',username => '+ client);
            }*/
        }

        //socket.emit('updateMemberRooms', room, userRoomMembers[room]);

        /*
        //var rooms = io.sockets.clients(room);
        var clients = io.sockets.adapter.rooms[room].sockets;

        //to get the number of clients
        var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;

        console.log('Members rooms => ' + room + ', num clinet access to room => ' + numClients);
        for (var clientId in clients ) {

            console.log('clientId rooms => ' + clientId);

            //this is the socket of each client in the room.
            //var clientSocket = io.sockets.connected[clientId];
       
            //you can do whatever you need with this
            //clientSocket.emit('new event', "Updates");
       }
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

       //2019-03-11, find broadcast room
       Broadcasts.findOne({"groups.group_name":newroom}, function (err, msg, next) {
            if (err) return next(err);
            
            console.log('newroom, broadcast msg => ' + msg.message + ', room => ' + newroom);
            //roomMsg = msg.message;
            //socket.emit('broadcast room message', {message: msg.message});

            //update all client, multiple socket id
            for(var user_socket of userInfo[socket.username]) {
                console.log('user socket id => ' + user_socket + ', new room => ' + newroom);
                var socket_user = io.sockets.connected[user_socket];
                
                //2019-03-08, not leave other room
                //socket_user.leave(socket.room); //old ok
                socket_user.join(newroom);
                socket_user.room = newroom;
    
                socket_user.emit('updaterooms', userRooms[socket.username], newroom);
    
                //update room msg to user
                socket_user.emit('broadcast room message', {message: msg.message, priority:msg.priority});
            }
       });

       //console.log('newroom msg ==> ' + roomMsg);
       
       //update all client, multiple socket id
       /*
       for(var user_socket of userInfo[socket.username]) {
            console.log('user socket id => ' + user_socket + ', new room => ' + newroom);
            var socket_user = io.sockets.connected[user_socket];
            
            //2019-03-08, not leave other room
            //socket_user.leave(socket.room); //old ok
            socket_user.join(newroom);
            socket_user.room = newroom;

            socket_user.emit('updaterooms', userRooms[socket.username], newroom);

            //update room msg to user
            socket_user.emit('broadcast room message', {message: roomMsg});
        }
        */

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
            
            //2019-03-26, check user to user group for send message to room


            //2019-03-05, loop for user socket
            for(var user_socket of userInfo[data.username]) {
                console.log('user socket id => ' + user_socket);
                //io.to(user_socket).emit('private message', {username: socket.username, message: data.message + ', From:' + socket.id});
                io.to(user_socket).emit('private message', {username: socket.username, message: data.message});
            }
    });

    //2019-03-26, chat with friend
    socket.on('chat with friend', (data) => {

        //Check if user1’s id is less than user2's
        var group_id = undefined;
        var members = [];
        var userIds = [];
        if(data.userID < data.friendID){
            console.log('user1’s id is less than user2');
            var group_id = data.userID+data.friendID;
            var members = [{member_id:db.Types.ObjectId(data.userID), member_name:data.userName}, {member_id:db.Types.ObjectId(data.friendID), member_name: data.friendName}];
        } else{
            console.log('user2’s id is less than user1');
            var group_id = data.friendID+data.userID;
            var members = [{member_id:db.Types.ObjectId(data.friendID), member_name: data.friendName}, {member_id:db.Types.ObjectId(data.userID), member_name:data.userName}];
        }
        
        if(group_id !== undefined){
            console.log('group id => ' + group_id);
            
            var hashUserGroup = Crypto.createHash('md5').update(group_id).digest("hex");
            console.log('hashUserGroup => ' + hashUserGroup);

            Groups.findOne({hash_name:hashUserGroup}, function (err, group, next) {
                
                console.log('if err => ' + err +', group => '+ group + ', next => ' + next);
                if (err) return next(err);
                
                if (!group) {
                    // do stuff here
                    console.log('group not match, create new user chat group, friend group');

                    console.log('ObjectId userID => ' + db.Types.ObjectId(data.userID));
                    
                    // a document instance
                    var userFriend = new Groups({type:'friend', name:group_id, hash_name:hashUserGroup, members:members});
                    
                    // save model to database
                    userFriend.save(function (err, group) {
                        if (err) return console.error(err);
                        console.log(group._id + " saved to group collection.");
                        
                        //push group to user, friend
                        userIds = [{userid:db.Types.ObjectId(data.userID),'userinfo':{group_id:db.Types.ObjectId(group._id), 'group_name':data.friendName, 'hash_name':hashUserGroup}}, {userid:db.Types.ObjectId(data.friendID),'userinfo':{group_id:db.Types.ObjectId(group._id), 'group_name':data.userName, 'hash_name':hashUserGroup}}];
                        for(var user of userIds){
                            console.log('user id => '+ user.userid + ', user info group id => ' + user.userinfo.group_id +', user info group name => '+ user.userinfo.group_name +', hash name => '+ user.userinfo.hash_name);
                            Users.findOneAndUpdate({_id:db.Types.ObjectId(user.userid)}, {$push: {"groups": {group_id: user.userinfo.group_id, group_name: user.userinfo.group_name, 'hash_name':user.userinfo.hash_name, type:'friend'}}}, {safe: true, upsert: true, new : true}, function(err, user, next){
                                if (err) return next(err);
                                
                                if(user){
                                    console.log('update user group success => ' + user);
                                }
                            });
                        }

                        /*
                        Users.update({
                            _id : { $in : userIds }
                        }, {
                            $pullAll : { groups : [groupInfo] }
                        }, { // {active: false}
                            multi : true
                        }, function(err, count) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(count);
                            }
                        });
                        */

                    });

                } else {
                    console.log('group match, hash_name =>' + hashUserGroup + ', already exists in collection.');
                }
                
                console.log('out >>');
            });
        } else {
            console.log('group is null.......');
        }
        
        console.log('chat with friend, user id => ' + data.userID + ', friend id => ' + data.friendID + ', group id => ' + group_id + ', hash => ' + hashUserGroup);
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