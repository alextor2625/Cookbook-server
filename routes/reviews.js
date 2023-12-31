var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Review = require("../models/Review");
const Recipe = require("../models/Recipe");

const isAuthenticated = require("../middleware/isAuthenticated");
// tested
router.get("/all", (req, res, next) => {
  Review.find()
    .then((allReview) => {
      console.log(allReview);
      res.json(allReview);
    })
    .catch((err) => {
      console.log(err);
      res.json({ err });
      next(err);
    });
});

// tested
router.get("/myReviews", isAuthenticated, (req, res, next) => {
  User.findById(req.user._id)
    .then((foundUser) => {
      if (foundUser.reviews.length) {
        return foundUser
          .populate("reviews")
          .then((foundUser) => {
            res.json(foundUser.reviews);
          })
          .catch((err) => {
            console.log(err);
            res.json({ err });
            next(err);
          });
      } else {
        res.json({
          message: "User Has No Reviews",
          cookbooks: foundUser.reviews,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({ err });
      next(err);
    });
});

// tested
router.get("/:reviewId", isAuthenticated, (req, res, next) => {
  const { reviewId } = req.params;
  Review.findById(reviewId)
    .then((foundReview) => {
      res.json(foundReview);
    })
    .catch((err) => {
      console.log(err);
      res.json({ message: "Review Not found", err });
      next(err);
    });
});

//tested
router.post("/create/:recipeId", isAuthenticated, (req, res, next) => {
  const userId = req.user._id;
  const { recipeId } = req.params;
  const { comment, rating, title } = req.body;
  User.findById(userId)
    .then((foundUser) => {
      Review.create({
        title,
        rating,
        comment,
        author: foundUser._id,
        recipe: recipeId,
      })
        .then((newReview) => {
          Recipe.findByIdAndUpdate(
            recipeId,
            { $addToSet: { reviews: newReview._id } },
            { new: true }
          )
            .then((updatedRecipe) => {
              console.log(updatedRecipe, "Recipe Updated");
            })
            .catch((err) => {
              console.log(err);
              res.json({ err });
              next(err);
            });
          User.findByIdAndUpdate(
            userId,
            { $addToSet: { reviews: newReview._id } },
            { new: true }
          )
            .populate("reviews")
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
              res.json({ err });
              next(err);
            });
        })
        .catch((err) => {
          console.log(err);
          res.json({ err });
          next(err);
        });
    })
    .catch((err) => {
      console.log(err);
      res.json({ err });
      next(err);
    });
});

// tested
router.post("/update/:reviewId", isAuthenticated, (req, res, next) => {
  const { reviewId } = req.params;
  const { rating, comment, title } = req.body;
  Review.findById(reviewId)
    .then((foundReview) => {
      if (foundReview.author == req.user._id) {
        Review.findByIdAndUpdate(
          reviewId,
          { rating, comment, title },
          { new: true }
        )
          .then((foundReview) => {
            res.json(foundReview);
          })
          .catch((err) => {
            console.log(err);
            res.json({ err });
            next(err);
          });
      } else {
        res.json({ message: "User is not this review's author." });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({ err });
      next(err);
    });
});

// tested
router.delete("/delete/:recipeId/:reviewId",isAuthenticated,(req, res, next) => {
    const { reviewId, recipeId } = req.params;
    Review.findByIdAndDelete(reviewId)
      .then((deletedReview) => {
        if (!deletedReview) {
          res.json({ message: "Review Not Found." });
        } else {
          console.log(deletedReview, "Review Deleted");
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({ err });
        next(err);
      });
    Recipe.findByIdAndUpdate(
      recipeId,
      { $pull: { reviews: reviewId } },
      { new: true }
    )
      .then((updatedRecipe) => {
        console.log(updatedRecipe, "Removed Review From Recipe");
      })
      .catch((err) => {
        console.log(err);
        res.json({ err });
        next(err);
      });
    User.findByIdAndUpdate(
      req.user._id,
      { $pull: { reviews: reviewId } },
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
        res.json({ err });
        next(err);
      });
  }
);

module.exports = router;
