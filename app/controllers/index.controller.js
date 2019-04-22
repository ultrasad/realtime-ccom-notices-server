var crypto = require('crypto');
var UsersModel = require('mongoose').model('Users'); 

exports.render = function(req, res){
    app.set('io', io);
    res.send('Hello World');
}

exports.pushMessage = function(req, res){
    const io = req.app.get('io');

    io.emit('notification', {
        message: {priority: 'info', content: '!!ข้อความจากระบบ CCOM (ขอความร่วมมือตรวจสอบข้อมูลลูกค้าก่อนสร้างใหม่ด้วยนะครับ)^^'}
    });

    res.status(201).send({status:'success', response:'send message successfuly.'});
}

exports.groupname = function(req, res){
    //let hashInbound = crypto.createHash('md5').update('Inbound').digest("hex");
    //let hashOutbound = crypto.createHash('md5').update('Outbound').digest("hex");

    //let hashFriend = crypto.createHash('md5').update('5c6d3508c82ad53a33f07f485c6e640cc82ad53a33f07f51').digest("hex");

    //console.log('hashInbound => ' + hashInbound + ', hashOutbound => ' + hashOutbound + ', hashFriend=> ' + hashFriend);
    //res.send('hashInbound => ' + hashInbound + ', hashOutbound => ' + hashOutbound + ', hashFriend=> ' + hashFriend);

    //let hashLobby = crypto.createHash('md5').update('Lobby').digest("hex");
    //res.send('hashLobby => ' + hashLobby + '');
    //var members_list = [];
    UsersModel.find({username:'Agent480'}, function (err, members, next) {

        if (!err){ 
            //console.log('members username => ' + members);
            //members_list.push(members);
            members.forEach(function (member) {
                //console.log('user groups => ' + member.groups);
                //res.send('user => ' + user.username + '');

                member.groups.forEach(function(group) {
                    if(!group.type){
                        console.log('group type => ' + member.username +', group name => '+ group.group_name + ', group => ' + group);
                        //console.log('user group_name => ' + group.group_name);

                        /*
                        let hashGroupName = crypto.createHash('md5').update(group.group_name).digest("hex");
                        group.group_hash = hashGroupName;
                        group.group_type = 'group';
                        */

                        /*
                        member.save(function(err, mm){
                            if (err) return console.error(err);
                            console.log('mm => ' + mm);
                        });
                        */
                        
                        /*
                        UsersModel.save(function (err, user) {
                            if (err) return console.error(err);
                            console.log('member group upate => ' + user);
                            //console.log(user._id + " saved to group collection.");
                        });
                        */
                    } else {
                        console.log('group type exists.');
                    }
                    /*
                    let hashGroupName = crypto.createHash('md5').update(group.group_name).digest("hex");
                    console.log('user group_name => ' + group.group_name + ', hashGroupName => ' + hashGroupName);
                    */

                   //member.save();
                });

                //save update
                //member.save();
            });

            //process.exit();
        } else {throw err;}

        //console.log('member list => ' + members.username);
        //if (members.groups.length != 0 ) {
            //print(members);
            /*
            members.groups.forEach(function(group) {
                //console.log();
                members.group_hash = hex_md5(group.group_name);
                //print('data username => ' + members.username + ', group name => ' + members.group_name + ', group.group_hash => ' + members.group_hash);

                res.send('data username => ' + members.username + ', group name => ' + group.group_name + ', group.group_hash => ' + group.group_hash);
            });
            */
        //}
    });

    res.send('members');

}