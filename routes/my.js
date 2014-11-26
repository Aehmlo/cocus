var sqlite3 = require("sqlite3"),
path = require("path");

module.exports = function(req, res){
	var db = new sqlite3.Database(path.join(__dirname, "../recipes.sqlite"), function(err) {
		if(err) return res.status(500).send("Could not read recipes database.");
		var page = Math.abs(parseInt(req.param("page")));
		if(!isFinite(page)) page = 1;
		var lower = (page-1) * 20;
		if(lower) lower++;
		var upper = page * 20;
		var statement = db.prepare("SELECT id, name, shortname FROM recipes ORDER BY name COLLATE NOCASE ASC LIMIT ?,?");
		statement.all(lower, upper, function(error, result){
			if(error){
				console.log(error);
				throw error;
			}
			db.get("SELECT COUNT(*) AS count FROM recipes", function(error, count){
				if(error){
					console.log(error);
					throw error;
				}
				if(page>1 && !count.count){
					res.status(404);
					res.send("404 not found.");
				} else if(page>1 && (20*page)+1 > count.count) {
					return res.status(404).send("404 Not Found").end();
				} else {
					res.render("my", {
						pretty: true,
						title: "My Recipes",
						recipes: result,
						count: count.count,
						page: page,
						show_next: !(20*(page + 1) + 1 > count.count)
					});
				}
			});
		});
	});
};