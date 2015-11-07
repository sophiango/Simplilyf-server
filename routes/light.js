var express = require('express');
var router = express.Router();
var app = express();
var Hue = require('philips-hue-api');
var username = 'newdeveloper';
var Light = require('../models/light');

//app.use(logger('dev'));
//app.use(cookieParser());
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: true}));

var username = 'newdeveloper'
var username = '1ed3f31c3acf5785314ef90f6354675';
var bridge_ip = '172.16.1.2';
var URL = 'http://' + bridge_ip + '/api/' + username + '/';
var LOCAL_URL = 'http://localhost:8000/api/newdeveloper/';
// get all lights data
// router.get('/getall', function(req,res){
//     hue = Hue(LOCAL_URL);
//     hue.lights().list(function(error, lights){
//       if(error){
//         res.status(400);
//         res.send('Error: ' + error);
//       } else {
//         res.status(200);
//         res.send(lights);
//       }
//     });
// });
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
  hue = Hue(LOCAL_URL);
  hue.lights(parseInt(light_id)).getState(function(error, light){
    if(error){
      res.status(400);
      res.send('Error: ' + error);
    } else {
      res.status(200);
      res.send(light);
    }
    console.log(light);

    var date = new Date();
    var newLight = new Light();
    newLight.id = light_id;
    newLight.name = light.name;
    newLight.currentTS = date;
    newLight.modelid = light.modelid;
    newLight.onStatus = light.state.on;
    newLight.bri = light.state.bri;
    newLight.hue = light.state.hue;
    newLight.sat = light.state.sat;
    newLight.reachable = light.state.reachable;
    newLight.type = light.type;
    newLight.save();
  });
});

// switching light on
router.post('/on/:light_id', function(req,res){
  var light_id = req.params.light_id;
  //console.log("light id: " + light_id);
  hue = Hue(LOCAL_URL);
  hue.lights(parseInt(light_id)).on();
  hue.lights(parseInt(light_id)).getState(function(error, light){
    if(error){
        res.status(400);
        res.send('Error: ' + error);
      } else {
        res.status(200);
        res.send(light);
      }
    console.log(light.state.on);
    console.log("light:" + light_id + " switched on!!");
    var getLight = Light.findOne({'id' :  light_id}).sort({'currentTS' : -1}).limit(1).exec(
      function(error, res){
        if(error){
          console.log(error);
        }
        else if(!res){
          console.log("Light with id:" + light_id + "is not found");
        }
        else{
          console.log("Light with id:" + light_id + "is found");

          var date = new Date();
          var newLight = new Light();
          newLight.id = light_id;
          newLight.name = res.name;
          newLight.currentTS = date;
          newLight.modelid = res.modelid;
          newLight.onStatus = light.state.on;
          newLight.bri = res.bri;
          newLight.hue = res.hue;
          newLight.sat = res.sat;
          newLight.reachable = res.reachable;
          newLight.type = res.type;
          newLight.save();
        }
      }
    );
  });
});

// switching light off
router.post('/off/:light_id', function(req,res){
  var light_id = req.params.light_id;
  //console.log("light id: " + light_id);
  hue = Hue('http://localhost:8000/api/newdeveloper/');
  hue.lights(parseInt(light_id)).off();
  hue.lights(parseInt(light_id)).getState(function(error, light){
    if(error){
      res.status(400);
      res.send('Error: ' + error);
    } else {
      res.status(200);
      res.send(light);
    }
    console.log(light.state.on);
    console.log("light:" + light_id + " switched off!!");
    var getLight = Light.findOne({'id' :  light_id}).sort({'currentTS' : -1}).limit(1).exec(
      function(error, res){
        if(error){
          console.log(error);
        }
        else if(!res){
          console.log("Light with id:" + light_id + "is not found");
        }
        else{
          console.log("Light with id:" + light_id + "is found");

          var date = new Date();
          var newLight = new Light();
          newLight.id = light_id;
          newLight.name = res.name;
          newLight.currentTS = date;
          newLight.modelid = res.modelid;
          newLight.onStatus = light.state.on;
          newLight.bri = res.bri;
          newLight.hue = res.hue;
          newLight.sat = res.sat;
          newLight.reachable = res.reachable;
          newLight.type = res.type;
          newLight.save();
        }
      }
    );
  });
});

// change light color
// Can be: red, orange, yellow, green, white, blue, purple, magenta, or pink.
router.post('/change/:light_id/:colorname', function(req,res){
  var light_id = req.params.light_id;
  var new_color = req.params.colorname;
    hue = Hue('http://localhost:8000/api/newdeveloper/');
    hue.lights(parseInt(light_id)).lightcolor(new_color);
    hue.lights(parseInt(light_id)).getState(function(error, light){
      if(error){
      res.status(400);
      res.send('Error: ' + error);
    } else {
      res.status(200);
      res.send(light);
    }
      console.log(light.state.hue + "==>" + new_color);
      console.log("Color is changed to " + new_color + "for light: " + light_id);

      var getLight = Light.findOne({'id' :  light_id}).sort({'currentTS' : -1}).limit(1).exec(
      function(error, res){
        if(error){
          console.log(error);
        }
        else if(!res){
          console.log("Light with id:" + light_id + "is not found");
        }
        else{
          console.log("Light with id:" + light_id + "is found");

          var date = new Date();
          var newLight = new Light();
          newLight.id = light_id;
          newLight.name = res.name;
          newLight.currentTS = date;
          newLight.modelid = res.modelid;
          newLight.onStatus = res.onStatus;
          newLight.bri = res.bri;
          newLight.hue = light.state.hue;
          newLight.sat = res.sat;
          newLight.reachable = res.reachable;
          newLight.type = res.type;
          newLight.save();
        }
      }
    );
    });
  });  

module.exports = router;
