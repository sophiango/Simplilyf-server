var express = require('express');
var router = express.Router();
var app = express();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoOp = require('../models/voicemodel.js');
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

router.get('/search', function(req,res){
 console.log("Hello From Voice ");

 var response={};
	mongoOp.find({},function(err,data){
		if(err){
			response={"error":true,"message":"error present"};
		}else{
			response={"error":false,"message":data};
		}
		res.json(response);
		res.status(200);
	});
});

router.post('/test/', function(req,res){
 console.log("Hello From Voice "+req.body.name);

});
router.post('/search', function(req,res){
 console.log("Command recieved is "+ req.body.command);
 var str_check=req.body.command;
 str_check=str_check.toUpperCase();
 var flag=0;
 var final_list="";
// console.log(str_check);
 var response={};
	mongoOp.find({serial_no:'one'},function(err,data){
		if(err){
			response={"error":true,"message":"error present"};
		}else{
			response={"error":false,"message":data};
		}
		//console.log("full data"+data[0]);
		var decrease_temp=data[0].decrease_temp;
		//console.log(decrease_temp);
		for(i=0;i<decrease_temp.length;i++){
			temp=decrease_temp[i].toUpperCase();
			if(str_check==temp){
				console.log("found in decrease_temp");
				flag=1;
				final_list="decrease_temp";
			}
		}
		var increase_temp=data[0].increase_temp;
		console.log(increase_temp);
		for(i=0;i<increase_temp.length;i++){
			temp=increase_temp[i].toUpperCase();
			if(str_check==temp){
				console.log("found in increase_temp dataset");
				flag=1;
				final_list="increase_temp";
			}
		}


		var on_lights=data[0].on_lights;
		//console.log(on_lights);
		for(i=0;i<on_lights.length;i++){
			temp=on_lights[i].toUpperCase();
			if(str_check==temp){
				console.log("found in on_lights dataset");
				flag=1;
				final_list="on_lights";
			}
		}
		var off_lights=data[0].off_lights;
		//console.log(off_lights);
		for(i=0;i<off_lights.length;i++){
			temp=off_lights[i].toUpperCase();
			if(str_check==temp){
				console.log("found in off_lights dataset");
				flag=1;
				final_list="off_lights";
			}
		}
	 var turn_on=data[0].turn_on;
		console.log("data in turn_on is"+ turn_on);
		//search in turn_on data set..this will require another intent to open to user
		for(i=0;i<turn_on.length;i++){
			temp=turn_on[i].toUpperCase();
			if(str_check==temp){
				console.log("found in turn_on dataset");
				flag=1;
				final_list="turn_on";
			}
		}
	var turn_off=data[0].turn_off;
	console.log("data in turn_off is"+ turn_off);
	for(i=0;i<turn_off.length;i++){
		temp= turn_off[i].toUpperCase();
		if(str_check==temp){
			console.log("found in turn_off");
			flag=1;
			final_list="turn_off";
		}
	}
  var set_away=data[0].set_away;
  for(i=0;i<set_away.length;i++){
    temp= set_away[i].toUpperCase();
    if(str_check==temp){
      console.log("found in set_away");
      flag=1;
      final_list="set_away";
    }
  }
  var set_home=data[0].set_home;
  for(i=0;i<set_home.length;i++){
    temp= set_home[i].toUpperCase();
    if(str_check==temp){
      console.log("found in set_home");
      flag=1;
      final_list="set_home";
    }
  }
  var set_all=data[0].set_all;
  for(i=0;i<set_all.length;i++){
    temp= set_all[i].toUpperCase();
    if(str_check==temp){
      console.log("found in set_all");
      flag=1;
      final_list="set_all";
    }
  }
  var set_color=data[0].set_color;
  for(i=0;i<set_color.length;i++){
    temp= set_color[i].toUpperCase();
    if(str_check==temp){
      console.log("found in set_color");
      flag=1;
      final_list="set_color";
    }
  }
	if(flag==0)
		{
			final_list="empty";
		}
		res.send(final_list);
	});
});

module.exports = router;
