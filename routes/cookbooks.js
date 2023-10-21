var express = require("express");
var router = express.Router();

const User = require("../models/User");
const Cookbook = require("../models/Cookbook");
const Recipe = require("../models/Recipe");
const jwt = require("jsonwebtoken");

const isAuthenticated = require("../middleware/isAuthenticated");
//tested
router.get("/all", isAuthenticated, (req, res, next) => {
  Cookbook.find()
    .then((allCookbooks) => {
      res.json(allCookbooks);
    })
    .catch((err) => {
      console.log(err);
      res.json({ err });
      next(err);
    });
});

//tested
router.get("/myCookBooks", isAuthenticated, (req, res, next) => {
  User.findById(req.user._id)
    .then((foundUser) => {
      if (foundUser.cookbooks.length) {
        return foundUser
          .populate("cookbooks")
          .then((foundUser) => {
            res.json(foundUser.cookbooks);
          })
          .catch((err) => {
            console.log(err);
            res.json(err);
            next(err);
          });
      } else {
        res.json({
          message: "User Has No CookBooks",
          cookbooks: foundUser.cookbooks,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});

// Get a specific Cookbook.
//tested
router.get("/:cookbookId", isAuthenticated, (req, res, next) => {
  const { cookbookId } = req.params;
  Cookbook.findById(cookbookId)
    .then((foundCookbook) => {
      res.json(foundCookbook);
    })
    .catch((err) => {
      console.log(err);
      res.json({ message: "Cookbook Not found", err });
      next(err);
    });
});

//tested
router.post("/create", isAuthenticated, (req, res, next) => {
  const userId = req.user._id;
  const { name } = req.body;
  User.findById(userId)
    .then((foundUser) => {
      Cookbook.create({
        name,
        author: foundUser._id,
      })
        .then((newCookbook) => {
          User.findByIdAndUpdate(
            userId,
            { $push: { cookbooks: newCookbook._id } },
            { new: true }
          )
            .populate("cookbooks")
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
          res.json(err);
          next(err);
        });
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});

//tested
router.post("/add/:cookbookId/:recipeId", isAuthenticated, (req, res, next) => {
  const { cookbookId, recipeId } = req.params;
  Recipe.findById(recipeId)
    .then((foundRecipe) => {
      if (!foundRecipe) {
        res.json({ message: "Recipe Not Found, Cannot add to Cookbook" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({ err });
      next(err);
    });
  Cookbook.findById(cookbookId).then((foundCookbook) => {
    if (!foundCookbook) {
      res.json({
        message: "Cookbook Not Found, Cannot add to recipe to cookbook",
      });
    } else {
      Cookbook.findByIdAndUpdate(
        cookbookId,
        { $addToSet: { recipes: recipeId } },
        { new: true }
      )
        .populate("recipes")
        .then((updatedCookbook) => {
          res.json(updatedCookbook);
        })
        .catch((err) => {
          console.log(err);
          res.json({ err });
          next(err);
        });
    }
  });
});
//tested
router.put("/update/:cookbookId", isAuthenticated, (req, res, next) => {
  const { cookbookId } = req.params;
  const { name } = req.body;
  Cookbook.findById(cookbookId).then((foundCookbook) => {
    if (foundCookbook.author == req.user._id) {
      Cookbook.findByIdAndUpdate(cookbookId, { name }, { new: true })
        .then((foundCookbook) => {
          res.json(foundCookbook);
        })
        .catch((err) => {
          console.log(err);
          res.json({ err });
          next(err);
        });
    } else {
      res.json({ message: "User is not this cookbook's author." });
    }
  });
});
// tested
router.put("/add/:cookbookId", isAuthenticated, (req, res, next) => {
  Cookbook.findById(req.params.cookbookId).then((foundCookbook) => {
    User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { cookbooks: foundCookbook._id } },
      { new: true }
    )
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
// tested
router.delete("/delete/:cookbookId", isAuthenticated, (req, res, next) => {
  const { cookbookId } = req.params;
  Cookbook.findById(cookbookId)
    .then((foundCookbook) => {
      if (req.user._id == foundCookbook.author) {
        Cookbook.findByIdAndDelete(cookbookId)
          .then((deletedCookbook) => {
            console.log(deletedCookbook, "Cookbook Was Deleted");
          })
          .catch((err) => {
            console.log(err);
            res.json({ err });
            next(err);
          });
        User.updateMany(
          { cookbooks: cookbookId },
          { $pull: { cookbooks: cookbookId } },
          { new: true }
        )
          .then((updatedUsers) =>
            console.log(
              updatedUsers,
              "Cookbook was deleted from all users cookbooks list"
            )
          )
          .catch((err) => {
            console.log(err);
            res.json({ err });
            next(err);
          });
        User.findById(req.user._id)
          .populate("cookbooks")
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
      } else {
        res.json({
          message: "User Doesn't Have Any Ownership Over This Cookbook.",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({ message: "Cookbook Doesnt Exist" });
      next(err);
    });
});
// tested
router.delete("/remove/:cookbookId", isAuthenticated, (req, res, next) => {
  const { cookbookId } = req.params;
  User.findByIdAndUpdate(
    req.user._id,
    { $pull: { cookbooks: cookbookId } },
    { new: true }
  )
    .populate("cookbooks")
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
});
// tested
router.delete("/remove/:cookbookId/:recipeId", isAuthenticated, (req, res, next) => {
    const { cookbookId, recipeId } = req.params;
    Cookbook.findByIdAndUpdate(
      cookbookId,
      { $pull: { recipes: recipeId } },
      { new: true }
    )
      .then((updatedCookbook) => {
        res.json(updatedCookbook);
      })
      .catch((err) => {
        console.log(err);
        res.json({ message: "Unable to delete recipe from cookbook" });
        next(err);
      });
  }
);

module.exports = router;
