var UsersModel = require('mongoose').model('Users'); //call module mongoose, Chat model
var BroadcastsModel = require('mongoose').model('Broadcasts'); //call module mongoose, Broadcasts model

//const moment = require('moment-timezone');
//const dateThailand = moment.tz(Date.now(), "Asia/Bangkok").utc().format('YYYY-MM-DD HH:mm:ss');

var ChatsModel = require('mongoose').model('Chats'); //call module mongoose, Chat model

exports.getUsersGroups = function(query, page=0, limit=50) {
    return new Promise((resolve, reject) => {
        UsersModel.find(query)
        .skip(limit * page).limit(limit)
        .then(function(members){
            resolve(members);
        })//.then(function(result){return result;})
        .catch(function (err) {
            console.log('get users groups err =>', err.message);
            reject(err);
        });
    });
}

exports.getUser = function(query) {
    return new Promise((resolve, reject) => {
        UsersModel.findOne(query)
        .then(function(user){
            resolve(user);
        }).then(function(result){
            return result;
        }).catch(function (err) {
            console.log('get user err =>', err.message);
            reject(err);
        });
    });
}

exports.findBroadcastMessage = function(query) {
    return new Promise(function(resolve, reject) {
        BroadcastsModel.findOne(query)
        .then(function(broadcast) {
            //console.log('get broadcast msg =>', broadcast);
            resolve(broadcast);
        }).catch(function(err) {
            console.log('get user err =>', err.message);
            reject(err);
        });
    });
}

exports.findGroupChatMessage = function(query) {
    return new Promise(function(resolve, reject) {
        ChatsModel.find(query)
        .sort({sent: -1}) //-1: desc
        .limit(30) //default 30
        .then(function(messages) {
            //console.log('get broadcast msg =>', broadcast);
            resolve(messages);
        }).catch(function(err) {
            console.log('get messages group err =>', err.message);
            reject(err);
        });
    });
}

exports.addNewMessage = function(data) {
    return new Promise(function (resolve, reject){
        var newMessage = new ChatsModel({
            group: data.group,
            text: data.text,
            fromUser: {
                id: data.from_id,
                username: data.from_username,
                displayName: data.from_display_name 
            },
            messageType: data.group_type,
            //sent: new Date()
            //sent: new Date(dateThailand)
        });
        newMessage.save(function(error) {
            if(!error) {
                console.log('save msg success');
                resolve({status:'success', data: data});
            } else {
                console.error('save msg err, ', error);
                reject({status:'error', message: error.message});
            }
        });
    });
}


/*
var findMessages = function(room) {
    return new Promise(function (resolve, decline){
        Message.find({room: room}).sort({sent: 'ascending'}).exec(function(error, messages) {
            if(!error){
                resolve(messages);
            }else{
                console.error(error.message);
                decline(error);
            }
        });
    });
}

var addNewMessage = function(result, room){
    return new Promise(function (resolve, decline){
        var newMessage = new Message({
            result: result,
            room: room,
            sent: new Date()
        });
        newMessage.save(function(error){
            if(!error){
                resolve();
            }else{
                console.error(error);
                decline(error);
            }
        });
    });
}

//Exporting methods
exports.find = findMessages;
exports.add = addNewMessage;
*/