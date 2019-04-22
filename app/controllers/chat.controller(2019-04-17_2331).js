//var Groups = require('mongoose').model('Groups'); //call module mongoose, Chat model
//import models, { connectDb } from './models';
const Users = require('mongoose').model('Users');
//const ChatService = require('../services/chat.service');

exports.user = async function(req, res){
    //const users = await Users.findOne({username: req.params.username, 'groups.group_type':'group'});
    
    //var user = new Users;
    //user.transform();

    await new Promise((resolve, reject) => {
        //Users.findOne({username: req.params.username})
        Users.aggregate([
            {$match: {username: req.params.username}},
            //{$project: {_id: 0, groups: 1, displayName: 1, id: "$groups.group_id", username: 1}},
            {$unwind: '$groups'},
            {$match: {"groups.group_type": "group"}},
            {$group: {_id: {'group_name': "$groups.group_name", 'id':'$groups.group_id', 'type': '$groups.group_type'}, count: { $sum: 1}, sum_group_type: {$sum: {$cond:[{$eq:['$groups.group_type', 'group']}, 1, 0]}} }},
            //{$group: {_id: 0, count: { $sum: 1}}},
            //{$project : {answer: '$_id.group_name', id: '$_id.id', count: '$count', _id:0}},
            {$project: {_id:0, group_name: '$_id.group_name', group_id: '$_id.id', group_type: '$_id.type', count: '$count', sum_group_type: '$sum_group_type'}},
            //{$group: {_id:null, count: {$sum: 1}}}
            //{$group: {_id:{id:'$id'}, results: { $addToSet: {answer: "$answer", count: '$count'}}}},
            //{$project: {id:"$_id.id", answer:'$results', _id:0}}

            //{$group: {_id:null, count: {$sum: 1}}}
            //{$group: {_id:null, count: {$sum: 1}}}
            //{$match: {'groups.group_type': 'group'}},
            //{$group: {_id:null, groups: "$groups", count: {$sum: 1}}}
            /*
            {$unwind: '$groups'},
            {$match: {'groups.group_type': 'group'}},
            {$project: {_id: 0, groups: 1, displayName: 1, id: "$groups.group_id", username: 1}},
            */
            //{$project: {groups: {$filter:{input: "$groups", cond: {"group_type":"group"}}}}}
            //{$project: {_id: 0, id: "$_id", username: 1, groups: 1, displayName: 1}}
            //{$project: {_id: 0, id: "$_id", ids: "$groups.group_id", username: 1, groups: 1, displayName: 1}}
            //{$project: {_id: 0, id: "$groups.group_id", username: 1, groups: 1, displayName: 1, numberOfGroups: {$size: "$groups" }}},
            //{$group: {_id:null, count: {$sum: 1}}}
            //{$group: {_id: null, username: {"$first":"$username"}, count: {$sum: 1}}}
            //{$group: {id: "$_id"}}
        ])
        .then(function(user){
            console.log('user => ', user);
            resolve(user);

            res.header("X-Total-Count", 3);
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