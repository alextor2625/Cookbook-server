const { Schema, model } = require("mongoose");

const recipeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      default: "Unnamed Recipe"
    },
    category: { type: String, default: "Unspecified" },
    ingredients: String,
    instructions: String,
    author: { type: Schema.Types.ObjectId, ref: "User" },
    alteredBy: { type: Schema.Types.ObjectId, ref: "User", default: undefined },
    reviews: [
      { type: Schema.Types.ObjectId, ref: "Review", default: undefined },
    ],
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dg2rwod7i/image/upload/v1697685097/Cookbook/placeholders/recipe/dyip7jnmoturdgnv4a4b.png",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Recipe", recipeSchema);

/*\  Recipe:
 *      Name
 *      Category
 *      Description
 *      Ingredients
 *      Instructions
 *      Image
 *      Author
\*/
