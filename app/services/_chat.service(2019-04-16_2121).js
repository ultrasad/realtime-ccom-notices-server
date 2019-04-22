var UsersModel = require('mongoose').model('Users'); //call module mongoose, Chat model
//var BroadcastsModel = require('mongoose').model('Broadcasts'); //call module mongoose, Broadcasts model

exports.getUsersGroups = function(query, page=0, limit=50) {

    /*
    return new Promise((resolve, reject) => {
        UsersModel.find(query)
        .skip(limit * page).limit(limit)
        .then(function(members){
            resolve(members);
        }).then(function(result){
            return result;
        }).catch(function (err) {
            console.log('get users groups err =>', err.message);
            reject(err);
        });
    });
    */


    /*
    try {
        //var users = await User.find(query)
        //return users;

        return usersGroups = await UsersModel.find(query, function (err, members, next) {
            //console.log('members => ' + members + ', err => ' + err);
            //console.log('users list group err => ' + err + ', members => ' + members);
            if (err) return next(err);
            
            return members;

        }).skip(limit * page).limit(limit);

    } catch (e) {
        // Log Errors, to winston
        throw Error('Error while Paginating Users')
    }
    */
}