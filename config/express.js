var express = require('express');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');

var cors = require('cors')

//var sass = require('node-sass-middleware');
//var cookieSession = require('cookie-session');
//var config = require('./config'); //for session secret key

module.exports = function(){
    var app = express();

    var server = require('http').Server(app);
    var io = require('socket.io')(server);
    
	if(process.env.NODE_ENV === 'development'){
		app.use(morgan('dev'));
	} else {
		app.use(compression());
    }
    
	app.use(bodyParser.urlencoded({ //support url encode
		extended: true
    }));
    
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
        //res.header("X-Total-Count", 4);
        next();
    });

    /*
	app.use(cookieSession({
		name: 'session', //name foe use session
		keys:['Secret_Hanajung','Secret_KissingBear']
    }));
    */

    app.use(bodyParser.json()); //support json too.

    app.options('*', cors()) // include before other routes
    
    /*
    app.use(async (req, res, next) => {
        req.context = {
          models,
          me: await models.User.findByLogin('Super99'),
        };
        next();
    });
    */

	//view path, run time on server.js
	//app.set('views', './app/views');
    //app.set('view engine', 'jade');

    /*
	//app path, compile time, load first
	require('../app/routes/index.route')(app); //return function in index.route and (app) is params
    require('../app/routes/chat.route')(app); //chat route
    //require('../app/controllers/socketio.controller')(socketio); //chat controller
    */

    //socket io
    //require('./socket-io')(app, io);
    //2019-04-16, app, io socket
    app.set('io', io);

    //app path, compile time, load first
	require('../app/routes/index.route')(app); //return function in index.route and (app) is params
    require('../app/routes/chat.route')(app); //chat route
    //require('../app/controllers/socketio.controller')(socketio); //chat controller

    //socket controller
    require('../app/controllers/socketio.controller')(io); //chat controller

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
    return server;
};

//module.exports = {app: app, server: server};