// required the neccesary packages
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const load = require('lodash');
const mongoose = require("mongoose");
const md5 = require('md5');
const app = express();


// mongodb connection
mongoose.connect('mongodb://localhost:27017/AuthDB', {useNewUrlParser: true, useUnifiedTopology: true });


// ejs setting
app.set('view engine', 'ejs');


// bodyparser use and ejs template 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// user schema 
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});


// user model
const User = mongoose.model('User', userSchema);



//home route
app.get("/",function(req,res){
	res.render("home");
})


//register route
app.get("/register",function(req,res){
	res.render("register");
})


// login route
app.get("/login",function(req,res){
	res.render("login");
})


// post route for register
app.post("/register",function(req,res){
	const newUser = new User({
		email: req.body.username,
		password: md5(req.body.password)
	});
	newUser.save(function(err){
		if(err){
			console.log(err);
		}else{
			res.render("login");
		}
	});
})


// post route for login
app.post("/login",function(req,res){
	const email = req.body.username;
	const passkey = md5(req.body.password);
	User.findOne({email:email},function(err,founduser){
		if(err){
			console.log(err);
		}else{
			if(founduser){
				if(founduser.password === passkey){
					res.render("secrets");
				}else{
					res.send("<h1>Password is incorrect</h1>");
				}
			}else{
				res.send("<h1>no such user exits");
			}
		}
	}); 
})


// server running port
app.listen(8000, function() {
  console.log("Server started on port 8000");
});

