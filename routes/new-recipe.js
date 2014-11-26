var router = require("express").Router();

router.get("/", function(req, res) {
	res.render("new", {
		pretty: true,
		title: "New Recipe"
	});
});

router.post("/", function(req, res) {
	var db = new sqlite3.Database(path.join(__dirname, "../recipes.sqlite"), function(err) {
		if(err) return db.close(function(err){res.status(500).send("Could not access recipes database. Crap.");});
		console.dir(req.body);
		if(!req.body.recipe) return db.close(function(err){res.status(400).send("You suck - give me a recipe.");});
		var recipe = req.body.recipe;
		var shortname = null;
		var insert_statement = db.prepare("INSERT INTO recipes VALUES (NULL, ?, ?, NULL, ?, ?, ?, ?)");
		insert_statement.run(recipe.name, null, shortname, recipe.prep, recipe.cook, recipe.serves, function(error) {
			if(error) {
				console.log(error);
				return res.status(500).send("Error inserting recipe.");
			}
			var id = this.lastID;
			var ingredients = recipe.ingredients ? recipe.ingredients.split("\r\n") : null;
			var steps = recipe.directions ? recipe.directions.split("\r\n") : null;
			var tags = recipe.tags ? recipe.tags.split(",") : null;
			//TODO: Iterate and remove blanks (e.g. \r\n or "")
			db.serialize(function() {
				var statement;
				if(ingredients) {
					statement = db.prepare("INSERT INTO ingredients VALUES (?, ?, ?)");
					for(var i = 0, ingredient; i<ingredients.length, ingredient = ingredients[i]; i++) {
						statement.run(id, i, ingredient);
					}
				}
				if(steps) {
					statement = db.prepare("INSERT INTO steps VALUES (?, ?, ?)");
					for(var i = 0, step; i<steps.length, step = steps[i]; i++) {
						statement.run(id, i, step);
					}
				}
				if(tags) {
					statement = db.prepare("INSERT INTO tags VALUES (?, ?, ?)");
					for(var i = 0, tag; i<tags.length, tag = tags[i]; i++) {
						statement.run(id, i, tag.trim());
					}
				}
				db.close(function(error) {
					if(error) res.status(500);
					res.redirect("/recipe/"+id);
				});
			});
		});
	});
});

module.exports = router;