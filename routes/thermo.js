/* Authored by Sophia Ngo*/

var express = require('express');
var router = express.Router();
var nest = require('unofficial-nest-api');
var User = require('../models/user');
var ThermoRecord = require('../models/thermo');
var chance = require('chance').Chance();

/* POST /thermo/new  -- User sign in with their Nest credential so the app can be authorized */

router.post('/new', function addNewThermo(req,res){
    var successCount = 0;
    var email = req.body.email;
    var fullname = req.body.fullname;
    var username = req.body.username;
    var password = req.body.password;
    var message = '';
  nest.login(username, password, function (err, data) {
    if (err) {
        res.status(403);
        res.send(err);
        return;
    } else {
      var thermo_name;
      var target_temperature;
      var target_temperature_high;
      var target_temperature_low;
      var target_temperature_mode;
      var thermo_mode;

      nest.fetchStatus(function (data) {
        if (!data){
          res.status(400);
          res.send('No data response');
          return;
        } else {
          var input_vendor = 'nest';
          var response = '';
          var devices = [];
          var existing_devices = [];
          var sendPackage = [];
          var successCount = 0;
          for (var deviceId in data.device) {
              if (data.device.hasOwnProperty(deviceId)) {
                  device = data.shared[deviceId];
                  // var rand_thermo_id = chance.natural({min: 1, max: 10000}).toString();
                  thermo_name = device.name;
                  target_temperature= nest.ctof(device.target_temperature);
                  target_temperature_high = nest.ctof(device.target_temperature_high);
                  target_temperature_low = nest.ctof(device.target_temperature_low);
                  target_temperature_mode = device.target_temperature_type;
                  thermo_mode = 'home';
                  // create new thermo record
                  var newThermoRecord = new ThermoRecord({
                    record_id:chance.natural({min: 1, max: 100000000}).toString(),
                    thermo_name : device.name,
                    target_temperature : target_temperature,
                    target_temperature_high : target_temperature_high,
                    target_temperature_low : target_temperature_low,
                    target_temperature_mode : target_temperature_mode,
                    user_id : email, // user_id is email
                    thermo_id : deviceId,
                    thermo_mode : thermo_mode,
                    operation : 'add thermo'
                  });

                  newThermoRecord.save(function(err){
                    if (err){
                      message = message + err;
                    } else {
                      successCount++;
                    }
                  });

                  existing_devices.push(
                    { vendor:input_vendor,
                      thermo_id:deviceId,
                      thermo_name:thermo_name
                    });
                  sendPackage.push({
                    thermo_name : thermo_name,
                    target_temperature : target_temperature,
                    target_temperature_high : target_temperature_high,
                    target_temperature_low : target_temperature_low,
                    target_temperature_mode : target_temperature_mode,
                    thermo_mode : thermo_mode
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
              { 'email' :  email},
              {$set: {thermos:existing_devices}},
              {safe: true, upsert: true},
              function(err, model) {
                if (err){
                  message = message + err;
                } else {
                  successCount++;
                }
              }
            );
            User.findOneAndUpdate(
                { 'email' :  email},
            {$push:{devicesAcc:nestAcc}},
            {safe: true, upsert: true},
            function(err, model) {
              if (err){
                message = message + err;
              } else {
                successCount++;
              }
            }
          );
          setTimeout(function(){
            if (successCount>=3){
              res.status(200);
              res.send(JSON.stringify(sendPackage));
            } else {
            res.status(400);
            message = message + 'Unable to change the temperature for all thermostat';
          }
          }, 1000);

          //subscribe();
        }
      }); //  fetchStatus callback
    } // else
  });
});

/* GET /thermo/all -- Get all the information of the thermostat */
router.get('/all',function getStatusAllThermo(req,res){
    var devices = [];
    var thermo_name;
    var target_temperature;
    var target_temperature_high;
    var target_temperature_low;
    var target_temperature_mode;
    var thermo_mode;
    var available_thermos = 0;
    nest.fetchStatus(function getData(data) {
      if (!data){
        res.status(400);
        res.send('Error fetching data');
        return;
      } else {
        for (var deviceId in data.device) {
          available_thermos++;
            if (data.device.hasOwnProperty(deviceId)) {
                var device = data.shared[deviceId];
                // var rand_thermo_id = chance.natural({min: 1, max: 10000}).toString();
                thermo_name = device.name;
                target_temperature= nest.ctof(device.target_temperature);
                target_temperature_high = nest.ctof(device.target_temperature_high);
                target_temperature_low = nest.ctof(device.target_temperature_low);
                target_temperature_mode = device.target_temperature_type;
                thermo_mode = 'home';
                // create new thermo record
                devices.push({
                  thermo_name : thermo_name,
                  target_temperature : target_temperature,
                  target_temperature_high : target_temperature_high,
                  target_temperature_low : target_temperature_low,
                  target_temperature_mode : target_temperature_mode,
                  thermo_mode : thermo_mode
                });
            }
        }
      }
    });
    setTimeout(function(){
    if (available_thermos===devices.length){
      res.status(200);
      res.send(devices);
    } else {
      res.status(400);
      res.send('Unable to change the temperature for all thermostat');
    }
    }, 1000);
});

/* GET /thermo/:thermo_id  -- Get the temperature of a specific thermostat by passing the thermostat name*/
router.get('/:thermo_name',function getTempByName(req,res){
  var thermo_name = req.params.thermo_name;
  var foundDevice;
  nest.fetchStatus(function (data) {
    for (var deviceId in data.device) {
      if (data.device.hasOwnProperty(deviceId)) {
          var device = data.shared[deviceId];
          if (device.name === thermo_name){
              foundDevice = device;
          }
      }
    }
  });
  if (foundDevice!==null){
    res.status(200);
    res.send(foundDevice);
  } else {
    res.status(400);
    res.send('Cannot fetch data');
  }
});

/* PUT /thermo with {thermo_name, updated_temp} -- Change the temperature of a specific thermostat*/
router.put('/', function changeTempByName(req,res){
    var user_id = req.body.user_id;
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
                    user_id : user_id,
                    thermo_id : deviceId,
                    thermo_mode : 'home',
                    operation : 'change temp individual'
                  });

                  newThermoRecord.save(function(err){
                    if (err){
                      res.status(400);
                      res.send(err);
                    } else {
                      res.status(200);
                      res.send(updated_temp);
                    }
                  });
            } // end if device name == thermo name
        }
      }
    } else {
      res.status(400);
      console.log('Unable to fetch data');
      res.send('Unable to fetch data');
    }
  }); // end nest fetchData
});

