
var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
	user_id: String,
	username: String,
	password: String,
	email: String,
	fullname: String
});
