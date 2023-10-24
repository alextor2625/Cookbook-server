var express = require("express");
var router = express.Router();

const User = require("../models/User");

const isAuthenticated = require("../middleware/isAuthenticated");
const jwt = require("jsonwebtoken");

/* GET users listing. */ //Tested Works
router.get("/profiles", (req, res, next) => {
  User.find()
    .then((allUsers) => {
      const userPromises = allUsers.map((usr) => {
        let { _id, name, email, image, recipes, reviews, cookbooks } = usr;

        const promises = [];

        if (recipes.length) {
          promises.push(
            User.findById(usr._id)
              .populate("recipes")
              .then((populatedUser) => {
                recipes = JSON.parse(JSON.stringify(populatedUser.recipes));
              })
          );
        }

        if (reviews.length) {
          promises.push(
            User.findById(usr._id)
              .populate("reviews")
              .then((populatedUser) => {
                reviews = JSON.parse(JSON.stringify(populatedUser.reviews));
              })
          );
        }

        if (usr.cookbooks.length) {
          promises.push(
            User.findById(usr._id)
              .populate("cookbooks")
              .then((populatedUser) => {
                cookbooks = JSON.parse(JSON.stringify(populatedUser.cookbooks));
              })
          );
        }

        return Promise.all(promises).then(() => {
          const user = { _id, name, email, image, recipes, reviews, cookbooks };
          return user;
        });
      });

      Promise.all(userPromises).then((users) => {
        res.json(users);
      });
    })
    .catch((err) => {
      // Handle errors
      console.error(err);
      res.status(500).json({ error: "An error occurred" });
    });
});

//Tested Works
router.get("/profile/:userId", isAuthenticated, (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((foundUser) => {
      if (foundUser.cookbooks.length) {
        return foundUser.populate("cookbooks");
      } else {
        return foundUser;
      }
    })
    .then((foundUser) => {
      if (foundUser.recipes.length) {
        return foundUser.populate("recipes");
      } else {
        return foundUser;
      }
    })
    .then((foundUser) => {
      if (foundUser.reviews.length) {
        return foundUser.populate("reviews");
      } else {
        return foundUser;
      }
    })
    .then((user) => {
      const { _id, email, name, cookbooks, recipes, reviews, image } = user;
      const userInfo = { _id, email, name, cookbooks, recipes, image };
      res.json(userInfo);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});
//Tested Works
router.get("/profile", isAuthenticated, (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((foundUser) => {
      if (foundUser.cookbooks.length) {
        return foundUser.populate("cookbooks");
      } else {
        return foundUser;
      }
    })
    .then((foundUser) => {
      if (foundUser.recipes.length) {
        return foundUser.populate("recipes");
      } else {
        return foundUser;
      }
    })
    .then((foundUser) => {
      if (foundUser.reviews.length) {
        return foundUser.populate("reviews");
      } else {
        return foundUser;
      }
    })
    .then((user) => {
      const { _id, email, name, cookbooks, recipes, reviews, image } = user;
      const userInfo = { _id, email, name, cookbooks, recipes, image };
      res.json(userInfo);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});
//Tested Works
router.post("/update", isAuthenticated, (req, res, next) => {
  const { name, email, image } = req.body;

  User.findById(req.user._id)
    .then((foundUser) => {
      if (email !== foundUser.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email)) {
          res.status(400).json({ message: "Provide a valid email address." });
          return;
        } else {
          User.findByIdAndUpdate(
            req.user._id,
            {
              email,
            },
            { new: true }
          )
            .then((updatedUser) => console.log("Changed User Email"))
            .catch((err) => {
              console.log(err);
              res.json(err);
              next(err);
            });
        }
      }
      if (image) {
        User.findByIdAndUpdate(
          req.user._id,
          {
            image,
          },
          { new: true }
        )
          .then((updatedUser) => console.log("Changed User Image"))
          .catch((err) => {
            console.log(err);
            res.json(err);
            next(err);
          });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          name,
        },
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
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});

//Tested Works
router.delete("/delete", isAuthenticated, (req, res, next) => {
  User.findByIdAndDelete(req.user._id)
    .then((deletedUser) => {
      console.log("User Deleted ====>", deletedUser);
      res.json({ message: "User Deleted", deletedUser });
    })
    .catch((err) => {
      console.log(err);
      res.json({ message: "An error occured while deleting user." });
      next(err);
    });
});

module.exports = router;
