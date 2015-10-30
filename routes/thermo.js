var express = require('express');
var router = express.Router();
var app = express();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nest = require('unofficial-nest-api');
// var username = 'sophia2901@gmail.com';
// var password = 'test@CMPE295';
var session = require('express-session');

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/*
POST /thermo/addNew
DELETE /thermo/{thermo_id}
GET /thermo/{thermo_id}
POST /thermo/{thermo_id}?updated_temp=
GET /thermo/all
POST /thermo/all?updated_temp=
*/

router.post('/addNew', function addNewThermo(req,res){
  var username = req.body.username;
  var password = req.body.password;
  nest.login(username, password, function (err, data) {
    if (err) {
        console.log(err.message);
        process.exit(1);
        return;
    }
    res.send(data);
    // nest.fetchStatus(function (data) {
    //     for (var deviceId in data.device) {
    //         if (data.device.hasOwnProperty(deviceId)) {
    //             var device = data.shared[deviceId];
    //             // here's the device and ID
    //             res.send(data);
    //         }
    //     }
    // });
  });
});

router.post('/:thermo_id', function changeTemp(req,res){
  //var mySesn = req.session.MyID;
  var thermo_id = req.params.thermo_id;
  var updated_temp = req.body.updated_temp;
  nest.login(username, password, function login (err, data) {
    if (err) {
        console.log(err.message);
        process.exit(1);
        return;
    }
    nest.fetchStatus(function (data) {
      nest.setTemperature(thermo_id,updated_temp);
    });
  });
  res.send("Successfully change temperature to " + updated_temp);
});

router.get('/all',function getStatusAllThermo(req,res){
  nest.login(username, password, function login (err, data) {
    if (err) {
        console.log(err.message);
        process.exit(1);
        return;
    }
  nest.fetchStatus(function getData(data) {
      for (var deviceId in data.device) {
          if (data.device.hasOwnProperty(deviceId)) {
              var device = data.shared[deviceId];
              console.log('deviceid: ' + deviceId);
          }
      }
    });
  });
  res.send("Get all Successfully ");
});

module.exports = router;
