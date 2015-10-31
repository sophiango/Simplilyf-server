var express = require('express');
var router = express.Router();

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

  router.get('/hello',function(req,res){
		  console.log("Hit hello endpoint");
			res.send("Hello world!");
	});

  /*Handle Nest Login POST*/
  // router.post('/auth/nest',passport.authenticate('nest'),function(req,res){
  //   clientID: req.body.NEST_ID;
  //   clientSecret: req.body.NEST_SECRET;
  //   if (req.isAuthenticated()){
	// 		res.send('Successfully authorize nest user ' + req.session.passport.user.accessToken);
	// 	} else {
  //     res.send('Error');
  //   }
  // });
  //
  // router.post('/auth/nest/callback',
  //       passport.authenticate('nest', { }),
  //       function(req, res) {
  //         clientID: req.body.NEST_ID;
  //         clientSecret: req.body.NEST_SECRET;
  //         res.send('Token: ' + req.user.accessToken)
  //       }
  //      );

	/* Handle Login POST */
	router.post('/signin', passport.authenticate('signin'), function(req,res){
		if (req.isAuthenticated()){
			res.send(req.user.email);
		} else {
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
