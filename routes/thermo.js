var express = require('express');
var router = express.Router();
var nest = require('unofficial-nest-api');
var User = require('../models/user');
var Thermo = require('../models/thermo');
var chance = require('chance').Chance();
// var username = 'sophia2901@gmail.com';
// var password = 'Cmpe@295';

router.post('/signin',function nestSignin(req,res){
  var username = req.body.username;
  var password = req.body.password;
  nest.login(username, password, function (err, data) {
  if (err) {
      res.status(400);
      res.send(err.message);
  } else {
      console.log('data' + JSON.stringify(data));
      res.send(data);
  }
});
});

router.post('/new', function addNewThermo(req,res){
  var fullname = req.body.fullname;
  var username = req.body.username;
  var password = req.body.password;
  nest.login(username, password, function (err, data) {
    if (err) {
        res.status(400);
        res.send(err.message);
    } else {
      console.log('data' + data);
      nest.fetchStatus(function (data) {
        if (!data){
          res.status(400);
          res.send('No data response');
        } else {
          //console.log('DATA ' + JSON.stringify(data.device));
          var response = '';
          var devices = [];
          for (var deviceId in data.device) {
              if (data.device.hasOwnProperty(deviceId)) {
                  device = data.shared[deviceId];
                  var tempInF = nest.ctof(device.target_temperature);
                  devices.push({name:device.name,current_temp:tempInF});
              }
          }
          var newThermo = {
              vendor:'nest',
              thermo_id:chance.natural({min: 1, max: 10000}).toString(),
              thermo_name:'test'
          };
          // var userEmail = req.user.username;
          var userEmail = 'sophia2901@gmail.com';
          console.log('user email: ' + userEmail);
          User.findOneAndUpdate(
              { 'email' :  userEmail},
              {$push: {thermos:newThermo}},
              {safe: true, upsert: true},
              function(err, model) {
                if (err){
                  console.log(err);
                } else {
                  console.log(model);
                  res.status(200);
                  res.send(JSON.stringify(devices));
                }
              }
            );
          //subscribe();
        }
      }); //  fetchStatus callback
    } // else
  });
});

// function subscribe() {
//     nest.subscribe(subscribeDone, ['shared', 'energy_latest']);
// };
//
// function subscribeDone(deviceId, data, type) {
//     // data if set, is also stored here: nest.lastStatus.shared[thermostatID]
//     if (deviceId) {
//         console.log('Device: ' + deviceId + ' type: ' + type);
//         console.log(JSON.stringify(data));
//     } else {
//         console.log('No data');
//
//     }
//     setTimeout(subscribe, 2000);
// };

router.get('/:thermo_name',function getTempByName(req,res){
  var thermo_name = req.params.thermo_name;
  var current_temp;
  nest.fetchStatus(function (data) {
    for (var deviceId in data.device) {
      if (data.device.hasOwnProperty(deviceId)) {
          var device = data.shared[deviceId];
          if (device.name == thermo_name){
              current_temp = device.current_temperature;
          }
      }
    }
  });
  if (current_temp!==null){
    res.status(200);
    res.send(current_temp);
  } else {
    res.status(400);
    res.send('Cannot fetch data');
  }
});

// change to put instead
router.put('/', function changeTempByName(req,res){
    var thermo_name = req.body.thermo_name;
    var updated_temp = req.body.updated_temp;
    var thermo_id = req.body.thermo_id;
    //var userId = req.user.user_id;
    var success = false;
    nest.fetchStatus(function (data) {
      for (var deviceId in data.device) {
        if (data.device.hasOwnProperty(deviceId)) {
            var device = data.shared[deviceId];
            if (device.name == thermo_name){
                nest.setTemperature(deviceId, updated_temp);
                if(nest.ctof(device.target_temperature)===updated_temp){
                  success = true;
                }
            }
        }
      }

      // console.log('user id: ' + userId);
      // if (success === true){
      // var newThermoRecord = {
      //   thermo_name : thermo_name,
      //   current_temp : updated_temp,
      //   user_id : userId,
      //   thermo_id : thermo_id,
      //   thermo_mode : "away",
      //   operation : 1
      // };
      // console.log("success? " + success);
      //   res.status(200);
      //   res.send('Successfully change temperature to ' + updated_temp);
      // } else {
      //   res.status(400);
      //   res.send('Unable to change the temperature. Please try again later');
      // }
      res.status(200);
      res.send("Complete");
    });
});

router.post('/all/temp/:temp', function changeTemp(req,res){
  var updated_temp = req.params.temp;
  var successCount = 0;
  var deviceCount = 0;
  nest.fetchStatus(function (data) {
    for (var deviceId in data.device) {
      if (data.device.hasOwnProperty(deviceId)) {
         deviceCount++;
         var device = data.shared[deviceId];
                // here's the device and ID
         nest.setTemperature(deviceId, updated_temp);
         if(device.current_temperature==updated_temp){
            successCount++;
        }
      }
    }
    if (successCount == deviceCount){
      res.status(200);
      res.send('Successfully change temperature for ' + successCount + ' thermostats');
    } else {
      res.status(400);
      res.send('Unable to change the temperature. Please try again later');
    }
  });
});

router.post('/all/temp/:temp', function changeTemp(req,res){
  var updated_temp = req.params.temp;
  var successCount = 0;
  var deviceCount = 0;
  nest.fetchStatus(function (data) {
    for (var deviceId in data.device) {
      if (data.device.hasOwnProperty(deviceId)) {
         deviceCount++;
         var device = data.shared[deviceId];
                // here's the device and ID
         nest.setTemperature(deviceId, updated_temp);
         if(device.current_temperature==updated_temp){
            successCount++;
        }
      }
    }
    if (successCount == deviceCount){
      res.status(200);
      res.send('Successfully change temperature for ' + successCount + ' thermostats');
    } else {
      res.status(400);
      res.send('Unable to change the temperature. Please try again later');
    }
  });
});

// When setting away mode, all thermostat in the houses will be change status
router.put('/mode', function setAwayMode(req,res){
  var mode = req.body.thermo_mode;
  nest.fetchStatus(function (data) {
   if (!data){
     res.status(400);
     res.send('Unable to fetch data');
   }
    for (var deviceId in data.device) {
      console.log('device: ' + deviceId);
        if (data.device.hasOwnProperty(deviceId)) {
                var device = data.shared[deviceId];
                // here's the device and ID
                if (mode==='away'){
                    nest.setAway();
                } else{
                    nest.setHome();
                };
        }
    }
    res.status(200);
    res.send('Successfully set mode to ' + mode);
  });
});

router.get('/all',function getStatusAllThermo(req,res){
  nest.fetchStatus(function getData(data) {
      for (var deviceId in data.device) {
          if (data.device.hasOwnProperty(deviceId)) {
              var device = data.shared[deviceId];
              console.log('deviceid: ' + deviceId);
          }
      }
    });
    res.send('Get all Successfully ');
});

module.exports = router;
