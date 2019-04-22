process.env.NODE_ENV = process.env.NODE_ENV || 'development'; //set default if nil, (production, development)
var mongoose = require('./config/mongoose');
mongoose();

var app = require('./config/express').app; //module.exports
var server = require('./config/express').server; //module.exports

/*var mongoose = require('mongoose');
var uri = 'mongodb://localhost:27017';
var db = mongoose.connect(uri);*/

//var db = mongoose(); //load first, db
//mongoose(); //load first, db
//var app = express(); //new express()
var port = process.env.PORT || 8085;

//app.listen(port);
server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

module.exports = app;

//console.log('server running....');
console.log('Server running at http://localhost:'+ port);