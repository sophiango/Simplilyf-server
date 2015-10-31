var express = require('express');
var router = express.Router();
var app = express();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('https');
var Hue = require('philips-hue-api');
var username = 'newdeveloper'

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// get all lights data
router.get('/getall', function(req,res){
  hue = Hue('http://localhost:8000/api/newdeveloper/');
  hue.lights().list(function(error, lights){
    console.log(lights);
  });
});  

// get one particular light data
router.get('/getlight/:light_id', function(req,res){
  var light_id = req.params.light_id;
  hue = Hue('http://localhost:8000/api/newdeveloper/');
  hue.lights(parseInt(light_id)).getState(function(error, light){
    console.log(light);
  });
});  

// switching light on
router.post('/on/:light_id', function(req,res){
  var light_id = req.params.light_id;
  console.log("light id: " + light_id);
  hue = Hue('http://localhost:8000/api/newdeveloper/');
  hue.lights(parseInt(light_id)).on();
  hue.lights(parseInt(light_id)).getState(function(error, res){
    console.log(res.state.on);
    console.log("light:" + light_id + " switched on!!");
  });
}); 

// switching light off
router.post('/off/:light_id', function(req,res){
  var light_id = req.params.light_id;
  console.log("light id: " + light_id);
  hue = Hue('http://localhost:8000/api/newdeveloper/');
  hue.lights(parseInt(light_id)).off();
  hue.lights(parseInt(light_id)).getState(function(error, res){
    console.log(res.state.on);
    console.log("light:" + light_id + " switched off!!");
  });
});  

// change light color
// Can be: red, orange, yellow, green, white, blue, purple, magenta, or pink.
router.post('/change/:light_id/:colorname', function(req,res){
  var light_id = req.params.light_id;
  var new_color = req.params.colorname;
    hue = Hue('http://localhost:8000/api/newdeveloper/');
    hue.lights(parseInt(light_id)).lightcolor(new_color);
    hue.lights(parseInt(light_id)).getState(function(error, res){
      console.log(res.state.hue);
      console.log("Color is changed to " + new_color + "for light: " + light_id);
    });
  });  

module.exports = router;


