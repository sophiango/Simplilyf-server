/* Authored by Sophia Ngo*/

var express = require('express');
var router = express.Router();
var nest = require('unofficial-nest-api');
var User = require('../models/user');
var ThermoRecord = require('../models/thermo');
var chance = require('chance').Chance();

/* POST /thermo/new  -- User sign in with their Nest credential so the app can be authorized */

router.post('/new', function addNewThermo(req,res){
  if (req.user===undefined){
    res.status(400);
    res.send('User must login with the application before adding device');
  } else {
    var successCount = 0;
    var fullname = req.body.fullname;
    var username = req.body.username;
    var password = req.body.password;
  nest.login(username, password, function (err, data) {
    if (err) {
        res.status(400);
        res.send(err);
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
                  // var rand_thermo_id = chance.natural({min: 1, max: 10000}).toString();
                  var tempInF = nest.ctof(device.target_temperature);

                  // create new thermo record
                  var newThermoRecord = new ThermoRecord({
                    record_id:chance.natural({min: 1, max: 100000000}).toString(),
                    thermo_name : device.name,
                    target_temperature : nest.ctof(device.target_temperature),
                    target_temperature_high : nest.ctof(device.target_temperature_high),
                    target_temperature_low : nest.ctof(device.target_temperature_low),
                    target_temperature_mode : device.target_temperature_type,
                    user_id : req.user.user_id,
                    thermo_id : deviceId,
                    thermo_mode : 'home',
                    operation : 'add thermo'
                  });

                  newThermoRecord.save(function(err){
                    if (err){
                      //console.log(err);
                    } else {
                      successCount++;
                      //console.log('Insert new record to thermo record');
                    }
                  });

                  existing_devices.push(
                    {
                      vendor:input_vendor,
                      thermo_id:deviceId,
                      thermo_name:device.name
                    });
              }
          }
          var nestAcc = {
            vendor:'Nest',
            username:username,
            password:password
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
                  successCount++;
                }
              }
            );
            User.findOneAndUpdate(
                { 'email' :  req.user.email},
            {$push:{devicesAcc:nestAcc}},
            {safe: true, upsert: true},
            function(err, model) {
              if (err){
                res.status(400);
                res.send(err);
              } else {
                successCount++;
              }
            }
          );
          if (successCount>=3){
            res.status(200);
            res.send('Successfully added thermostat(s) to user account');
          }
          //subscribe();
        }
      }); //  fetchStatus callback
    } // else
  });
} // else login
});

/* GET /thermo/all -- Get all the information of the thermostat */
router.get('/all',function getStatusAllThermo(req,res){
  if (req.user===undefined){
    res.status(400);
    res.send('Lost session, unable to find user. Require user to login again');
  } else {
  var devices = [];
  nest.fetchStatus(function getData(data) {
      for (var deviceId in data.device) {
          if (data.device.hasOwnProperty(deviceId)) {
              var device = data.shared[deviceId];
              devices.push(device);
          }
      }
      if (devices.length>0){
        res.status(200);
        res.send(devices);
      } else {
        res.status(400);
        res.send('Error getting data');
      }
    });
  }
});

