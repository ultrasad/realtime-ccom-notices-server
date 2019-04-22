var mongoose = require('mongoose'),
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId;

//const moment = require('moment-timezone');
//const dateThailand = moment.tz(Date.now(), "Asia/Bangkok"); //.format("YYYY-MM-DD HH:mm:ss");
//const dateThailand = moment.tz(Date.now(), "Asia/Bangkok").format();

//const moment = require('moment-timezone');
//const dateThailand = moment.tz(Date.now(), "Asia/Bangkok");

/*
var TeamSchema = new Schema({
    code: String,
    name: String,
    urlImage: String,
    votes: {type: Number, default: 0}
});
  
mongoose.model('Team', TeamSchema);
*/
var GroupSchema = new Schema({
    //_id: {type: ObjectId, index:true, required:true, auto:true},
    _id: {type: ObjectId, required:false, auto:true},
    group_type: String,
    name: String,
    hash_name: { type: String, unique: true},
    members: {type: Array, default:[{member_id:ObjectId, member_name:String}]},
    active: {type: String, default: 'Y'},
    created_at: { type: Date, default: Date.now },
    last_message: { type: Date, default: null }
});

mongoose.model('Groups', GroupSchema, 'ccom_chat_groups'); //model name, schema name, collection name (optional, induced from model name), whether to skip initialization (defaults to false)

//var GroupSchema = new Schema({ group_id: ObjectId, group_name:String });
var schema = UserSchema = new Schema({
    _id: ObjectId,
    username: { type: String, index: true },
    first_name: String,
    last_name: String,
    parent_id: Number,
    //groups:[GroupSchema]
    //groups:[{group_id:ObjectId, group_name: String}]
    //groups: { type : Array , "default" : [] }
    //groups: { type : Array, "ref": "Teams" }
    //groups: { type : Array , "default" : [] }
    //groups: { type : Array, "default" : [{group_id:ObjectId, group_name: { type: String, index: true }, hash_name: { type: String, index: true }, type: String}] },
    groups: { type : Array, "default" : [{group_id:ObjectId, group_name: { type: String, index: true }, group_hash: { type: String, index: true }, group_type: String}] },
    full_name: String,
    displayName: String,
    user_id: Number,
    socketId: {type: Array, "default": []}
    //groups:Array
});

// Duplicate the ID field.
/*
UserSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
UserSchema.set('toJSON', {
    virtuals: true
});
*/

schema.method('transform', function() {

    console.log('meeeeeoooooooooooow');
    
    var obj = this.toObject();
 
    //Rename fields
    obj.id = obj._id;
    delete obj._id;
 
    return obj;
});

UserSchema.pre('findOne', function() {
    console.log(this instanceof mongoose.Query); // true
    this.start = Date.now();
});

UserSchema.post('findOne', function(result) {
    console.log(this instanceof mongoose.Query); // true
    // prints returned documents
    console.log('UserSchema findOne() returned ' + JSON.stringify(result));
    // prints number of milliseconds the query took
    console.log('UserSchema findOne() took ' + (Date.now() - this.start) + ' millis');
});

/*
UserSchema.pre('find', function() {
    console.log(this instanceof mongoose.Query); // true
    this.start = Date.now();
});

UserSchema.post('find', function(result) {
    console.log(this instanceof mongoose.Query); // true
    // prints returned documents
    console.log('UserSchema find() returned ' + JSON.stringify(result));
    // prints number of milliseconds the query took
    console.log('UserSchema find() took ' + (Date.now() - this.start) + ' millis');
});
*/

//mongoose.model('Users', UserSchema, 'ccom_chat_users');
//2019-04-09, change collection to ccom_users_filter
mongoose.model('Users', UserSchema, 'ccom_users_filter');

var ChatSchema = new Schema({
    _id: {type: ObjectId, required:false, auto:true},
    group: {type: ObjectId, refs: 'Groups'},
    recipient: {type: String, "default": null},
    subject: {type: String, "default": null},
    //sent: { type: Date, default: Date.now },
    sent: { type: Date, default: Date.now },
    //date_time_zone: { type: Date, default: dateThailand },
    mentions: {type: Array, "default": []},
    issues: {type: Array, "default": []},
    meta: {type: Array, "default": []},
    "fromUser": {
        "id": {type: ObjectId, 'refs': 'Users'},
        "username": String,
        "avatarUrlMedium": {type:String, default: null},
        "avatarUrlSmall": {type:String, default: null},
        "displayName": {type:String, default: null}
    },
    "text":String,
    "html": {type:String, default: null},
    "messageType": String, //Group, Direct
    "readBy": {type:Number, default: 0}, //Number of Read
    "editedAt": {type:Date, default: null }
});

mongoose.model('Chats', ChatSchema, 'ccom_chat_logs');