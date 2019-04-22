//const UsersModel = require('mongoose').model('Users'); 
var mongoose = require('mongoose'),
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId;

var BroadcastSchema = new Schema({
    _id: {type: ObjectId, required:false, auto:true},
    message: String,
    description: String,
    startdate: { type: Date, default: Date.now},
    starttime: {type: Date, default: null},
    enddate: {type: Date, default: null},
    endtime: {type: Date, default: null},
    priority: String,
    created : {type:Date, default: Date.now},
    created_by : String,
    updated_by : String,
    deleted_by : String,
    last_modified : {type: Date, default: null},
    active: {type: String, default: 'Y'},
    groups: [{group_id:{type: ObjectId, index: true}, group_name: { type: String, index: true }, group_hash: String, group_type: String, added_on: {type: Date, default: Date.now}, active: {type:String, default:'Y'}}]
    //groups: {type: Array, default: [{added_on: {type: Date, default: Date.now}, active: {type:String, default:'Y'}}]}
    //groups: { type : Array, "default" : [{group_id:{type: ObjectId, index: true}, group_name: { type: String, index: true }, group_hash: String, group_type: String, added_on: {type: Date, default: Date.now}, active: {type:String, default:'Y'}}], ref: "Groups" }
});

/*
BroadcastSchema.pre('findOne', function() {
    console.log(this instanceof mongoose.Query); // true
    this.start = Date.now();
});

BroadcastSchema.post('findOne', function(result) {
    console.log(this instanceof mongoose.Query); // true
    // prints returned documents
    console.log('BroadcastSchema findOne() returned ' + JSON.stringify(result));
    // prints number of milliseconds the query took
    console.log('BroadcastSchema findOne() took ' + (Date.now() - this.start) + ' millis');
});
*/

mongoose.model('Broadcasts', BroadcastSchema, 'ccom_broadcast_message'); //model name, schema name, collection name (optional, induced from model name), whether to skip initialization (defaults to false)