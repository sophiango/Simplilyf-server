var mongoose = require ('mongoose');

var ThermoSchema = mongoose.Schema({
  device_id : String,
	name : String,
  where_id : String,
	target_temperature_f : Number,
	target_temperature_c : Number,
	target_temperature_high_f : Number,
  target_temperature_high_c : Number,
	target_temperature_low_f : Number,
	target_temperature_low_c : Number,
  away_temperature_high_f : Number,
	away_temperature_high_c : Number,
	away_temperature_low_f : Number,
	away_temperature_low_c : Number,
  ambient_temperature_f : Number,
	ambient_temperature_c : Number,
  humidity : Number,
  can_cool : Boolean,
	can_heat : Boolean,
	has_leaf : Boolean,
	hvac_mode : String,
	is_using_emergency_heat : Boolean,
	has_fan : Boolean,
  timestamp : Date
});

module.exports = mongoose.model('Thermo', ThermoSchema);
