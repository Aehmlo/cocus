var get_key = function(item, key, number) {
	if(item && item.hasOwnProperty(key) && item[key]) return item[key];
	else return number ? 0 : null;
},
path = require("path"),
sqlite3 = require("sqlite3"),
router = require("express").Router();

router.get("/:recipe", function(req, res) {
	var db = new sqlite3.Database(path.join(__dirname, "../recipes.sqlite"), function(err) {
		db.serialize();
		if(err) return res.status(500).send("Could not read recipes database.");
		var statement,
		recipe = req.param("recipe");
		if(recipe.match(/^\d+/)){
			statement = db.prepare("SELECT * FROM recipes WHERE id=?");
		}else{
			statement = db.prepare("SELECT * FROM recipes WHERE shortname=?");
		}
		statement.get(recipe, function(error, result){
			if(error){
				console.log(error);
				throw error;
			}
			if(result){
				statement = db.prepare("SELECT * FROM steps WHERE recipe_id=? ORDER BY pos ASC");
				statement.all(result["id"], function(error, step_results){
					if(error){
						console.log(error);
						throw error;
					}
					statement = db.prepare("SELECT * FROM ingredients WHERE recipe_id=? ORDER BY pos ASC");
					statement.all(result["id"], function(error, ingredient_results){
						if(error){
							console.log(error);
							throw error;
						}
						statement = db.prepare("SELECT * FROM tags WHERE recipe_id=? ORDER BY pos ASC");
						statement.all(result["id"], function(error, tag_results){
							if(error){
								console.log(error);
								throw error;
							}
							var total_time = get_key(result, "prep_time", true)+get_key(result, "cook_time", true);
							res.render("recipe", {
								recipe: {
									id: get_key(result, "id"),
									name: get_key(result, "name"),
									author: get_key(result, "author"),
									prep_time: get_key(result, "prep_time", true),
									cook_time: get_key(result, "cook_time", true),
									total_time: total_time,
									serves: get_key(result, "serves", true),
									steps: step_results.length ? step_results : null,
									ingredients: ingredient_results.length ? ingredient_results : null,
									notes: get_key(result, "notes"),
									tags: tag_results.length ? tag_results : null
								},
								title: get_key(result, "name"),
								pretty: true
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

module.exports = router;