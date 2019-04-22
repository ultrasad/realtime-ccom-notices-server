var Groups = require('mongoose').model('Groups'); //call module mongoose, Chat model

exports.render = function(req, res){
    //socketio
    /*
    var io = req.app.get('socketio');
    io.emit('notification', {
        message: "Msg From Server"
    });
    */
    var io = req.app.get('io');
    res.send('Chat Msg...');

    Groups.find(function (err, groups) {

        if(err) throw err;
        
        for (let group of groups) {
            console.log("\r\n Group: ", group._id, group.name, group.active);
        }

        /*
        doc.dueDate.setMonth(3);
        doc.save(callback) // THIS DOES NOT SAVE YOUR CHANGE
        
        doc.markModified('dueDate');
        doc.save(callback) // works
        */

    });

    io.emit('notification', {
            message: "Msg From Hanajung"
    });
}

exports.test = function(req, res){
    console.log('Test msg');
    res.send('Test Msg...');
}