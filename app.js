// required the neccesary packages
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const load = require('lodash');
const mongoose = require("mongoose");
const app = express();



// ejs setting
app.set('view engine', 'ejs');


// bodyparser use and ejs template 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/",function(req,res){
	res.render("home");
})



// server running port
app.listen(8000, function() {
  console.log("Server started on port 8000");
});

