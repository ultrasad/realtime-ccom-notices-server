var config = require('./config');
var mongoose = require('mongoose');

module.exports = function(){
    mongoose.set('debug', config.debug); //config debug
    
    //console.log("mongoUri => ", config.mongoUri);
    /*
    process.on('unhandledRejection', error => {
        // Will print "unhandledRejection err is not defined"
        console.log('unhandledRejection', error.message);
    });
    */

	//var db = mongoose.connect(config.mongoUri, {useMongoClient: true});
    //require('../app/models/user.model'); //from user model
    
    var db = mongoose.connect(config.mongoUri, { //?ssl=true
        auth: {
            user: 'dbuser01',
            password: 'DBUser01#PWD',
        },
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    .then(() => console.log('db connection successful'))
    .catch((err) => console.error(err));

    require('../app/models/chat.model'); //from chat model
    require('../app/models/broadcast.model'); //from broadcast model

	return db;
}