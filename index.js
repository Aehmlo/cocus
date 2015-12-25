var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var Recipe = require("./models/recipe");
var app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.get("/recipes", function(req, res, next) {
	return Recipe.find({}).sort("name").exec(function(err, recipes) {
		if(err) return next(err);
		return res.render("recipe-list", {
			recipes: recipes
		});
	});
});

app.get("/recipe/:slug", function(req, res, next) {
	var slug = req.params.slug;
	Recipe.findBySlug(slug, function(err, recipe) {
		if(err) return next(err);
		return res.render("recipe", {
			recipe: recipe
		});
	});
});

app.get("/recipe/:slug/edit", function(req, res, next) {
	var slug = req.params.slug;
	Recipe.findBySlug(slug, function(err, recipe) {
		if(err) return next(err);
		return res.render("edit-recipe", {
			recipe: recipe
		});
	});
});
app.post("/recipe/:slug/edit", function(req, res, next) {
	var slug = req.params.slug;
	Recipe.findBySlug(slug, function(err, recipe) {
		if(err) return next(err);
		return updateRecipe(recipe, req, res, next);
	});
});

app.get("/add-recipe", function(req, res, next) {
	res.render("add-recipe");
});

var updateRecipe = function(recipe, req, res, next) {
	try {
		var name = req.body.name;
		var source = req.body.source || undefined;
		var url = req.body.url || undefined;
		var categories = (req.body.categories || "").split(",");
		var tags = (req.body.tags || "").split(",");
		var ingredients = (req.body.ingredients || "").replace("\r", "").split("\n");
		var directions = req.body.directions.replace("\r", "").split("\n");
		var prepTime = req.body.prep || undefined;
		var cookTime = req.body.cook || undefined;
		var serves = req.body.serves || undefined;

		if(source) recipe.source = source;
		if(url) recipe.url = url;
		recipe.categories = categories;
		recipe.tags = tags;
		recipe.ingredients = ingredients;
		recipe.directions = directions;
		recipe.serves = serves;
		if(prepTime) {
			recipe.time = {prep: prepTime}
		} else {
			recipe.time = {prep: null};
		}
		if(cookTime) {
			recipe.time.cook = cookTime;
		} else {
			recipe.time.cook = null;
		}
		recipe.save(function(err) {
			if(err) return next(err);
			res.redirect("/recipe/" + recipe.slug);
		});
	} catch(err) {
		return next(err);
	}
};

app.post("/add-recipe", function(req, res, next) {
	var recipe = new Recipe({name: req.body.name});
	updateRecipe(recipe, req, res, next);
});

module.exports = app;