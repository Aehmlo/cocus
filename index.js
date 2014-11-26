var express = require("express"),
path = require("path"),
app = express();

var sqlite3 = require("sqlite3").verbose();

var db = new sqlite3.Database(path.join(__dirname, "recipes.sqlite"), function(err) {
	db.serialize(function(){
		db.run("CREATE TABLE IF NOT EXISTS recipes(id INTEGER PRIMARY KEY, name TEXT NOT NULL, author TEXT DEFAULT NULL, notes TEXT DEFAULT NULL, shortname TEXT DEFAULT NULL, prep_time INT DEFAULT 0, cook_time INT DEFAULT 0, serves INT DEFAULT NULL);");
		db.run("CREATE TABLE IF NOT EXISTS ingredients(recipe_id INT NOT NULL, pos INT NOT NULL, text TEXT NOT NULL);");
		db.run("CREATE TABLE IF NOT EXISTS steps(recipe_id INT NOT NULL, pos INT NOT NULL, text TEXT NOT NULL);");
		db.run("CREATE TABLE IF NOT EXISTS tags(recipe_id INT NOT NULL, pos INT NOT NULL, text TEXT NOT NULL);");
		db.close();
	});
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(express.static(path.join(__dirname, "public")));
app.use(require("body-parser").urlencoded({extended: true}));

app.get("/", function(req, res) {
	res.render("index", {
		pretty: true,
		title: "Home"
	});
});

var my = require("./routes/my");

app.get("/my-recipes", my);
app.get("/my", my);
app.get("/recipes", my);
app.get("/my-recipes/page/:page", my);
app.get("/my/page/:page", my);
app.get("/recipes/page/:page", my);

var recipe = require("./routes/recipe");
app.use("/recipe", recipe);

var search = require("./routes/search");
app.use("/search", search);

var new_recipe = require("./routes/new-recipe");
app.use("/new", new_recipe);
app.use("/new-recipe", new_recipe);

var edit = require("./routes/edit");
app.use("/edit", edit);

module.exports = app;