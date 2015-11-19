var express = require('express');
var router = express.Router();
var nest = require('unofficial-nest-api');

// var isAuthenticated = function (req, res, next) {
// 	// if user is authenticated in the session, call the next() to call the next request handler
// 	// Passport adds this method to request object. A middleware is allowed to add properties to
// 	// request and response objects
// 	if (req.isAuthenticated()){
// 		//res.send('Success');
// 		return next();
// 	}
	// if the user is not authenticated then redirect him to the login page
	//res.redirect('/');
// }

module.exports = function(passport){
	/* Handle Login POST */
	router.post('/signin', passport.authenticate('signin'), function(req,res){
		if (req.isAuthenticated()){
      var thermoAcc;
      var lightAcc;
      var user = req.user;
      if (req.user.devicesAcc.length > 0){
        for (var i = 0; i < user.devicesAcc.length; i++){
            if (user.devicesAcc[i].vendor==='nest'){
              thermoAcc = user.devicesAcc[i];
            } else if (user.devicesAcc[i].vendor==='philips'){
              lightAcc = user.devicesAcc[i];
            }
        }
      }

      if(thermoAcc!==undefined){
        console.log('Logging to Nest to create Nest session ' + thermoAcc);
        var username = thermoAcc.username;
        var password = thermoAcc.password;
        nest.login(username, password, function (err, data) {
          if (err) {
              res.status(400);
              res.send(err);
          }
        });
      }
      if(lightAcc!==undefined){
        console.log('Logging to Philips to create Philips session ' + lightAcc);
      }
      res.status(200);
			res.send(req.user);
		} else {
      res.status(400);
      res.send('Error');
    }
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup'), function(req,res) {
		// if this function get called, signed up was successful
    res.status(200);
    res.send('successful');
	});

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.status(200);
    res.send('successful');
	});

	// router.get('/confirm',function(req,res){
	// 	res.send('Session: ' + req.session.passport.user);
	// })

	return router;
}
