// required the neccesary packages
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const load = require('lodash');
const mongoose = require("mongoose");
const app = express();
const bcrypt = require('bcrypt');
const saltRounds = 10;

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
});


//register route
app.get("/register",function(req,res){
	res.render("register");
});


// login route
app.get("/login",function(req,res){
	res.render("login");
});


// post route for register
app.post("/register",function(req,res){
	bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
		const newUser = new User({
		email: req.body.username,
		password: hash
	});
	newUser.save(function(err){
		if(err){
			console.log(err);
		}else{
			res.render("login");
		}
	});
    
    });

});


// post route for login
app.post("/login",function(req,res){

	const email = req.body.username;
	const passkey = req.body.password;
	User.findOne({email:email},function(err,founduser){
		if(err){
			console.log(err);
		}else{
			if(founduser){
				bcrypt.compare(passkey, founduser.password, function(err, result) {
					if(result === true){
						res.render("secrets");
					}
				});
			}else{
				res.send("<h1>no such user exits");
			}
		}
	}); 
});


// server running port
app.listen(8000, function() {
  console.log("Server started on port 8000");
});

