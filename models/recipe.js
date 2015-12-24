var mongoose = require("mongoose");

var recipeSchema = mongoose.Schema({
	name: {type: String, required: true, unique: true},
	source: String,
	url: String,
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

recipeSchema.statics.findBySlug = function(slug, callback) {
	return this.model("Recipe").findOne({slug: slug}, callback);
};

recipeSchema.virtual("time.total").get(function() {
	return this.time.prep + this.time.cook || undefined;
});

recipeSchema.pre("validate", function(next) {
	try {
		var parts = this.name.replace(/[^A-Za-z0-9 ]/g, "").split(" "); // Alphanumeric characters (and space) only
		this.slug = parts.join("-").toLowerCase();
		next();
	} catch(err) {
		return next(err);
	}
});

module.exports = mongoose.model("Recipe", recipeSchema);