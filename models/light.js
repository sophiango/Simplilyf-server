var mongoose = require ('mongoose');

var LightRecord = new mongoose.Schema({
	record_id : String,
	light_id : String,
	name : String,
  created_at:{type:Date, default: Date.now},
	modelid : String,
	onStatus : Boolean,
	bri : Number,
  hue : Number,
	sat : Number,
	reachable : Boolean,
  type : String,
  operation : String,
	user_id : String
});

module.exports = mongoose.model('LightRecord', LightRecord);
