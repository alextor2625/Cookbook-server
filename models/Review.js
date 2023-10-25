const { Schema, model } = require("mongoose");

const reviewSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" },
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe" },
    title: { type: String, default: "" },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    comment: {
      type: String,
      maxLength: 500,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Review", reviewSchema);

/*\ Reviews:
 *      Author
 *      Rating
 *      Comment
\*/
