
var mongoose = require('mongoose');

var thermoSchema = new mongoose.Schema({
	vendor:String,
	thermo_id:String,
	thermo_name:String
},{ _id : false });

var lightSchema = new mongoose.Schema({
	vendor:String,
	light_id:String,
	light_name:String
},{ _id : false });

var deviceAccount = new mongoose.Schema({
	vendor:{type:String,required:true},
	username: {type:String,required:true},
	password: {type: String,required:true},
},{_id:false});

module.exports = mongoose.model('User',{
	user_id: {type : String , required : true, unique: true, dropDups: true},
	password: String,
	fullname: String,
	email: {type : String , required : true},
	thermos: [thermoSchema],
	lights: [lightSchema],
	devicesAcc: [deviceAccount],
	createAt: {type: Date, default: Date.now}
});
