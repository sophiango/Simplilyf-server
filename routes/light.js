var express = require('express');
var router = express.Router();
var app = express();
var Hue = require('philips-hue-api');
// var username = 'newdeveloper'
var username = '1ed3f31c3acf5785314ef90f6354675';
var bridge_ip = '172.16.1.2';
var URL = 'http://' + bridge_ip + '/api/' + username + '/';
var local_test = 'http://localhost:8000/api/newdeveloper/';
// get all lights data
router.get('/getall', function(req,res){
    hue = Hue(URL);
    hue.lights().list(function(error, lights){
      if(error){
        res.status(400);
        res.send('Error: ' + error);
      }
      res.status(200);
      res.send(lights);
    });
  });

// switching light on
router.get('/on/:light_id', function(req,res){
	var light_id = req.params.thermo_id;
    hue = Hue(URL);
    hue.lights(light_id).on();
    console.log("light:" + light_id + " switched on!!")
  });

// switching light off
router.get('/off/:light_id', function(req,res){
	var light_id = req.params.thermo_id;
    hue = Hue(URL);
    hue.lights(light_id).off();
    console.log("light:" + light_id + " switched off!!")
  });
module.exports = router;
