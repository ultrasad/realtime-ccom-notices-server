var UsersModel = require('mongoose').model('Users'); //call module mongoose, Chat model
var BroadcastsModel = require('mongoose').model('Broadcasts'); //call module mongoose, Broadcasts model

var SocketIOService = require('../services/socketio.service');

var Crypto = require('crypto');
var GroupsModel = require('mongoose').model('Groups'); //call module mongoose, Chat model

const db = require('mongoose');
//var util = require('util');

module.exports = function(io){
    
    // Chatroom

    var numUsers = 0;
    var userNames = {};
    //const defaultRoom = 'Lobby';
    //var current_group = {group_name:defaultRoom, group_hash: '0d4c3d1b3f0c14e4aae9e9598ed745db', group_type: 'group'};
    //var default_group = {group_name:'Social', group_hash: 'f431e17ea0081a3c9e51fc240221ee21', group_type: 'group'};
    var default_group = {group_id: db.Types.ObjectId("5c6f8788cc70d66309e7742e"), group_name:'Lobby', group_hash: '0d4c3d1b3f0c14e4aae9e9598ed745db', group_type: 'group'};
    
    //arr user current group, via default group
    //var current_group = [];
    
    //var rooms = [defaultRoom]; //default room Lobby
    var rooms = []; //default empty
    //var userRooms = {};
    //var userGroups = {};
    //2019-04-03 1900, change object to array
    var userGroups = [];
    //var userSocket = {};

    //array list of socketid in user
    //var userInfo = [];
    var userSocket = [];

    var userRoomMembers = {};

    //var roomMsg;

    console.log("Chat Lobby >>>");
    
    io.on('connection', (socket) => {
    
    //console.log("socketio controller, user socket id: " + socket.id);
    
    var addedUser = false;
    
    //2019-04-01, call update room, all socket user
    var call_update_room = function(group, username, uID){
        console.log('call update room....' + group + ', username => ' + username + ', uID => ' + uID);

        BroadcastsModel.findOne({"groups.group_hash":group.group_hash}, function (err, msg, next) {
            console.log('err => ' + err);
            if (err) return next(err);

            //console.info('userSocket  username => ' + username + ', inspect => ' + util.inspect(userSocket[username]));
            //console.info('userGroups[uID] => ' + uID + ', inspect => ' + util.inspect(userGroups[uID]));
            
            //for(var user_socket of userSocket[socket.username]) {
                for(var user_socket of userSocket[username]) {
                //console.log('user socket id => ' + user_socket + ', username => ' + username + ', new room => ' + group.group_name);
                var socket_user = io.sockets.connected[user_socket];
                
                //2019-03-08, not leave other room
                //socket_user.leave(socket.room_hash); //old ok
                
                //socket_user.join(newroom);
                //socket_user.room = newroom;

                //socket_user.join(group.group_hash);
                socket_user.join(group.group_id);
                socket_user.room_id = socket_user.group_id;
                socket_user.room_hash = group.group_hash;
                socket_user.room_name = group.group_name;

                //socket_user.emit('updaterooms', userGroups[socket.userid], group);
                socket_user.emit('updaterooms', userGroups[uID], group);

                //update room msg to user
                if(msg){
                    socket_user.emit('broadcast room message', {message: msg.message, priority:msg.priority});
                } else {
                    //2019-03-28, emit hide broadcast msg
                    console.log('hide broadcast msg >>>');
                }
            }
        });
    }
    
    // when the client emits 'add user', this listens and executes
    socket.on('add user', (username) => {

        console.log("addedUser => " + addedUser + ', username => ' + username + ', socket id => ' + socket.id);
        
        if (addedUser) return;

        //fix default undefined
        socket.username = undefined;

        //call get user
        var callUsersPromise = async () => {
            var result = await (SocketIOService.getUser({username:username}));
            return result;
        };

        callUsersPromise().then(function(user) {
        
            //console.log("User: ", user._id, user.username, user.first_name, user.last_name, user.groups);
            //console.log("default user rooms => " + userGroups[username]);
            
            userSocket[username] = userSocket[username] || [];
            userSocket[username].push(socket.id);
            
            console.log('userSocket user name => ' + userSocket[username]);
            
            socket.username = username;
            socket.userid = user._id;

            //userGroups[socket.userid] = userGroups[socket.userid] || [];

            //if(!userGroups[socket.userid] || Object.keys(userGroups[socket.userid]).length === 0){
            if(!userGroups[socket.userid]){
                console.log('empty userGroup socket id => ' + socket.userid);
                userGroups[socket.userid] = [];
                var arrayLength = user.groups.length;
                for (var i = 0; i < arrayLength; i++) {
                    //console.log('user group: ', user.groups[i].group_id, ', group name => ' + user.groups[i].group_name);

                    if (userGroups[socket.userid].indexOf(user.groups[i].group_hash) == -1) {
                        userGroups[socket.userid].push({group_id:user.groups[i].group_id, group_name:user.groups[i].group_name, 'group_hash':user.groups[i].group_hash, group_type:user.groups[i].group_type});
                        
                        //console.log('user rooms => ' + userGroups[socket.userid]);
                    }
                }
            }

                //userGroups[socket.userid] = user_rooms;
            //}

            //var user_rooms = [];
            //2019-04-01, user group
            /*
            if(!userGroups[socket.userid] || Object.keys(userGroups[socket.userid]).length === 0){
                var arrayLength = user.groups.length;
                for (var i = 0; i < arrayLength; i++) {
                    console.log('user group: ', user.groups[i].group_id, ', group name => ' + user.groups[i].group_name);

                    if (user_rooms.indexOf(user.groups[i].group_hash) == -1) {
                        user_rooms.push({group_id:user.groups[i].group_id, group_name:user.groups[i].group_name, 'group_hash':user.groups[i].group_hash, group_type:user.groups[i].group_type});
                        
                        console.log('user rooms => ' + userGroups[socket.userid]);
                    }
                }

                userGroups[socket.userid] = user_rooms;
            }
            */
            
            //userGroups[socket.username] = user_rooms;
            
            //Update rooms
            //socket.emit('updaterooms', rooms, socket.room);
            //2019-03-04, update user rooms
            
            //2019-03-28, hide this check response
            //socket.emit('updaterooms', userGroups[socket.username], current_group);
            console.log('default_group type => ' + default_group.group_type + ', default_group name => ' + default_group.group_name);

            //** socket user */
            // we store the username in the socket session for this client
            //socket.username = username;
            socket.room_id = default_group.group_id;
            socket.room_hash = default_group.group_hash; //set by default "Lobby", 2019-03-29 replace with group hash
            socket.room_name = default_group.group_name;
            userNames[socket.username] = username;
            //socket.join(defaultRoom); //old ok

            //console.log('socket room => ' + socket.room_hash  + 'socket room name => ' + socket.room_name + ', userGroups => ' + userGroups[socket.userid]);
            //socket.emit('updaterooms', userGroups[socket.username], socket.room_hash);

            //2019-03-08, join all user room
            for(var user_group of user.groups) {
                //console.log('user group join => '+ username + ',group => '+ user_group.group_name);
                //socket.join(user_group.group_name);

                //console.log('user group join => '+ username + ', group => '+ user_group.group_name + ', group id => ' + user_group.group_id + ', group hash ' + user_group.group_hash);
                //socket.join(user_group.group_hash);
                //2019-04-05, change hash to group id
                socket.join(user_group.group_id);
            }

            console.log('socket join room hash => ' + socket.room_hash + ', room name => ' + socket.room_name);

            //2019-04-02, hide this
            /*
            ++numUsers;
            addedUser = true;

            //echo user for welcome message from client, only one
            socket.emit('login', {
                numUsers: numUsers,
                userid: socket.userid,
                login: true
            });
            */
            
            // echo globally (all clients) that a person has connected
            //2019-04-01, check socket room via user current room
            console.log('socket.room_id => ' + socket.room_id + ', default_group.group_id => ' + default_group.group_id);
            if(socket.room_id == default_group.group_id){

                ++numUsers;
                addedUser = true;

                //echo user for welcome message from client, only one
                socket.emit('login', {
                    userid: socket.userid,
                    username: socket.username,
                    numUsers: numUsers,
                    room_id: socket.room_id,
                    room_hash: socket.room_hash,
                    room_name: socket.room_name,
                    login: true
                });

                //default join
                //2019-04-04, hide msg user join
                /*
                socket.broadcast.emit('user joined', {
                    userid: socket.userid,
                    username: socket.username,
                    numUsers: numUsers,
                    room_hash: socket.room_hash,
                    room_name: socket.room_name
                });
                */

            }
            
            //other update chat message welcome
            socket.emit('updatechat', 'SERVER', {username: socket.username, group_id:default_group.group_id, group_name: default_group.group_name, 'group_hash':default_group.group_hash, msg:'you have connected to ' + default_group.group_name});
            //2019-04-04, hide this on chat group
            //socket.broadcast.to(default_group.group_hash).emit('updatechat', 'SERVER', {username: socket.username, group_name: default_group.group_name, 'group_hash':default_group.group_hash, msg:socket.username + ', hash group => ' + default_group.group_hash + ', has connected to this room'}); //Lobby
            //socket.emit('updaterooms', rooms, defaultRoom);
            //2019-03-04, update user rooms
            //2019-04-01, hide this test
            //socket.emit('updaterooms', userGroups[socket.userid], default_group);
            
            //2019-04-01, call update room
            call_update_room(default_group, username, socket.userid);

        }).catch(function(err){
            console.log('err =>', err.message);
            socket.emit('login', {
                numUsers: numUsers,
                login: false,
                msg: "User "+ username +" does not exists."
            });
        });

    });

    //2019-03-26, socket get users room
    socket.on('members room', function(current_room) {

        console.log('call member room => ' + current_room.group_name);
        
        if(!userRoomMembers[current_room.group_hash] || Object.keys(userRoomMembers[current_room.group_hash]).length === 0){
            console.log('userRoomMembers does not exists.'  + current_room.group_name);
            var member_in_room = [];

            var callUsersGroupsPromise = async () => {
                var result = await (SocketIOService.getUsersGroups({'groups.group_hash':current_room.group_hash}, page=0, limit=50));
                return result;
            };

            callUsersGroupsPromise().then(function(usersGroups) {

                usersGroups.forEach(function(user) {
                    member_in_room.push({username:user.username, firstname: user.first_name, userid:user._id});
                });
                
                userRoomMembers[current_room.group_hash] = member_in_room;
                socket.emit('updateMemberRooms', current_room.group_hash, userRoomMembers[current_room.group_hash]);

            }).catch(function(err){
                console.log('err =>', err.message);
            });
            
        } else {
            console.log('member room is exists => ' + current_room.group_name);
            socket.emit('updateMemberRooms', current_room.group_hash, userRoomMembers[current_room.group_hash]);
        }

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

    socket.on('switchRoom', function(group) {
        
        //const newroom = group.group_name;
        //const group_hash = group.hash_name;
        //const group_type = group.group_type;

        //2019-04-01, hide current to default fix
        //current_group.group_name = group.group_name;
        //current_group.group_hash = group.group_hash;
        //current_group.group_type = group.group_type;

        var oldroom;
        oldroom = socket.room_hash;

        socket.room_id = group.group_id;
        socket.room_hash = group.group_hash;
        socket.room_name = group.group_name;

        console.log('switch room, old room => ' + oldroom + ', new current room => ' + group.group_name);

        //old OK
        /*
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
        socket.broadcast.to(oldroom).emit('updatechat', 'SERVER', socket.username + ' has left this room');
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
        //socket.emit('updaterooms', rooms, newroom);
        
        socket.emit('updaterooms', userGroups[socket.username], newroom);
        */

       console.log('socket username => ' + socket.username + ', length => ' + userSocket[socket.username].length);

       for (var i in io.sockets.connected) {
            console.log('client connect => ' + i);
            //var s = io.sockets.connected[i];
            //console.log('client  => ' + s);
       }

       //2019-03-11, find broadcast room
       if(group.group_type == 'direct'){
           console.log('group friend...');
            //update all client, multiple socket id
            for(var user_socket of userSocket[socket.username]) {
               console.log('user socket id => ' + user_socket + ', new current room => ' + group.group_name);
               var socket_user = io.sockets.connected[user_socket];
                
                //2019-03-08, not leave other room
                //socket_user.leave(socket.room); //old ok
                //2019-03-28, old ok
                /*
                socket_user.join(newroom);
                socket_user.room = newroom;
    
                socket_user.emit('updaterooms', userGroups[socket.username], newroom);
                */
               
               //socket_user.join(group_hash);
               //socket_user.room = group_hash;

               //socket_user.join(group.group_hash);
               socket_user.join(group.group_id);
               socket_user.room_id = group.group_id;
               socket_user.room_hash = group.group_hash;
               socket_user.room_name = group.group_name;
               
               
               //let group_info = {user_rooms: userGroups[socket.username], current_group_name:newroom, current_group_hash: group_hash, current_group_type: group_type};
               //socket_user.emit('updaterooms', userGroups[socket.username], group_hash, group_type);

               socket_user.emit('updaterooms', userGroups[socket.userid], group);
               
               //update room msg to user
               //socket_user.emit('broadcast room message', {message: msg.message, priority:msg.priority});
            }
       } else {
            console.log('group room...');
            BroadcastsModel.findOne({"groups.group_hash":group.group_hash}, function (err, msg, next) {
                    if (err) return next(err);
                    
                    //console.log('newroom, broadcast msg => ' + msg.message + ', new current room => ' + current_group.group_name);
                    //roomMsg = msg.message;
                    //socket.emit('broadcast room message', {message: msg.message});

                    //update all client, multiple socket id
                    for(var user_socket of userSocket[socket.username]) {
                        console.log('user socket id => ' + user_socket + ', new room => ' + group.group_name);
                        var socket_user = io.sockets.connected[user_socket];
                        
                        //2019-03-08, not leave other room
                        //socket_user.leave(socket.room); //old ok
                        
                        //socket_user.join(newroom);
                        //socket_user.room = newroom;

                        //socket_user.join(group.group_hash);
                        socket_user.join(group.group_id);
                        socket_user.room_id = group.group_id;
                        socket_user.room_hash = group.group_hash;
                        socket_user.room_name = group.group_name;
            
                        socket_user.emit('updaterooms', userGroups[socket.userid], group);
            
                        //update room msg to user
                        if(msg){
                            socket_user.emit('broadcast room message', {message: msg.message, priority:msg.priority});
                        } else {
                            //2019-03-28, emit hide broadcast msg
                            console.log('hide broadcast msg >>>');
                        }
                    }
            });
        }

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

            socket_user.emit('updaterooms', userGroups[socket.username], newroom);

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

       //2019-04-04, new message to mongo
       var messages_data = {group:data.room_id, text:data.message, from_id:socket.userid, from_username:socket.username, from_display_name:socket.username, messageType:'group'};
       SocketIOService.addNewMessage(messages_data).then(function(messages){
                //socket.emit('old messages', messages)
                console.log('messages response => ' + messages);

                console.log('new msg => ' + data.message + ', room hash => ' + data.room_hash + ', room id => ' + data.room_id);
                
                //io.sockets["in"](socket.room).emit('updatechat', socket.username, data);
                //Mesasge for client with room
                io.sockets["in"](data.room_id).emit('new message', {
                    room_id: data.room_id,
                    room_hash: data.room_hash,
                    room_name: data.room_name,
                    username: data.username,
                    message: data.message
                });

        }, function(error){
                console.log('error msg response => ' + error.msg);
                //socket.emit('error event', 'Uh oh! An error ocurred: ' + error.message);
        });

        /*
        console.log('new msg => ' + data.message + ', room hash => ' + socket.room_hash + ', room id => ' + data.room_id);

        //io.sockets["in"](socket.room).emit('updatechat', socket.username, data);
        //Mesasge for client with room
        io.sockets["in"](socket.room_hash).emit('new message', {
            room_hash: socket.room_hash,
            room_name: socket.room_name,
            username: socket.username,
            message: data
        });
        */

    });

    //send private message to someone by socket id
    socket.on('send private someone', (data) => {
            console.log("private msg from server, " + data.socketId)
            // sending to individual socketid (private message)
            //io.to(data.socketId).emit('private message', {username: socket.username, message: data.message + ', From:' + socket.id});
            
            //2019-03-26, check user to user group for send message to room


            //2019-03-05, loop for user socket
            for(var user_socket of userSocket[data.username]) {
                console.log('user socket id => ' + user_socket);
                //io.to(user_socket).emit('private message', {username: socket.username, message: data.message + ', From:' + socket.id});
                io.to(user_socket).emit('private message', {username: socket.username, message: data.message});
            }
    });

    //2019-03-26, chat with friend
    socket.on('chat with friend', (data) => {

        console.log('data.userID => ' + data.userID + 'data.friendID => ' + data.friendID);

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

            GroupsModel.findOne({hash_name:hashUserGroup}, function (err, group, next) {
                
                console.log('if err => ' + err +', group => '+ group + ', next => ' + next);
                if (err) return next(err);
                
                if (!group) {
                    // do stuff here
                    console.log('group not match, create new user chat group, friend group');

                    console.log('ObjectId userID => ' + db.Types.ObjectId(data.userID));
                    
                    // a document instance
                    var groupUserFriend = new GroupsModel({type:'direct', name:group_id, hash_name:hashUserGroup, members:members});
                    
                    // save model to database
                    groupUserFriend.save(function (err, group) {
                        if (err) return console.error(err);
                        console.log(group._id + " saved to group collection.");
                        
                        //push group to user, friend
                        userIds = [{userid:db.Types.ObjectId(data.userID),'userinfo':{group_id:db.Types.ObjectId(group._id), 'group_name':data.friendName, 'group_hash':hashUserGroup}}, {userid:db.Types.ObjectId(data.friendID),'userinfo':{group_id:db.Types.ObjectId(group._id), 'group_name':data.userName, 'group_hash':hashUserGroup}}];
                        for(var user of userIds){
                            console.log('user id => '+ user.userid + ', user info group id => ' + user.userinfo.group_id +', user info group name => '+ user.userinfo.group_name +', hash name => '+ user.userinfo.group_hash);
                            UsersModel.findOneAndUpdate({_id:db.Types.ObjectId(user.userid)}, {$push: {"groups": {group_id: user.userinfo.group_id, group_name: user.userinfo.group_name, 'group_hash':user.userinfo.group_hash, group_type:'friend'}}}, {safe: true, upsert: true, new: true}, function(err, user, next){
                                console.log('user find and update => ' + err);
                                if (err) return next(err);
                                
                                if(user){
                                    console.log('update user group success => ' + user);
                                }
                            });
                        }

                        //2019-04-03, update group
                        //push group to userGroup
                        userGroups[socket.userid].push({group_id:group._id, group_name:data.friendName, 'group_hash':hashUserGroup, group_type:'direct'});
                        if(!userGroups[data.friendID]){
                            console.log('empty userGroups data datadata => ' + data.datadata);
                            userGroups[data.friendID] = [];
                        }
                        userGroups[data.friendID].push({group_id:group._id, group_name:data.userName, 'group_hash':hashUserGroup, group_type:'direct'});
                        
                        userGroups[data.friendID].forEach(function(group){
                            console.log('friend list group => ' + group.group_name);
                        });
                        
                        var new_group = {group_name:data.friendName, group_hash: hashUserGroup, group_type: 'direct'};
                        call_update_room(new_group, data.userName, data.userID);
                        console.log('new_group => ' + new_group);

                        var new_group_friend = {group_name:data.userName, group_hash: hashUserGroup, group_type: 'direct'};
                        call_update_room(new_group_friend, data.friendName, data.friendID);
                        console.log('new_group_friend => ' + new_group_friend);

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
                    
                    //2019-04-03, check user group
                    //push group to user, friend
                    userIds = [{userid:db.Types.ObjectId(data.userID),'userinfo':{group_id:db.Types.ObjectId(group._id), 'group_name':data.friendName, 'group_hash':hashUserGroup}}, {userid:db.Types.ObjectId(data.friendID),'userinfo':{group_id:db.Types.ObjectId(group._id), 'group_name':data.userName, 'group_hash':hashUserGroup}}];
                    for(var user of userIds){
                        console.log('user id => '+ user.userid + ', user info group id => ' + user.userinfo.group_id +', user info group name => '+ user.userinfo.group_name +', hash name => '+ user.userinfo.group_hash);
                        UsersModel.findOneAndUpdate({_id:db.Types.ObjectId(user.userid)}, {$push: {"groups": {group_id: user.userinfo.group_id, group_name: user.userinfo.group_name, 'group_hash':user.userinfo.group_hash, group_type:'friend'}}}, {safe: true, upsert: true, new: true}, function(err, user, next){
                            console.log('user find and update => ' + err);
                            if (err) return next(err);
                            
                            if(user){
                                console.log('update user group success => ' + user);
                            }
                        });
                    }

                    //2019-04-03, update group
                    //push group to userGroup
                    userGroups[socket.userid].push({group_id:group._id, group_name:data.friendName, 'group_hash':hashUserGroup, group_type:'direct'});
                    if(!userGroups[data.friendID]){
                        userGroups[data.friendID] = [];
                    }
                    userGroups[data.friendID].push({group_id:group._id, group_name:data.userName, 'group_hash':hashUserGroup, group_type:'direct'});
                    
                    userGroups[data.friendID].forEach(function(group){
                        console.log('friend list group => ' + group.group_name);
                    });

                    var new_group = {group_name:data.friendName, group_hash: hashUserGroup, group_type: 'direct'};
                    call_update_room(new_group, data.userName, data.userID);

                    var new_group_friend = {group_name:data.userName, group_hash: hashUserGroup, group_type: 'direct'};
                    call_update_room(new_group_friend, data.friendName, data.friendID);
                }
                
                console.log('out >>');
            });
        } else {
            console.log('group is null.......');
        }
        
        console.log('chat with friend, user id => ' + data.userID + ', friend id => ' + data.friendID + ', group id => ' + group_id + ', hash => ' + hashUserGroup);
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', (data) => {
        console.log('typing => ' + socket.username +', room id => '+ data.room_id);
        socket.broadcast.emit('typing', {
            username: socket.username,
            group_id: data.room_id
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', (data) => {
        console.log('stop typing => ' + socket.username +', room id => '+ data.room_id);
        socket.broadcast.emit('stop typing', {
            username: socket.username,
            group_id: data.room_id
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            //2019-04-04, hide user left msg
            /*
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
            */

            //delete user info by socket id
            //userSocket[socket.username].filter(user => user !== socket.id);
            const secket_index = userSocket[socket.username].indexOf(socket.id);
            console.log('del index => ' + secket_index);

            if (secket_index >= 0) {
                userSocket[socket.username].splice(secket_index, 1);
            }

            console.log('del user disconnect => ' + userSocket[socket.username] + ', count user current => ' + userSocket[socket.username].length);
            
            //Room action
            //delete usernames[socket.username];
            //2019-03-05, check current user online
            if(userSocket[socket.username].length < 1){
                delete userNames[socket.username];
                io.sockets.emit('updateusers', userNames); //update user in client ****
                //2019-04-04, hide this msg to group
                //socket.broadcast.emit('updatechat', 'SERVER', {username: socket.username, group_hash:socket.room_hash, group_name:socket.room_name, msg: socket.username + ' has disconnected'});
                socket.leave(socket.room_hash);
            }

        }
    });

    /*
        socket.on('disconnect', function() {
            delete usernames[socket.username];
            io.sockets.emit('updateusers', usernames);
            socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
            socket.leave(socket.room_hash);
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