const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    cookbooks: [
      { type: Schema.Types.ObjectId, ref: "Cookbook", default: undefined },
    ],
    recipes: [
      { type: Schema.Types.ObjectId, ref: "Recipe", default: undefined },
    ],
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review", default: undefined }],
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dg2rwod7i/image/upload/v1697684925/Cookbook/placeholders/user/hlorfrxji0oxbygeulb2.png",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);

/*\ Users:
 *	    Name
 *	    Email
 *	    Password
 *	    Cookbook
 *	    Reviews **NOT NEEDED**
 *      Image
\*/
