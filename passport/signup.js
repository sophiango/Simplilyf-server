var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');
var chance = require('chance').Chance();

module.exports = function(passport){

	passport.use('signup', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
    function(req, username, password, done) {
			var email = req.body.email;
			console.log('Signing up ' + email);

            findOrCreateUser = function(){
                // find a user in Mongo with provided username
                User.findOne({ 'email' :  email }, function(err, user) {
                    // In case of any error, return using the done method
                    if (err){
                        console.error('Error in SignUp: '+err);
						//res.send(err);
						return done(err);
						//res.send('Error in SignUp' + err);
                    }
                    // already exists
                    if (user) {
                        //console.log('User already exists with username: '+ email);
                        //return done(null, false, req.flash('message','User Already Exists'));
												return done(null,false);
												//res.send('User already exists with email');
                    } else {
                        // if there is no user with that email
                        // create the user
												var username = req.body.username;
												var password = req.body.password;
												var fullname = req.body.fullname;
												var random_id = chance.natural({min: 1, max: 100000}).toString();

                        var newUser = new User();

                        // set the user's local credentials
												newUser.user_id = random_id;
                        newUser.username = username;
                        newUser.password = createHash(password);
                        newUser.email = email;
                        newUser.firstName = fullname;
												newUser.thermos = [];
												newUser.lights = [];

                        // save the user
                        newUser.save(function(err) {
                            if (err){
                                console.log('Error in Saving user: '+err);
                                throw err;
                            } else {
												console.log('successfully registered');
												return done(null, newUser);
							}
                            //res.send('User Registration succesful',newUser);
														//return res(null, newUser);
                        });
                    }
                });
            };
            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);
        })
    );

    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }

}
