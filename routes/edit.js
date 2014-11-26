var router = require("express").Router(),
path = require("path"),
sqlite3 = require("sqlite3");

router.get("/:recipe", function(req, res) {
	return res.send("Bugs are preventing this from being implemented - please be patient while we wait for the module's authors to get back to us.").end();
	var db = new sqlite3.Database(path.join(__dirname, "../recipes.sqlite"), function(err) {
		if(err) {
			console.log(err);
			return db.close(function(err) {
				res.status(500).send("Error modifying recipe.");
			});
		}
		var recipe = req.param("recipe");
		var statement = db.prepare("SELECT * FROM recipes WHERE id=?");
		statement.get(recipe, function(error, result) {
			if(error) {
				console.log(error);
				return db.close(function(err) {
					res.status(500).send("Error fetching recipe.");
				});
			}
			if(result){
				var id = result["id"];
				statement = db.prepare("SELECT * FROM steps WHERE recipe_id=? ORDER BY pos ASC");
				statement.all(result["id"], function(error, step_results) {
					if(error) {
						console.log(error);
						throw error;
					}
					var name = result["name"];
					statement = db.prepare("SELECT * FROM ingredients WHERE recipe_id=? ORDER BY pos ASC");
					statement.all(result["id"], function(error, ingredient_results) {
						if(error) {
							console.log(error);
							throw error;
						}
						statement = db.prepare("SELECT * FROM tags WHERE recipe_id=? ORDER BY pos ASC");
						statement.all(result["id"], function(error, tag_results) {
							if(error) {
								console.log(error);
								throw error;
							}
							var total_time = get_key(result, "prep_time", true)+get_key(result, "cook_time", true);
							var tags_separated_by_commas = "";
							for(var i = 0, result; i<tag_results.count, result = tag_results[i]; i++) {
								tags_separated_by_commas += result.text + ", ";
							}
							tags_separated_by_commas = tags_separated_by_commas.substring(0, tags_separated_by_commas.length - 2);
							var directions_separated_by_newlines = "";
							for(var i = 0, result; i<step_results.count, result = step_results[i]; i++) {
								directions_separated_by_newlines += result.text + "\r\n";
							}
							directions_separated_by_newlines = directions_separated_by_newlines.substring(0, directions_separated_by_newlines.length - 2);
							var ingredients_separated_by_newlines = "";
							for(var i = 0, result; i<ingredient_results.count, result = ingredient_results[i]; i++) {
								ingredients_separated_by_newlines += result.text + "\r\n";
							}
							ingredients_separated_by_newlines = ingredients_separated_by_newlines.substring(0, ingredients_separated_by_newlines.length - 2);
							var author = get_key(result, "author");
							var prep_time = get_key(result, "prep_time", true);
							var cook_time = get_key(result, "cook_time", true);
							var serves = get_key(result, "serves", true);
							var notes = get_key(result, "notes");
							db.close(function(err) {
								res.render("edit", {
									step: req.param("step"),
									recipe: {
										id: id,
										name: name,
										author: author,
										prep_time: prep_time,
										cook_time: cook_time,
										total_time: total_time,
										serves: serves,
										steps: step_results.length ? step_results : null,
										directions_separated_by_newlines: directions_separated_by_newlines,
										ingredients: ingredient_results.length ? ingredient_results : null,
										ingredients_separated_by_newlines: ingredients_separated_by_newlines,
										notes: notes,
										tags: tag_results.length ? tag_results : null,
										tags_separated_by_commas: tags_separated_by_commas
									},
									title: name + " | Edit Recipe",
									pretty: true
								});
							});
						});
					});
				});
			} else {
				res.status(404);
				res.send("No such recipe.");
			}
		});
	});
});

router.post("/:recipe", function(req, res) {
	var id = req.param("recipe");
	var db = new sqlite3.Database(path.join(__dirname, "../recipes.sqlite"), function(err) {
		if(err) {
			console.log(error);
			return db.close(function(err) {
				res.status(500).send("Could not open database.");
			});
		}
		db.configure("busyTimeout", 60000);
		if(!req.body.recipe) return res.status(400).send("You suck - give me a recipe.");
		var recipe = req.body.recipe;
		var shortname = null;
		db.run("UPDATE recipes SET name=?, shortname=?, prep_time=?, cook_time=?, serves=? WHERE id=?", recipe.name, shortname, recipe.prep, recipe.cook, recipe.serves, id, function(error) {
			if(error) {
				console.log("Error when updating recipe table:", error);
				return db.close(function(err) {
					res.status(500).send("Error modifying recipe.");
				});
			}
			var ingredients = recipe.ingredients ? recipe.ingredients.split("\r\n") : null;
			var steps = recipe.directions ? recipe.directions.split("\r\n") : null;
			var tags = recipe.tags ? recipe.tags.split(",") : null;
			//TODO: Iterate and remove blanks (e.g. \r\n or "")
			db.serialize(function() {
				var statement;
				console.log("Deleting ingredients.");
				db.run("DELETE FROM ingredients WHERE recipe_id=?", req.param("recipe"));
				console.log("Deleting steps.");
				db.run("DELETE FROM steps WHERE recipe_id=?", req.param("recipe"));
				console.log("Deleting tags.");
				db.run("DELETE FROM tags WHERE recipe_id=?", req.param("recipe"));

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