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
    hue = Hue('http://localhost:8000/api/newdeveloper');
    hue.lights().list(function(error, lights){
    	console.log(lights);
    });
  });  

// switching light on
router.get('/on/:light_id', function(req,res){
	var light_id = req.params.thermo_id;
    hue = Hue('http://localhost:8000/api/newdeveloper');
    hue.lights(light_id).on();
    console.log("light:" + light_id + " switched on!!")
  }); 

// switching light off
router.get('/off/:light_id', function(req,res){
	var light_id = req.params.thermo_id;
    hue = Hue('http://localhost:8000/api/newdeveloper');
    hue.lights(light_id).off();
    console.log("light:" + light_id + " switched off!!")
  });  
module.exports = router;


