//var Groups = require('mongoose').model('Groups'); //call module mongoose, Chat model
//import models, { connectDb } from './models';
const UsersModel = require('mongoose').model('Users');
const BroadcastsModel = require('mongoose').model('Broadcasts');
//const ChatService = require('../services/chat.service');
const db = require('mongoose');

exports.messages = async function(req, res){
    await new Promise((resolve, reject) => {
        BroadcastsModel.aggregate([
            {$match: {"groups.group_id": db.Types.ObjectId(req.params.id)}},
            {$group: { // Group the collection by `template` and count the occurrences
                _id: "$_id",
                message: {"$first": "$message"},
                priority: {"$first":"$priority"},
                created_by: {"$first": "$created_by"}
                //count: { $sum: 1 }
                }
            },
            {$project: { // Format the output
                _id: 0,
                id: "$_id",
                message: 1,
                priority: 1,
                created_by: 1,
                count: 1
            }},
            { $sort: { message: 1 }} // Sort the formatted output
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