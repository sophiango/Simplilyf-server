var express = require('express');
var router = express.Router();
var nest = require('unofficial-nest-api');
var User = require('../models/user');
var Thermo = require('../models/thermo');
var chance = require('chance').Chance();

// router.post('/test',function(req,res){
//   var username = 'sophia2901@gmail.com';
//   var password = 'Cmpe@295';
//   nest.login(username, password, function (err, data) {
//     if (err) {
//         res.status(400);
//         res.send(err.message);
//     } else {
//       nest.fetchStatus(function (data) {
//         if (!data){
//           res.status(400);
//           res.send('No data response');
//         } else {
//           var input_vendor = req.body.vendor;
//           //console.log('DATA ' + JSON.stringify(data.device));
//           var response = '';
//           var devices = [];
//           var existing_devices = [];
//           for (var deviceId in data.device) {
//               if (data.device.hasOwnProperty(deviceId)) {
//                     device = data.shared[deviceId];
//                     console.log(JSON.stringify(device.target_temperature_type));
//                   // console.log(nest.getStructureId());
//               }
//           }
//         }
//       });
//     }
//   });
// });

router.post('/new', function addNewThermo(req,res){
  if (req.user===undefined){
    res.status(400);
    res.send('User must login with the application before adding device');
  } else {
    var fullname = req.body.fullname;
    var username = req.body.username;
    var password = req.body.password;
  nest.login(username, password, function (err, data) {
    if (err) {
        res.status(400);
        res.send(err.message);
    } else {
      nest.fetchStatus(function (data) {
        if (!data){
          res.status(400);
          res.send('No data response');
        } else {
          var input_vendor = req.body.vendor;
          var response = '';
          var devices = [];
          var existing_devices = [];
          var successCount = 0;
          for (var deviceId in data.device) {
              if (data.device.hasOwnProperty(deviceId)) {
                  device = data.shared[deviceId];
                  var rand_thermo_id = chance.natural({min: 1, max: 10000}).toString();
                  var tempInF = nest.ctof(device.target_temperature);

                  // create new thermo record
                  var newThermoRecord = new Thermo({
                    thermo_name : device.name,
                    target_temperature : nest.ctof(device.target_temperature),
                    target_temperature_high : nest.ctof(device.target_temperature_high),
                    target_temperature_low : nest.ctof(device.target_temperature_low),
                    target_temperature_mode : device.target_temperature_type,
                    user_id : req.user.user_id,
                    thermo_id : rand_thermo_id,
                    thermo_mode : 'home',
                    operation : 0,
                  });

                  newThermoRecord.save(function(err){
                    if (err){
                      console.log(err);
                    } else {
                      console.log('Insert new record to thermo record');
                    }
                  });

                  existing_devices.push(
                    {
                      vendor:input_vendor,
                      thermo_id:rand_thermo_id,
                      thermo_name:device.name
                    });
              }
          }
          // update user
          User.findOneAndUpdate(
              { 'email' :  req.user.email},
              {$set: {thermos:existing_devices}},
              {safe: true, upsert: true},
              function(err, model) {
                if (err){
                  res.status(400);
                  res.send(err);
                } else {
                  res.status(200);
                  res.send('Successfully added thermostat(s) to user account');
                }
              }
            );
          //subscribe();
        }
      }); //  fetchStatus callback
    } // else
  });
} // else login
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
  // set all
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
      res.send("Successfully change the temperature of " + thermo_name + " to " + updated_temp);
    });
});

router.post('/all', function changeTemp(req,res){
  var updated_temp = req.body.updated_temp;
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
                }
                if (mode==='home'){
                    nest.setHome();
                }
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
