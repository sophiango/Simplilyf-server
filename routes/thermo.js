var express = require('express');
var router = express.Router();
var nest = require('unofficial-nest-api');
// var username = 'sophia2901@gmail.com';
// var password = 'test@CMPE295';

/*
POST /thermo/addNew
DELETE /thermo/{thermo_id}
GET /thermo/{thermo_id}
POST /thermo/{thermo_id}?updated_temp=
GET /thermo/all
POST /thermo/all?updated_temp=
*/

router.post('/new', function addNewThermo(req,res){
  var fullname = req.body.fullname;
  var username = req.body.username;
  var password = req.body.password;
  nest.login(username, password, function (err, data) {
    if (err) {
        res.status(400);
        res.send('Invalid login credentials');
    } else {
      nest.fetchStatus(function (data) {
        if (!data){
          res.status(400);
          res.send('No data response');
        } else {
          var response = '';
          for (var deviceId in data.device) {
              if (data.device.hasOwnProperty(deviceId)) {
                  var device = data.shared[deviceId];
                  var name = device.name;
                  response = response + name;
                  //console.log('name: ' + name);
              }
          }
          //subscribe();
          console.log('response: ' +  response);
          res.status(200);
          res.JSON(response);
        }
      }); //  fetchStatus callback
    } // else
  });
  //console.log('Response: ' + response);
});

// function subscribe() {
//     nest.subscribe(subscribeDone, ['shared', 'energy_latest']);
// };
//
// function subscribeDone(deviceId, data, type) {
//     // data if set, is also stored here: nest.lastStatus.shared[thermostatID]
//     if (deviceId) {
//         console.log('Device: ' + deviceId + " type: " + type);
//         console.log(JSON.stringify(data));
//     } else {
//         console.log('No data');
//
//     }
//     setTimeout(subscribe, 2000);
// };

router.post('/temp/:temp', function changeTemp(req,res){
  var updated_temp = req.params.temp;
  nest.fetchStatus(function (data) {
    for (var deviceId in data.device) {
            if (data.device.hasOwnProperty(deviceId)) {
                var device = data.shared[deviceId];
                // here's the device and ID
                nest.setTemperature(deviceId, updated_temp);
            }
    }
    res.send("Successfully change temperature to " + updated_temp);
    });
});

router.post('/away', function setAwayMode(req,res){
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
                nest.setAway();
        }
    }
    res.send("Successfully set away mode ");
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
    res.send("Get all Successfully ");
  });

module.exports = router;
