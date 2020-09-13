// required the neccesary packages
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const load = require('lodash');
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();
// ejs setting
app.set('view engine', 'ejs');


// bodyparser use and ejs template 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.use(session({
  secret: "secure",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// mongodb connection
mongoose.connect('mongodb://localhost:27017/AuthDB', {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);





// user schema 
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

// user model
const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


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

app.get("/secrets", function(req,res){
	if(req.isAuthenticated()){
		res.render("secrets");
	}else{
		res.redirect("/login");
	}
});




// post route for register
app.post("/register",function(req,res){
	User.register({username:req.body.username}, req.body.password, function(err, user) {
		if (err) { 
			console.log(err);
            res.redirect("/register");
		}else{
			passport.authenticate("local")(req, res, function(){
				res.redirect("/secrets");
			});
		}
    });
});


// post route for login
app.post("/login",function(req,res){
	const user = new User({
		username: req.body.username,
		password: req.body.password
	});

	req.login(user, function(err){
		if(err){
			console.log(err);
		}else{
			passport.authenticate("local")(req, res, function(){
				res.redirect("/secrets");
			});
		}
	})
});


// server running port
app.listen(8000, function() {
  console.log("Server started on port 8000");
});

