var express = require('express');
var router = express.Router();
var app = express();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('https');
var Hue = require('philips-hue-api');
<<<<<<< HEAD
// var username = 'newdeveloper'
var username = '1ed3f31c3acf5785314ef90f6354675';
var bridge_ip = '172.16.1.2';
var URL = 'http://' + bridge_ip + '/api/' + username + '/';
var LOCAL_URL = 'http://localhost:8000/api/newdeveloper/';
// get all lights data
router.get('/getall', function(req,res){
    hue = Hue(LOCAL_URL);
    hue.lights().list(function(error, lights){
      if(error){
        res.status(400);
        res.send('Error: ' + error);
      }
      res.status(200);
      res.send(lights);
    });
=======
var username = 'newdeveloper'

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// get all lights data
router.get('/getall', function(req,res){
  hue = Hue('http://localhost:8000/api/newdeveloper/lights');
  hue.lights().list(function(error, lights){
    console.log(lights);
>>>>>>> 0669d2403c518bfa91bcd3402a0ae685f2ff3f63
  });
});  

<<<<<<< HEAD
// switching light on
router.get('/on/:light_id', function(req,res){
	var light_id = req.params.thermo_id;
    hue = Hue(LOCAL_URL);
    hue.lights(light_id).on();
    console.log("light:" + light_id + " switched on!!")
=======
// get one particular light data
router.get('/getlight/:light_id', function(req,res){
  var light_id = req.params.light_id;
  hue = Hue('http://localhost:8000/api/newdeveloper/lights');
  hue.lights().getState(function(error, light){
    console.log(light.lights[light_id.toString()]);
>>>>>>> 0669d2403c518bfa91bcd3402a0ae685f2ff3f63
  });
});  

// switching light on
router.post('/on/:light_id', function(req,res){
  var light_id = req.params.light_id;
  console.log("light id: " + light_id);
  hue = Hue('http://localhost:8000/api/newdeveloper/lights');
  hue.lights(parseInt(light_id)).on();
  console.log("light:" + light_id + " switched on!!");
}); 

// switching light off
<<<<<<< HEAD
router.get('/off/:light_id', function(req,res){
	var light_id = req.params.thermo_id;
    hue = Hue(LOCAL_URL);
    hue.lights(light_id).off();
    console.log("light:" + light_id + " switched off!!")
  });
=======
router.post('/off/:light_id', function(req,res){
  var light_id = req.params.light_id;
  console.log("light id: " + light_id);
  hue = Hue('http://localhost:8000/api/newdeveloper/lights');
  hue.lights(parseInt(light_id)).off();
  console.log("light:" + light_id + " switched off!!")
});  

// change light color
// Can be: red, orange, yellow, green, white, blue, purple, magenta, or pink.
router.post('/change/:light_id/:colorname', function(req,res){
  var light_id = req.params.light_id;
  var new_color = req.params.colorname;
    hue = Hue('http://localhost:8000/api/newdeveloper/lights');
    hue.lights(parseInt(light_id)).lightcolor(new_color);
    console.log("Color is changed to " + new_color + "for light: " + light_id);
  });  

>>>>>>> 0669d2403c518bfa91bcd3402a0ae685f2ff3f63
module.exports = router;


