var mongoose = require ('mongoose');

var LightSchema = new mongoose.Schema({
	id : String,
	name : String,
  	currentTS : Date,
	modelid : String,
	onStatus : Boolean,
	bri : Number,
  	hue : Number,
	sat : Number,
	reachable : Boolean,
  	type : String
});

module.exports = mongoose.model('Light', LightSchema, 'light_data');