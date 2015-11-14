var mongoose = require ('mongoose');

var ThermoSchema = mongoose.Schema({
  created_at:{type:Date, default: Date.now},
  thermo_name : String,
  current_temp : Number,
  user_id : String,
  thermo_id : String,
  thermo_mode : String,
  operation : Number
});

// var ThermoSchema = mongoose.Schema({
//     $version : Number,
//     $timestamp : Number,
//     auto_away : Number,
//     auto_away_learning : String,
//     can_cool : Boolean,
//     can_heat : Boolean,
//     compressor_lockout_enabled : Boolean,
//     compressor_lockout_timeout : Number,
//     current_temperature : Number,
//     hvac_ac_state : Boolean,
//     hvac_alt_heat_state : Boolean,
//     hvac_alt_heat_x2_state : Boolean,
//     hvac_aux_heater_state : Boolean,
//     hvac_cool_x2_state : Boolean,
//     hvac_emer_heat_state : Boolean,
//     hvac_fan_state : Boolean,
//     hvac_heat_x2_state : Boolean,
//     hvac_heat_x3_state : Boolean,
//     hvac_heater_state : Boolean,
//     name : String,
//     target_change_pending : Boolean,
//     target_temperature : Number,
//     target_temperature_high : Number,
//     target_temperature_low : Number,
//     target_temperature_type : String
// });

module.exports = mongoose.model('Thermo', ThermoSchema);
