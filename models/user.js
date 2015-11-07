
var mongoose = require('mongoose');

var thermoSchema = new mongoose.Schema({
	vendor:String,
	thermo_id:String,
	thermo_name:String
});

var lightSchema = new mongoose.Schema({
	vendor:String,
	light_id:String,
	light_name:String
});

module.exports = mongoose.model('User',{
	user_id: {type : String , required : true, unique: true, dropDups: true},
	username: {type : String , required : true},
	password: String,
	fullname: String,
	email: {type : String , required : true},
	thermos: [thermoSchema],
	lights: [lightSchema],
	createAt: {type: Date, default: Date.now}
});
