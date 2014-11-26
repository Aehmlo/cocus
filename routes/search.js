var router = require("express").Router(),
sqlite3 = require("sqlite3"),
path = require("path");

router.get("/", function(req, res) {
	var db = new sqlite3.Database(path.join(__dirname, "../recipes.sqlite"), function(err) {
		var q = unescape(req.query.q),
		query = q.toLowerCase();
		var statement = db.prepare("SELECT shortname, id, name FROM recipes WHERE LOWER(`name`) LIKE ?");
		statement.all("%"+query+"%", function(error, name_result) {
			if(error) {
				console.log(error);
				return db.close(function(err) {
					res.status(500).send("Whoops.");
				});
			}
			statement = db.prepare("SELECT recipe_id FROM ingredients WHERE LOWER(`text`) LIKE ?");
			var ingredients_result = [];
			statement.each("%"+query+"%", function(error, ingredient) {
				if(error) {
				console.log(error);
				return db.close(function(err) {
					res.status(500).send("Error when searching ingredients.");
				});
			}
				statement = db.prepare("SELECT shortname, id, name FROM recipes WHERE id=?");
				statement.get(ingredient.recipe_id, function(error, ingredient_result)  {
					if(error) {
					console.log(error);
					return db.close(function(err) {
						res.status(500).send("Error when fetching name, &c.");
					});
				}
					ingredients_result.push(ingredient_result);
				});
			},
			function(error) {
				if(error) {
					console.log(error);
					return db.close(function(err) {
						res.status(500).send("Error fetching recipe ID, evidently.");
					});
				}
				statement = db.prepare("SELECT recipe_id FROM tags WHERE LOWER(`text`) LIKE ?");
				var tags_result = [];
				statement.each("%"+query+"%", function(error, tag) {
					if(error) {
					console.log(error);
					return db.close(function(err) {
						res.status(500).send("Error fetching tags or something.");
					});
				}
					statement = db.prepare("SELECT shortname, id, name FROM recipes WHERE id=?");
					statement.get(tag.recipe_id, function(error, tag_result) {
						if(error) {
							console.log(error);
							return db.close(function(err) {
								res.status(500).send("Error fetching something. I don't even know what anymore.");
							});
						}
						tags_result.push(tag_result);
					});
				},
				function(error) {
					if(error) {
						console.log(error);
						return db.close(function(err) {
							res.status(500).send("Something went wrong.");
						});
					}
					db.close(function(err) {
						res.render("search", {
							pretty: true,
							title: query+" | Search Results",
							search_text: q,
							name_results: name_result.length ? name_result : null,
							ingredient_results: ingredients_result.length ? ingredients_result : null,
							tags_results: tags_result.length ? tags_result : null
						});
					});
				});
			});
		});
	});
});

module.exports = router;