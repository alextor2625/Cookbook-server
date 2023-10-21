const { Schema, model } = require("mongoose");

const cookbookSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      default: "Unnamed Cookbook",
    },
    recipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
    author: { type: Schema.Types.ObjectId, ref: "User" },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dg2rwod7i/image/upload/v1697815016/Cookbook/placeholders/cookbook/n0q836i7yvy0qtnok0lz.png",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Cookbook", cookbookSchema);

/*\ Cookbook:
 *      Recipes
\*/
