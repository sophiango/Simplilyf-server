/* Authored by Sophia Ngo and Prachi Jain */

var express = require('express');
var router = express.Router();
var app = express();
var Hue = require('philips-hue-api');
var username = 'newdeveloper';
var LightRecord = require('../models/light');
var User = require('../models/user');
var chance = require('chance').Chance();

var username = 'newdeveloper'
var username = '1ed3f31c3acf5785314ef90f6354675';
var bridge_ip = '172.16.1.2';
var URL = 'http://' + bridge_ip + '/api/' + username + '/';
var LOCAL_URL = 'http://localhost:8000/api/newdeveloper/';


router.post('/new',function(req,res){
  var successCount = 0;
  var message = '';
  var username = req.body.username;
  var password = req.body.password;
  var newLight = [
     {
      vendor:'philips',
      light_id:'1',
      light_name:'light1'},
      {
        vendor:'philips',
        light_id:'2',
        light_name:'light2'},
      {
        vendor:'philips',
        light_id:'3',
        light_name:'light3'}
    ];
  // var userEmail = req.user.username;
  User.findOneAndUpdate(
      { 'email' :  username},
      {$set: {lights:newLight}},
      {safe: true, upsert: true},
      function(err, model) {
        if (err){
          message = message + err;
          console.log('message: ' + message);
        } else {
          successCount++;
        }
      }
    );
    var philipsAcc = {
      vendor:'philips',
      username:username,
      password:password
    }
    User.findOneAndUpdate(
        { 'email' :  req.user.email},
    {$push:{devicesAcc:philipsAcc}},
    {safe: true, upsert: true},
    function(err, model) {
      if (err){
        message = message + err;
        console.log('message: ' + message);
      } else {
        successCount++;
      }
    }
  );
  setTimeout(function(){
  if (successCount>=2){
    res.status(200);
    res.send('Successfully added light(s) to user account');
  } else {
    res.status(400);
    console.log('message: ' + message);
    res.send(message);
  }
  }, 1000);
});

router.post('/off/all', function turnOffAllLight(req,res){

});


router.get('/getall', function(req,res){
  hue = Hue(LOCAL_URL);
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
  });
});

// switching light on
router.post('/on/:light_id', function(req,res){
  if (req.user===undefined){
    res.status(400);
    res.send('User must login with the application before adding device');
  } else {
  var light_id = req.params.light_id;
  hue = Hue(LOCAL_URL);
  hue.lights(parseInt(light_id)).on();
  hue.lights(parseInt(light_id)).getState(function(error, light){
    if(error){
        res.status(400);
        res.send('Error: ' + error);
      } else {
        var newLightRecord = new LightRecord({
          record_id : chance.natural({min: 1, max: 100000000}).toString(),
        	light_id : light_id,
        	name : light.name,
        	modelid : light.modelid,
        	onStatus : light.state.on,
        	bri : light.state.bri,
          hue : light.state.hue,
        	sat : light.state.sat,
        	reachable : light.reachable,
          type : light.type,
          operation : 'switched on light',
          user_id : req.user.user_id
        });
        newLightRecord.save(function(err){
          if (err){
            res.status(400);
            res.send(err);
          } else {
            res.status(200);
            res.send(light);
          }
        });
      }
    });
  }
});

// switching ALL lights on
router.post('/all/on', function(req,res){
  if (req.user===undefined){
    res.status(400);
    res.send('User must login with the application before adding device');
  } else {
    var successCount = 0;
    var message = '';
    hue = Hue(LOCAL_URL);
    var available_lights = req.user.lights.length;
    for (var light_id = 1; light_id <= available_lights; light_id++){
        hue.lights(parseInt(light_id)).on();
        hue.lights(parseInt(light_id)).getState(function(error, light){
          if(error){
              message = message + error;
            } else {
              var newLightRecord = new LightRecord({
                record_id : chance.natural({min: 1, max: 100000000}).toString(),
                light_id : light_id,
                name : light.name,
                modelid : light.modelid,
                onStatus : light.state.on,
                bri : light.state.bri,
                hue : light.state.hue,
                sat : light.state.sat,
                reachable : light.reachable,
                type : light.type,
                operation : 'switched on light',
                user_id : req.user.user_id
              });
              newLightRecord.save(function(err){
                if (err){
                  message = message + err;
                } else {
                  successCount++;
                }
              });
            }
          });
  } // end for loop
  setTimeout(function(){
  if (successCount===available_lights){
    res.status(200);
    res.send('Successfully turn on all lights in the house');
  } else {
    res.status(400);
    res.send('Not able to turn on all lights in the house ' + message);
  }
  }, 1000);
} // end else
});

