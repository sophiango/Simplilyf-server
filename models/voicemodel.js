var mongoose = require('mongoose');
// mongoose.connect('mongodb://cmpe:295@ds041571.mongolab.com:41571/team295',function(err){
// 	if(err){
// 		console.log("error to connect to mongodb");
// 	}else{
// 		console.log("connection to mongodb successfull");
// 	}
// });
//create instance of schema
var mongoSchema = new mongoose.Schema({
"serial_no": String,
"increase_temp":{
            "type": "array",
            "items": {
                "type": "string"
            },
            "minItems": 1

        },

"decrease_temp":{
            "type": "array",
            "items": {
                "type": "string"
            },
            "minItems": 1
        },
"on_lights":{
            "type": "array",
            "items": {
                "type": "string"
            },
            "minItems": 1

        },

"off_lights":{
            "type": "array",
            "items": {
                "type": "string"
            },
            "minItems": 1
        },
"turn_on":{
            "type": "array",
            "items": {
                "type": "string"
            },
            "minItems": 1
        },
"turn_off":{
            "type": "array",
            "items": {
                "type": "string"
            },
            "minItems": 1
        },
"set_away":{
  "type": "array",
  "items": {
      "type": "string"
  },
  "minItems": 1
},
"set_home":{
  "type": "array",
  "items": {
      "type": "string"
  },
  "minItems": 1
},
"set_all":{
  "type": "array",
  "items": {
      "type": "string"
  },
  "minItems": 1
},
"set_color":{
  "type": "array",
  "items": {
      "type": "string"
  },
  "minItems": 1
}
});
//create a schema


//create a model/collection if it does not exist
module.exports=mongoose.model('smartdevices',mongoSchema);
