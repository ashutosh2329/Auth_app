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
  googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// user model
const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
  	console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


//home route
app.get("/",function(req,res){
	res.render("home");
});

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);


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

app.get("/secrets", function(req,res){
	if(req.isAuthenticated()){
		res.render("secrets");
	}else{
		res.redirect("/login");
	}
});

app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
})


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

