var express = require('express');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');

//var sass = require('node-sass-middleware');
//var cookieSession = require('cookie-session');
//var config = require('./config'); //for session secret key

//module.exports = function(){
    var app = express();
    
	if(process.env.NODE_ENV === 'development'){
		app.use(morgan('dev'));
	} else {
		app.use(compression());
    }
    
	app.use(bodyParser.urlencoded({ //support url encode
		extended: true
	}));

    /*
	app.use(cookieSession({
		name: 'session', //name foe use session
		keys:['Secret_Hanajung','Secret_KissingBear']
    }));
    */

	app.use(bodyParser.json()); //support json too.

	//view path, run time on server.js
	//app.set('views', './app/views');
    //app.set('view engine', 'jade');

    //var io = require('socket.io')(httpServer, {path: '/mysubdir/socket.io'})`
    
    var server = require('http').createServer(app);
    var socketio = require('socket.io')(server);
    //var io = require('socket.io')(server, {path: '/chat/socket.io'});
    app.set('io', socketio);
    
    /*
    socketio.on('connection', (socket) => {
        console.log("express, user socket id: " + socket.id);

        //require('../app/routes/chat.route')(app, socketio); //chat route
    });
    */

    //pass res.io to request, then next
    /*
    app.use(function(req, res, next){
        console.log('io res => ' + io);
        res.io = io;
        next();
    });
    */

	//app path, compile time, load first
	require('../app/routes/index.route')(app); //return function in index.route and (app) is params
    require('../app/routes/chat.route')(app); //chat route
    require('../app/controllers/socketio.controller')(socketio); //chat controller

    /*
	app.use(sass({
			src: './sass',
			dest: './public/css',
			outputStyle: 'compressed', //compressed, compact, expanded
			prefix: '/css',
			debug: true,
			//indentedSyntax: true, //for .sass file, indent css style
    }));
    */

	//public file, put after routing
	app.use(express.static('./public'));

	//return app;
//};

module.exports = {app: app, server: server};