// switching light off
router.post('/off/:light_id', function(req,res){
  if (req.user===undefined){
    res.status(400);
    res.send('User must login with the application before adding device');
  } else {
  var light_id = req.params.light_id;
  hue = Hue(LOCAL_URL);
  hue.lights(parseInt(light_id)).off();
  hue.lights(parseInt(light_id)).getState(function(error, light){
    if(error){
        res.status(400);
        res.send('Error: ' + error);
      } else {
        var newLightRecord = new LightRecord({
          record_id : chance.natural({min: 1, max: 100000000}).toString(),
        	light_id : light_id,
        	name : light.name,
        	modelid : light.modelid,
        	onStatus : light.state.on,
        	bri : light.state.bri,
          hue : light.state.hue,
        	sat : light.state.sat,
        	reachable : light.reachable,
          type : light.type,
          operation : 'switched off light',
          user_id : req.user.user_id
        });
        newLightRecord.save(function(err){
          if (err){
            res.status(400);
            res.send(err);
          } else {
            res.status(200);
            res.send(light);
          }
        });
      }
    });
  }
});

// switching ALL lights on
router.post('/all/off', function(req,res){
  if (req.user===undefined){
    res.status(400);
    res.send('User must login with the application before adding device');
  } else {
    var successCount = 0;
    var message = '';
    hue = Hue(LOCAL_URL);
    var available_lights = req.user.lights.length;
    for (var light_id = 1; light_id <= available_lights; light_id++){
        hue.lights(parseInt(light_id)).off();
        hue.lights(parseInt(light_id)).getState(function(error, light){
          if(error){
              message = message + error;
            } else {
              var newLightRecord = new LightRecord({
                record_id : chance.natural({min: 1, max: 100000000}).toString(),
                light_id : light_id,
                name : light.name,
                modelid : light.modelid,
                onStatus : light.state.on,
                bri : light.state.bri,
                hue : light.state.hue,
                sat : light.state.sat,
                reachable : light.reachable,
                type : light.type,
                operation : 'switched off light',
                user_id : req.user.user_id
              });
              newLightRecord.save(function(err){
                if (err){
                  message = message + err;
                } else {
                  successCount++;
                }
              });
            }
          });
  } // end for loop
  setTimeout(function(){
  if (successCount===available_lights){
    res.status(200);
    res.send('Successfully turn off all lights in the house');
  } else {
    res.status(400);
    res.send('Not able to turn off all lights in the house ' + message);
  }
  }, 1000);
} // end else
});

// changing color
router.post('/color/:light_id/:colorname', function(req,res){
  if (req.user===undefined){
    res.status(400);
    res.send('User must login with the application before adding device');
  } else {
  var light_id = req.params.light_id;
  var new_color = req.params.colorname;
  console.log('light: ' + light_id + ' color: ' + new_color);
  hue = Hue(LOCAL_URL);
  hue.lights(parseInt(light_id)).lightcolor(new_color);
  hue.lights(parseInt(light_id)).getState(function(error, light){
    if(error){
        res.status(400);
        res.send('Error: ' + error);
      } else {
        var newLightRecord = new LightRecord({
          record_id : chance.natural({min: 1, max: 100000000}).toString(),
        	light_id : light_id,
        	name : light.name,
        	modelid : light.modelid,
        	onStatus : light.state.on,
        	bri : light.state.bri,
          hue : light.state.hue,
        	sat : light.state.sat,
        	reachable : light.reachable,
          type : light.type,
          operation : 'change color',
          user_id : req.user.user_id
        });
        newLightRecord.save(function(err){
          if (err){
            res.status(400);
            res.send(err);
          } else {
            res.status(200);
            res.send(light);
          }
        });
      }
    });
  }
});

// changing ALL lights color on
router.post('/all/color/:colorname', function(req,res){
  if (req.user===undefined){
    res.status(400);
    res.send('User must login with the application before adding device');
  } else {
    var successCount = 0;
    var message = '';
    hue = Hue(LOCAL_URL);
    var available_lights = req.user.lights.length;
    var new_color = req.params.colorname;
    console.log('color: ' + new_color);
    for (var light_id = 1; light_id <= available_lights; light_id++){
        hue.lights(parseInt(light_id)).lightcolor(new_color);
        hue.lights(parseInt(light_id)).getState(function(error, light){
          if(error){
              message = message + error;
            } else {
              var newLightRecord = new LightRecord({
                record_id : chance.natural({min: 1, max: 100000000}).toString(),
                light_id : light_id,
                name : light.name,
                modelid : light.modelid,
                onStatus : light.state.on,
                bri : light.state.bri,
                hue : light.state.hue,
                sat : light.state.sat,
                reachable : light.reachable,
                type : light.type,
                operation : 'change color',
                user_id : req.user.user_id
              });
              newLightRecord.save(function(err){
                if (err){
                  message = message + err;
                } else {
                  successCount++;
                }
              });
            }
          });
  } // end for loop
  setTimeout(function(){
  if (successCount===available_lights){
    res.status(200);
    res.send('Successfully change color of all lights in the house');
  } else {
    res.status(400);
    res.send('Not able to change color of all lights in the house ' + message);
  }
  }, 1000);
} // end else
});

module.exports = router;
