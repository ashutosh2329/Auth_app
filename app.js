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
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();
// ejs setting
app.set('view engine', 'ejs');



// bodyparser use and ejs template 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// declaring session
app.use(session({
  secret: "secure",
  resave: false,
  saveUninitialized: false
}));

// initialising session
app.use(passport.initialize());
app.use(passport.session());

// mongodb connection
mongoose.connect('mongodb://localhost:27017/AuthDB', {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);





// user schema 
const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

// including plugins
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// user model
const User = mongoose.model('User', userSchema);
// creating strategy
passport.use(User.createStrategy());

// serializer and meta data for passport
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
// deserializer and meta data for passport
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// get route
//home route
app.get("/",function(req,res){
	res.render("home");
});

// google auth route
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

// main page loading route through google
app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
});


//register route
app.get("/register",function(req,res){
	res.render("register");
});


// login route
app.get("/login",function(req,res){
	res.render("login");
});

// secrets route
app.get("/secrets", function(req,res){
	User.find({"secret": {$ne: null}}, function(err, foundUsers){
		if(err){
			console.log(err);
		}else{
			if(foundUsers){
				res.render("secrets", {userWithSecrets: foundUsers});
			}
		}
	})
});

// logout route
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
})


// submit route
app.get("/submit", function(req, res){
	if(req.isAuthenticated()){
		res.render("submit");
	}else{
		res.redirect("/login");
	}
});



// post route
// submit post route
app.post("/submit", function(req, res){
	const submitSecret = req.body.secret;

	User.findById(req.user.id, function(err, foundUser){
		if(err){
			console.log(err);
		}else{
			if(foundUser){
				foundUser.secret = submitSecret;
				foundUser.save(function(){
					res.redirect("/secrets");
				})
			}
		}
	});
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

