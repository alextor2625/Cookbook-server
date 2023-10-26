var express = require("express");
var router = express.Router();
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const isAuthenticated = require("../middleware/isAuthenticated");
const jwt = require("jsonwebtoken");
const Review = require("../models/Review");

//Get all recipes //Tested Works
router.get("/all", (req, res, next) => {
  Recipe.find()
    .populate("author")
    .populate("alteredBy")
    .then((allRecipes) => {
      res.json(allRecipes);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});

// Get all user recipes //Tested Works
router.get("/myRecipes", isAuthenticated, (req, res, next) => {
  User.findById(req.user._id)
    .then((foundUser) => {
      if (foundUser.recipes.length) {
        return foundUser
          .populate("recipes")
          .then((foundUser) => {
            res.json(foundUser.recipes);
          })
          .catch((err) => {
            console.log(err);
            res.json(err);
            next(err);
          });
      } else {
        res.json(foundUser.recipes);
      }
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});

// Get a specific recipe.
router.get("/:recipeId", isAuthenticated, (req, res, next) => {
  const { recipeId } = req.params;
  Recipe.findById(recipeId)
    .then((foundRecipe) => {
      res.json(foundRecipe);
    })
    .catch((err) => {
      console.log(err);
      res.json({ message: "Recipe Not found", err });
      next(err);
    });
});
// Create a new recipe //Tested Works
router.post("/create", isAuthenticated, (req, res, next) => {
  const userId = req.user._id;
  const { name, category, description, ingredients, instructions, image } =
    req.body;
  User.findById(userId)
    .then((foundUser) => {
      if (image) {
        Recipe.create({
          name,
          image,
          category,
          description,
          ingredients,
          instructions,
          author: foundUser._id,
          alteredBy: foundUser._id,
        })
          .then((newRecipe) => {
            User.findByIdAndUpdate(
              userId,
              { $push: { recipes: newRecipe._id } },
              { new: true }
            )
              .populate("recipes")
              .then((updatedUser) => {
                if (updatedUser.cookbooks.length) {
                  return updatedUser.populate("cookbooks");
                } else {
                  return updatedUser;
                }
              })
              .then((updatedUser) => {
                if (updatedUser.reviews.length) {
                  return updatedUser.populate("reviews");
                } else {
                  return updatedUser;
                }
              })
              .then((updatedUser) => {
                const { _id, email, name, cookbooks, recipes, reviews, image } =
                  updatedUser;
                const user = {
                  _id,
                  email,
                  name,
                  cookbooks,
                  recipes,
                  reviews,
                  image,
                };
                authToken = jwt.sign(user, process.env.SECRET, {
                  algorithm: "HS256",
                  expiresIn: "6h",
                });
                console.log(
                  { user, authToken },
                  "<<<<<<===== Recipe Created Sending {user, authtoken}"
                );
                res.json({ user, authToken });
              })
              .catch((err) => {
                console.log(err);
                res.json(err);
                next(err);
              });
          })
          .catch((err) => {
            console.log(err);
            res.json(err);
            next(err);
          });
      } else {
        Recipe.create({
          name,
          category,
          description,
          ingredients,
          instructions,
          author: foundUser._id,
          alteredBy: foundUser._id,
        })
          .then((newRecipe) => {
            User.findByIdAndUpdate(
              userId,
              { $push: { recipes: newRecipe._id } },
              { new: true }
            )
              .populate("recipes")
              .then((updatedUser) => {
                if (updatedUser.cookbooks.length) {
                  return updatedUser.populate("cookbooks");
                } else {
                  return updatedUser;
                }
              })
              .then((updatedUser) => {
                if (updatedUser.reviews.length) {
                  return updatedUser.populate("reviews");
                } else {
                  return updatedUser;
                }
              })
              .then((updatedUser) => {
                const { _id, email, name, cookbooks, recipes, reviews, image } =
                  updatedUser;
                const user = {
                  _id,
                  email,
                  name,
                  cookbooks,
                  recipes,
                  reviews,
                  image,
                };
                authToken = jwt.sign(user, process.env.SECRET, {
                  algorithm: "HS256",
                  expiresIn: "6h",
                });
                console.log(
                  { user, authToken },
                  "<<<<<<===== Recipe Created Sending {user, authtoken}"
                );
                res.json({ user, authToken });
              })
              .catch((err) => {
                console.log(err);
                res.json(err);
                next(err);
              });
          })
          .catch((err) => {
            console.log(err);
            res.json(err);
            next(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});

// Copies a recipe from another user if they change ingredients or
// instructions and adds it to the current user's recipe list and
// gives changes the alteredBy property to the current user's id. //Tested Works Might add something later
router.post("/copyedit/:recipeId", isAuthenticated, (req, res, next) => {
  const userId = req.user._id;
  const { recipeId } = req.params;
  const { name, category, ingredients, instructions, description, image } =
    req.body;

  Recipe.findById(recipeId).then((foundRecipe) => {
    console.log(ingredients, foundRecipe.ingredients);
    if (
      ingredients != foundRecipe.ingredients ||
      instructions != foundRecipe.instructions
    ) {
      User.findById(userId)
        .then((foundUser) => {
          if (image) {
            return Recipe.create({
              name,
              image,
              category,
              description,
              ingredients,
              instructions,
              author: foundRecipe.author,
              alteredBy: foundUser._id,
              image: foundRecipe.image,
            }).catch((err) => {
              console.log(err);
              res.json(err);
              next(err);
            });
          } else {
            return Recipe.create({
              name,
              category,
              ingredients,
              description,
              instructions,
              author: foundRecipe.author,
              alteredBy: foundUser._id,
              image: foundRecipe.image,
            }).catch((err) => {
              console.log(err);
              res.json(err);
              next(err);
            });
          }
        })
        .then((newUpdatedRecipe) => {
          User.findByIdAndUpdate(
            userId,
            { $push: { recipes: newUpdatedRecipe._id } },
            { new: true }
          )
            .populate("recipes")
            .then((updatedUser) => {
              if (updatedUser.cookbooks.length) {
                return updatedUser.populate("cookbooks");
              } else {
                return updatedUser;
              }
            })
            .then((updatedUser) => {
              if (updatedUser.reviews.length) {
                return updatedUser.populate("reviews");
              } else {
                return updatedUser;
              }
            })
            .then((updatedUser) => {
              const { _id, email, name, cookbooks, recipes, reviews, image } =
                updatedUser;
              const user = {
                _id,
                email,
                name,
                cookbooks,
                recipes,
                reviews,
                image,
              };
              authToken = jwt.sign(user, process.env.SECRET, {
                algorithm: "HS256",
                expiresIn: "6h",
              });
              res.json({ user, authToken });
            })
            .catch((err) => {
              console.log(err);
              res.json(err);
              next(err);
            });
        })
        .catch((err) => {
          console.log(err);
          res.json(err);
          next(err);
        });
    } else {
      res.json({
        message: "User did not make a significant change to the recipe.",
      });
    }
  });
});

// Updates a recipe you are the author of. //Tested Works
router.post("/update/:recipeId", isAuthenticated, (req, res, next) => {
  const { recipeId } = req.params;
  const { name, category, description, ingredients, instructions, image } =
    req.body;
  Recipe.findById(recipeId).then((foundRecipe) => {
    if (foundRecipe.alteredBy == req.user._id) {
      if (image) {
        Recipe.findByIdAndUpdate(
          recipeId,
          {
            name,
            category,
            description,
            ingredients,
            instructions,
            image,
          },
          { new: true }
        )
          .then((foundRecipe) => {
            res.json(foundRecipe);
          })
          .catch((err) => {
            console.log(err);
            res.json(err);
            next(err);
          });
      } else {
        Recipe.findByIdAndUpdate(
          recipeId,
          {
            name,
            category,
            description,
            ingredients,
            instructions,
          },
          { new: true }
        )
          .then((foundRecipe) => {
            res.json(foundRecipe);
          })
          .catch((err) => {
            console.log(err);
            res.json(err);
            next(err);
          });
      }
    } else {
      res.json({ message: "User is not this recipe's author." });
    }
  });
});

// Pins a recipe from another user without changing anything. //Tested Works
router.put("/add", isAuthenticated, (req, res, next) => {
  console.log(req.body.recipeId);
  Recipe.findById(req.body.recipeId).then((foundRecipe) => {
    console.log(foundRecipe, "Is ERROR Here?");
    User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { recipes: req.body.recipeId } },
      { new: true }
    )
      .then((updatedUser) => {
        if (updatedUser.cookbooks.length) {
          return updatedUser.populate("cookbooks");
        } else {
          return updatedUser;
        }
      })
      .then((updatedUser) => {
        if (updatedUser.reviews.length) {
          return updatedUser.populate("reviews");
        } else {
          return updatedUser;
        }
      })
      .then((updatedUser) => {
        if (updatedUser.recipes.length) {
          return updatedUser.populate("recipes");
        } else {
          return updatedUser;
        }
      })
      .then((updatedUser) => {
        const { _id, email, name, cookbooks, recipes, reviews, image } =
          updatedUser;
        const user = { _id, email, name, cookbooks, recipes, reviews, image };
        authToken = jwt.sign(user, process.env.SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });
        res.json({ user, authToken });
      })
      .catch((err) => {
        console.log(err);
        res.json(err);
        next(err);
      });
  });
});

// Deletes recipes you are the author of from the collection of recipes
// and from every user's recipe list with the expeption of edited
// versions of the same recipe from other users.    //Tested Works
router.delete("/delete/:recipeId", isAuthenticated, (req, res, next) => {
  const { recipeId } = req.params;

  Recipe.findById(recipeId)
    .then(async (foundRecipe) => {
      if (!foundRecipe) {
        return res.json({ message: "Recipe doesn't exist" });
      }

      if (req.user._id.toString() === foundRecipe.author.toString()) {
        let recipeDeletionPromise = await Recipe.findByIdAndDelete(recipeId);
        let reviewsFindPromise = await Review.find({ recipe: recipeId }).then((foundReviews) => {
            return foundReviews.map(async (review) => {
              await User.findOneAndUpdate(
                { reviews: review._id },
                { $pull: { reviews: review._id } }
              );
            });
          }
        );
        let reviewDeletionPromise = await Review.deleteMany({ recipe: recipeId });

        // Remove the recipe from all users' recipes lists
        let usersUpdatePromise = await User.updateMany(
          { recipes: recipeId },
          { $pull: { recipes: recipeId } }
        );

        Promise.all([
          reviewsFindPromise,
          recipeDeletionPromise,
          reviewDeletionPromise,
          usersUpdatePromise,
        ])

          .then(() => {
            // Update the user's data
            return User.findById(req.user._id);
          })
          .then((updatedUser) => {
            if (updatedUser.cookbooks.length) {
              return updatedUser.populate("cookbooks");
            } else {
              return updatedUser;
            }
          })
          .then((updatedUser) => {
            if (updatedUser.recipes.length) {
              return updatedUser.populate("recipes");
            } else {
              return updatedUser;
            }
          })
          .then((updatedUser) => {
            if (updatedUser.reviews.length) {
              return updatedUser.populate("reviews");
            } else {
              return updatedUser;
            }
          })
          .then((updatedUser) => {
            const { _id, email, name, cookbooks, recipes, reviews, image } =
              updatedUser;
            const user = {
              _id,
              email,
              name,
              cookbooks,
              recipes,
              reviews,
              image,
            };
            authToken = jwt.sign(user, process.env.SECRET, {
              algorithm: "HS256",
              expiresIn: "6h",
            });
            res.json({ user, authToken });
          })
          .catch((err) => {
            console.log(err);
            res.json(err);
            next(err);
          });
      } else {
        res.json({ message: "User doesn't have ownership over this recipe." });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({ message: "Recipe doesn't exist" });
      next(err);
    });
});

// Removes recipes the current user pinned. Does not remove them from
// the main recipe collection.  //Tested Works
router.delete("/remove/:recipeId", isAuthenticated, (req, res, next) => {
  const { recipeId } = req.params;
  User.findByIdAndUpdate(
    req.user._id,
    { $pull: { recipes: recipeId } },
    { new: true }
  )
    .then((updatedUser) => {
      if (updatedUser.cookbooks.length) {
        return updatedUser.populate("cookbooks");
      } else {
        return updatedUser;
      }
    })
    .then((updatedUser) => {
      if (updatedUser.recipes.length) {
        return updatedUser.populate("recipes");
      } else {
        return updatedUser;
      }
    })
    .then((updatedUser) => {
      if (updatedUser.reviews.length) {
        return updatedUser.populate("reviews");
      } else {
        return updatedUser;
      }
    })
    .then((updatedUser) => {
      const { _id, email, name, cookbooks, recipes, reviews, image } =
        updatedUser;
      const user = { _id, email, name, cookbooks, recipes, reviews, image };
      authToken = jwt.sign(user, process.env.SECRET, {
        algorithm: "HS256",
        expiresIn: "6h",
      });
      res.json({ user, authToken });
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});

module.exports = router;