/* GET /thermo/:thermo_id  -- Get the temperature of a specific thermostat by passing the thermostat name*/
router.get('/:thermo_name',function getTempByName(req,res){
  if (req.user===undefined){
    res.status(400);
    res.send('Lost session, unable to find user. Require user to login again');
  } else {
  var thermo_name = req.params.thermo_name;
  var current_temp;
  nest.fetchStatus(function (data) {
    for (var deviceId in data.device) {
      if (data.device.hasOwnProperty(deviceId)) {
          var device = data.shared[deviceId];
          if (device.name === thermo_name){
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
}
});

/* PUT /thermo with {thermo_name, updated_temp} -- Change the temperature of a specific thermostat*/
router.put('/', function changeTempByName(req,res){
  if (req.user===undefined){
    res.status(400);
    res.send('Lost session, unable to find user. Require user to login again');
  } else {
    var thermo_name = req.body.thermo_name;
    var updated_temp = req.body.updated_temp;
    var target_temperature_high = 0;
    var target_temperature_low = 0;
    var target_temperature_mode = '';
    //var userId = req.user.user_id;
    nest.fetchStatus(function (data) {
    if (data){
      for (var deviceId in data.device) {
        if (data.device.hasOwnProperty(deviceId)) {
            var device = data.shared[deviceId];
            if (device.name == thermo_name){
                nest.setTemperature(deviceId, updated_temp);
                target_temperature_high = nest.ctof(device.target_temperature_high);
                target_temperature_low = nest.ctof(device.target_temperature_low);
                target_temperature_type = device.target_temperature_type;

                  var newThermoRecord = new ThermoRecord({
                    record_id:chance.natural({min: 1, max: 100000000}).toString(),
                    thermo_name : device.name,
                    target_temperature : updated_temp,
                    target_temperature_high : target_temperature_high,
                    target_temperature_low : target_temperature_low,
                    target_temperature_mode : target_temperature_type,
                    user_id : req.user.user_id,
                    thermo_id : thermo_id,
                    thermo_mode : 'home',
                    operation : 'change temp individual'
                  });

                  newThermoRecord.save(function(err){
                    if (err){
                      res.status(400);
                      res.send('Unable to store the record into database');
                    } else {
                      res.status(200);
                      res.send('Successfully change the temperature of ' + thermo_name + ' to ' + updated_temp);
                    }
                  });

            } // end if device name == thermo name
        }
      }
    } else {
      res.status(400);
      res.send('Unable to fetch data');
    }
  }); // end nest fetchData
}
});

/* PUT /thermo/all with {thermo_name, updated_temp, thermo_id} -- Change the temperature of all the thermostat in the house
to the temperature the user specified */
router.put('/all', function changeTempAllThermo(req,res){
  if (req.user===undefined){
    res.status(400);
    res.send('Lost session, unable to find user. Require user to login again');
  } else {
    var updated_temp = req.body.updated_temp;
    var target_temperature_high = 0;
    var target_temperature_low = 0;
    var target_temperature_mode = '';
    var successCount = 0;
    var numThermostat = 0;
    //var userId = req.user.user_id;
    nest.fetchStatus(function (data) {
    if (data){
      for (var deviceId in data.device) {
        if (data.device.hasOwnProperty(deviceId)) {
          numThermostat++;
            var device = data.shared[deviceId];
                nest.setTemperature(deviceId, updated_temp);
                target_temperature_high = nest.ctof(device.target_temperature_high);
                target_temperature_low = nest.ctof(device.target_temperature_low);
                target_temperature_type = device.target_temperature_type;
                  var newThermoRecord = new ThermoRecord({
                    record_id:chance.natural({min: 1, max: 100000000}).toString(),
                    thermo_name : device.name,
                    target_temperature : updated_temp,
                    target_temperature_high : target_temperature_high,
                    target_temperature_low : target_temperature_low,
                    target_temperature_mode : target_temperature_type,
                    user_id : req.user.user_id,
                    thermo_id : deviceId,
                    thermo_mode : 'home',
                    operation : 'change temp all'
                  });
                  newThermoRecord.save(function(err){
                    if (err){
                      res.status(400);
                      res.send('Unable to store the record into database');
                    } else {
                      successCount++;
                    }
                  });
        }
      }
      setTimeout(function(){
      if (successCount===numThermostat){
        res.status(200);
        res.send('Successfully change the temperature of ' + thermo_name + ' to ' + updated_temp);
      } else {
        res.status(400);
        res.send('Unable to change the temperature for all thermostat');
      }
      }, 1000);
    } else {
      res.status(400);
      res.send('Unable to fetch data');
    }
  }); // end nest fetchData
}
});

// When setting away mode, all thermostat in the houses will be change status
router.put('/mode', function setAwayMode(req,res){
  if (req.user===undefined){
    res.status(400);
    res.send('Lost session, unable to find user. Require user to login again');
  } else {
  var mode = req.body.thermo_mode;
  var target_temperature_high = 0;
  var target_temperature_low = 0;
  var target_temperature_mode = '';
  var operation = '';
  var successCount = 0;
  var numThermostat = 0;
  var message = '';
  nest.fetchStatus(function (data) {
    if (data){
      for (var deviceId in data.device) {
          if (data.device.hasOwnProperty(deviceId)) {
            numThermostat++;
                  var device = data.shared[deviceId];
                  // here's the device and ID
                  if (mode==='away'){
                      nest.setAway();
                      operation='set away';
                  } else if (mode==='home'){
                      nest.setHome();
                      operation='set home';
                  }
                  target_temperature = nest.ctof(device.target_temperature);
                  target_temperature_high = nest.ctof(device.target_temperature_high);
                  target_temperature_low = nest.ctof(device.target_temperature_low);
                  target_temperature_type = device.target_temperature_type;
                    var newThermoRecord = new ThermoRecord({
                      record_id:chance.natural({min: 1, max: 100000000}).toString(),
                      thermo_name : device.name,
                      target_temperature : target_temperature,
                      target_temperature_high : target_temperature_high,
                      target_temperature_low : target_temperature_low,
                      target_temperature_mode : target_temperature_type,
                      thermo_id : deviceId,
                      user_id : req.user.user_id,
                      thermo_mode : mode,
                      operation : operation
                    });
                    newThermoRecord.save(function(err){
                      if (err){
                        message = message + 'Unable to store the record into database ' + err;
                      } else {
                        successCount++;
                      }
                    });
          }
      }
      setTimeout(function(){
          if (successCount===numThermostat){
            res.status(200);
            res.send('Successfully set mode to ' + mode + ' for all thermostat');
          } else {
            res.status(400);
            message = message + ' Unable to set mode to ' + mode + ' for all thermostat' ;
            res.send(message);
          }
      }, 1000);
    } else { // else data
      res.status(400);
      res.send('Unable to fetch data');
    }
  });
}
});

module.exports = router;
