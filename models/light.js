var mongoose = require ('mongoose');

var LightSchema = mongoose.Schema({
	id : String,
	name : String,
  	currentTS : Date,
	modelid : String,
	onStatus : Boolean,
	bri : Number,
  	hue : Number,
	sat : Number,
	reachable : Boolean,
  	type : String,
	last_use_date : Date,
	created_date : Date,
	user_mode : String,
 	timestamp : Date
});

module.exports = mongoose.model('Light', LightSchema);
