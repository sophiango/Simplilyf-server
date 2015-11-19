var mongoose = require ('mongoose');

var LightSchema = new mongoose.Schema({
	id : String,
	name : String,
  	currentTS : {type:Date, default: Date.now},
	modelid : String,
	onStatus : Boolean,
	bri : Number,
  	hue : Number,
	sat : Number,
	reachable : Boolean,
  	type : String,
  	operation : Number
},{ _id : false });

module.exports = mongoose.model('Light', LightSchema, 'light_data');
