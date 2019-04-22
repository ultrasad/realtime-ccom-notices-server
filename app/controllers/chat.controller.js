var Groups = require('mongoose').model('Groups'); //call module mongoose, Chat model
//import models, { connectDb } from './models';
const UsersModel = require('mongoose').model('Users');
const BroadcastsModel = require('mongoose').model('Broadcasts');
//const ChatService = require('../services/chat.service');
const db = require('mongoose');

const broadcastGroup = (groupId) => {
    //return new Promise((resolve, reject) => {
    return Groups.findById(groupId, '_id name hash_name group_type', { lean: true })
        .then(function(group){
            //console.log('group =>', group);
            return {'status': 'success', 'data': group};
            //resolve(group);
        }).catch(function (err) {
            //console.log('get message groups err =>', err.message);
            return {'status': error, 'mesasge': err.message};
            //reject(err);
        });
    //});
}

exports.create_message = async function(req, res){
    //console.log('call broadcast create message =>', req);
    /*
    const username = req.body.username;
    const message = req.body.message;
    const broadcastGroupId = req.body.broadcastGroupId;
    const selectedGroupId = req.body.selectedGroupId;
    const token = req.body.token;
    */
    
    try {
        const group = await broadcastGroup(req.body.broadcastGroupId);
        console.log('group reponse data => ', group.data + ', group.status => ' + group.status);

        var group_data = {};
        if(group.status === 'success'){
            group_data = {
                group_id: group.data._id,
                group_name: group.data.name,
                group_hash: group.data.hash_name,
                group_type: group.data.group_type
            };

            console.log('group data struct => ' + group_data + ', group name => ' + group.data.name);

            const broadcastMessage = new BroadcastsModel({
                message: req.body.message,
                priority: req.body.selectedGroupId,
                created_by: req.body.username,
                //starttime: 0,
                //enddate: 0,
                //endtime: 0,
                //updated_by: 0,
                //deleted_by: 0,
                //last_modified: 0,
                groups: [group_data]
            });

            //broadcastMessage.groups.push(group_data);
        
            try {
                let newBroadcastMessage = await broadcastMessage.save();
        
                console.log('new broadcast message => ' + newBroadcastMessage);
        
                res.set('Location', 'http://172.22.228.211:8085/broadcast/' + req.body.broadcastGroupId + '/message/' + newBroadcastMessage.id);
                res.status(201).send({status:'success', response:'Message created for groupId ' + req.body.broadcastGroupId, data: newBroadcastMessage});
        
            } catch (err){
                if (err.name === 'MongoError' && err.code === 11000) {
                    //res.status(409).send(new MyError('Duplicate key', [err.message]));

                    res.status(500).send({status:'error', message: 'Duplicate key: ' + err.mesasge, err: err});
                }
        
                res.status(500).send({status:'error', message: err.mesasge, err: err});
            }


        } else {
            res.status(500).send({status:'error', mesasge: group.mesasge});
        }

    
    } catch(err){
        console.log('call group error => ', err);
    }

    //return;
    /*
    try {
        let group = await broadcastGroup(req.body.broadcastGroupId);
        console.log('group response => ' + group.status + ', group => ' + group.data);
        if(group.status === 'success'){
            group_data = {
                group_id: group.data._id,
                group_name: group.data.group_name,
                group_hash: group.data.group_hash,
                group_type: group.data.group_type,
            };        
        } else {
            res.status(500).send(group.mesasge);
        }

    } catch(err) {
        res.status(500).send(err.mesasge);
    }
    */

    return res;

    //const jsondata = JSON.parse(req);
    //return res.send({'username': username, 'message': message, 'selectedGroupId': selectedGroupId, 'token': token, 'broadcastGroupId':broadcastGroupId});
}

exports.messages = async function(req, res){
    await new Promise((resolve, reject) => {
        BroadcastsModel.aggregate([
            {$match: {"groups.group_id": db.Types.ObjectId(req.params.id)}},
            {$project: { // Format the output
                _id: 0,
                id: "$_id",
                message: "$message",
                group: {
                    $filter: {
                        input: "$groups",
                        as: "group",
                        cond: { $eq: [ "$$group.group_id", db.Types.ObjectId(req.params.id) ] }
                     }
                },
                priority: "$priority",
                created_by: "$created_by",
                count: 1
            }},
            //{ $sort: { message: 1 }} // Sort the formatted output
            { $sort: { id: -1 }}, // Sort the formatted output
            { $limit: 10 } // Limit output
        ])
        .then(function(message){
            console.log('message => ', message);
            resolve(message);

            //res.header("x-total-count", user[0].total_groups);
            res.header("x-total-count", 10);
            return res.send(message);
        }).catch(function (err) {
            console.log('get user err =>', err.message);
            reject(err);
        });
    }).catch(function(err){
        console.log('call broadcast message err =>', err.message);
    });
}

exports.user = async function(req, res){
    //const users = await Users.findOne({username: req.params.username, 'groups.group_type':'group'});
    
    //var user = new Users;
    //user.transform();

    await new Promise((resolve, reject) => {
        //Users.findOne({username: req.params.username})
        UsersModel.aggregate([
            {$match: {username: req.params.username}},
            {"$project": {
                "user_id": "$_id",
                "username": 1,
                "displayName": 1,
                //"total_groups": { $size: "$groups" },
                "total_groups": {
                    "$size": {
                        "$filter": {
                          "input": "$groups",
                          "as": "groups",
                          "cond": { "$eq": ["$$groups.group_type", "group"] }
                        }
                    }
                },
                "groups": 1,
                "_id": 0,
            }},
            {$unwind: '$groups'},
            {$match: {"groups.group_type": "group"}},
            {"$project": {
                "user_id": 1,
                "username": 1,
                "displayName": 1,
                "total_groups": 1,
                "groups": 1,
                "_id": 0,
                "id": "$groups.group_id"
            }},
            {$limit: 10},
        ])
        .then(function(user){
            console.log('user => ', user);
            resolve(user);

            res.header("x-total-count", user[0].total_groups);
            //let user_response = user;
            //return res.send(user_response);
            //return res.send([user.transform()]);
            return res.send(user);
        }).catch(function (err) {
            console.log('get user err =>', err.message);
            reject(err);
        });
        
    }).catch(function(err){
        console.log('call user and chat groups err =>', err.message);
    });
}