module.exports = function(app){
	var index = require('../controllers/index.controller'); //index => indexController exports
    app.get('/', index.render);
    app.get('/groupname', index.groupname);

    //2019-04-22, push message from server
    app.get('/push_message', index.pushMessage);

	//app.get('/test', index.test);
	//app.get('/welcome', index.welcome);
}