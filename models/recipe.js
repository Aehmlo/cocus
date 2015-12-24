var mongoose = require("mongoose");

var recipeSchema = mongoose.Schema({
	name: { type: String, required: true, unique: true},
	source: String,
	url: String,
	categories: [String],
	tags: [String],
	ingredients: [String],
	directions: [String],
	time: {
		prep: Number,
		cook: Number
	},
	serves: Number,
	slug: {type: String, required: true, unique: true}
});

recipeSchema.virtual("time.total").get(function() {
	return this.time.prep + this.time.cook || undefined;
});

recipeSchema.pre("validate", function(next) {
	try {
		var parts = this.name.replace(/[^A-Za-z0-9 ]/g, "").split(" "); // ASCII characters only
		this.slug = parts.join("-").toLowerCase();
		next();
	} catch(err) {
		return next(err);
	}
});

module.exports = mongoose.model("Recipe", recipeSchema);