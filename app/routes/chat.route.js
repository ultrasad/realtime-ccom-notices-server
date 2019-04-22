module.exports = function(app){
	var chat = require('../controllers/chat.controller');
    //app.get('/msg', chat.render);
    //app.get('/test', chat.test);

    app.get('/user/:username', chat.user);
    app.get('/broadcast/msg/:id', chat.messages);
    app.post('/broadcast/create_message/', chat.create_message);
    app.get('/messages', chat.messages);
}