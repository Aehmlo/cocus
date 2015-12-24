var express = require("express");
var path = require("path");
var Recipe = require("./models/recipe");
var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.get("/recipes", function(req, res, next) {
	return Recipe.find({}, function(err, recipes) {
		if(err) return next(err);
		return res.render("recipe-list", {
			recipes: recipes
		});
	});
});

module.exports = app;