/* PUT /thermo/all with {thermo_name, updated_temp, thermo_id} -- Change the temperature of all the thermostat in the house
to the temperature the user specified */
router.put('/all', function changeTempAllThermo(req,res){
    var user_id = req.body.user_id;
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
                    user_id : user_id,
                    thermo_id : deviceId,
                    thermo_mode : 'home',
                    operation : 'change temp all'
                  });
                  newThermoRecord.save(function(err){
                    if (err){
                      res.status(400);
                      res.send(err);
                    } else {
                      successCount++;
                    }
                  });
        }
      }
      setTimeout(function(){
      if (successCount===numThermostat){
        res.status(200);
        res.send(updated_temp);
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
});

router.put('/test', function setAwayMode(req,res){
  nest.fetchStatus(function (data) {
    if (data){
      if(req.body.mode==='away'){
          nest.setAway();
      } else if (req.body.mode==='home'){
          nest.setHome();
      }
      // for (var deviceId in data.device) {
      //     if (data.device.hasOwnProperty(deviceId)) {
      //       if(req.body.mode==='away'){
      //           nest.setAway();
      //       } else if (req.body.mode==='home'){
      //           nest.setHome();
      //       }
      //     }
      //   }
      }
    });
});

// When setting away mode, all thermostat in the houses will be change status
router.put('/mode', function setAwayMode(req,res){
  var user_id = req.body.user_id;
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
                  console.log('Nest mode is ' + mode);
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
                      user_id : user_id,
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
            res.send(mode);
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
});

router.put('/temp_mode', function setAwayMode(req,res){
  var user_id = req.body.user_id;
  var temp_mode = req.body.temp_mode;
  var thermo_name = req.body.thermo_name;
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
              var device = data.shared[deviceId];
              if (device.name===thermo_name){
                  // here's the device and ID
                  nest.setTargetTemperatureType(temp_mode);
                  operation='set temperature mode';
                  target_temperature = nest.ctof(device.target_temperature);
                  target_temperature_high = nest.ctof(device.target_temperature_high);
                  target_temperature_low = nest.ctof(device.target_temperature_low);
                  target_temperature_type = temp_mode;
                    var newThermoRecord = new ThermoRecord({
                      record_id:chance.natural({min: 1, max: 100000000}).toString(),
                      thermo_name : thermo_name,
                      target_temperature : target_temperature,
                      target_temperature_high : target_temperature_high,
                      target_temperature_low : target_temperature_low,
                      target_temperature_mode : target_temperature_type,
                      thermo_id : deviceId,
                      user_id : user_id,
                      thermo_mode : mode,
                      operation : operation
                    });
                    newThermoRecord.save(function(err){
                      if (err){
                        message = message + err;
                      } else {
                        successCount++;
                      }
                    });
                }
          }
      }
      setTimeout(function(){
          if (successCount===numThermostat){
            res.status(200);
            res.send(mode);
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
});

module.exports = router;
