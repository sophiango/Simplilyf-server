/* Authored by Sophia Ngo and Prachi Jain */

var express = require('express');
var router = express.Router();
var app = express();
var Hue = require('philips-hue-api');
var LightRecord = require('../models/light');
var User = require('../models/user');
var chance = require('chance').Chance();

var username = 'newdeveloper'
var username = '1ed3f31c3acf5785314ef90f6354675';
var bridge_ip = '172.16.1.2';
var URL = 'http://' + bridge_ip + '/api/' + username + '/';
var LOCAL_URL = 'http://localhost:8000/api/newdeveloper/';


router.post('/new',function(req,res){
  console.log('Adding new Philips account');
  var successCount = 0;
  var message = '';
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
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
  console.log('Update user account - lights');
  User.findOneAndUpdate(
      { 'email' :  email},
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
    var philip = {
      username:email,
      password:password
    }
    console.log('Update user account - device account');
    User.findOneAndUpdate(
        { 'email' :  email},
    {$push:{philipAcc:philip}},
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
  var lights = [];
  var available_lights = 3;
  var hue = Hue(LOCAL_URL);
  console.log('Getting 3 lights');
  for (var light_id = 1; light_id <= available_lights; light_id++){
    hue.lights(parseInt(light_id)).getState(function(error, light){
      if(error){
        message = message + err;
        return;
      } else {
        successCount++;
        var single_light = {
          status : light.state.on,
          hue : light.state.hue,
          name : light.name
        }
        lights.push(single_light);
      }
    });
  }
  setTimeout(function(){
  if (successCount===5){
    console.log(lights);
    res.status(200);
    res.send(lights);
  } else {
    res.status(400);
    res.send(message);
  }
  }, 1000);
});

router.post('/getall', function(req,res){
  var email = req.body.email;
  console.log('email: ' + email);
  User.findOne({ 'email' :  email},function(err,foundUser){
    if (err){
      res.status(400);
      res.send('No user found');
    } else {
      if (foundUser.lights.length==0){
        res.status(400);
        res.send('User has no lights registered');
      } else {
        var lights = [];
        var available_lights = 3;
        var hue = Hue(LOCAL_URL);
        for (var light_id = 1; light_id <= available_lights; light_id++){
        hue.lights(parseInt(light_id)).getState(function(error, light){
          if(error){
            res.status(400);
            res.send(error);
            return;
          } else {
            var single_light = {
              status : light.state.on,
              hue : light.state.hue,
              name : light.name
            }
            lights.push(single_light);
          }
        });
        }
        var successCallback = function() {
            if (lights.length===3) {
              res.status(200);
              res.send(lights);
            } else {
              setTimeout(successCallback, 1000);
            }
        }
        successCallback();
      }
      }
  });
});

// get one particular light data
router.get('/getlight/:light_id', function(req,res){
  var light_id = req.params.light_id;
  var hue = Hue(LOCAL_URL);
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
  var user_id = req.body.user_id;
  var light_id = req.params.light_id;
  var hue = Hue(LOCAL_URL);
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
          user_id : user_id
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
});

// switching ALL lights on
router.post('/all/on', function(req,res){
    var user_id = '5790';
    // var user_id = req.body.user_id;
    var lights = [];
    var successCount = 0;
    var message = '';
    var hue = Hue(LOCAL_URL);
    var available_lights = 3;
    for (var light_id = 1; light_id <= available_lights; light_id++){
        hue.lights(parseInt(light_id)).on();
        hue.lights(parseInt(light_id)).getState(function(error, light){
          if(error){
              message = message + error;
            } else {
              lights.push(light);
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
                user_id : user_id
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
    res.send(lights);
  } else {
    res.status(400);
    res.send(message);
  }
  }, 1000);
});

// switching light off
router.post('/off/:light_id', function(req,res){
  var user_id = req.body.user_id;
  var light_id = req.params.light_id;
  var hue = Hue(LOCAL_URL);
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
          user_id : user_id
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
});

// switching ALL lights on
router.post('/all/off', function(req,res){
    var user_id = req.body.user_id;
    var lights = [];
    var successCount = 0;
    var message = '';
    var hue = Hue(LOCAL_URL);
    var available_lights = 3;
    for (var light_id = 1; light_id <= available_lights; light_id++){
        hue.lights(parseInt(light_id)).off();
        hue.lights(parseInt(light_id)).getState(function(error, light){
          if(error){
              message = message + error;
            } else {
              lights.push(light);
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
                user_id : user_id
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
    res.send(lights);
  } else {
    res.status(400);
    res.send(message);
  }
  }, 1000);
});

// changing color
router.post('/color/:light_id/:colorname', function(req,res){
  var user_id = req.body.user_id;
  var light_id = req.params.light_id;
  var new_color = req.params.colorname;
  console.log('light: ' + light_id + ' color: ' + new_color);
  var hue = Hue(LOCAL_URL);
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
          user_id : user_id
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
});

// changing ALL lights color on
router.post('/all/color/:colorname', function(req,res){
    var user_id = req.body.user_id;
    var lights = [];
    var successCount = 0;
    var message = '';
    var hue = Hue(LOCAL_URL);
    var available_lights = 3;
    var new_color = req.params.colorname;
    console.log('color: ' + new_color);
    for (var light_id = 1; light_id <= available_lights; light_id++){
        hue.lights(parseInt(light_id)).lightcolor(new_color);
        hue.lights(parseInt(light_id)).getState(function(error, light){
          if(error){
              message = message + error;
            } else {
              lights.push(light);
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
                user_id : user_id
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
    res.send(lights);
  } else {
    res.status(400);
    res.send(message);
  }
  }, 1000);
});

module.exports = router;
