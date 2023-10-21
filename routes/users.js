var express = require("express");
var router = express.Router();

const User = require("../models/User");

const isAuthenticated = require("../middleware/isAuthenticated");
const jwt = require("jsonwebtoken");

/* GET users listing. */ //Tested Works
router.get('/profiles', (req, res, next) => {
  User.find()
  .then(allUsers => {
    res.json(allUsers)
  })
  .catch((err) => {
    console.log(err);
    res.json(err);
    next(err);
  });

})

//Tested Works
router.get("/profile/:userId", isAuthenticated, (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((foundUser) => {
      if (!foundUser.cookbooks.lengh) {
        if (foundUser.recipes.lengh) {
          return foundUser.populate("recipes");
        } else {
          return foundUser;
        }
      } else if (!foundUser.recipes.lengh) {
        if (foundUser.cookbooks.lengh) {
          return foundUser.populate("cookbooks");
        } else {
          return foundUser;
        }
      } else {
        return foundUser.populate("recipes").populate("cookbooks");
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
router.get('/profile', isAuthenticated, (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((foundUser) => {
      if (!foundUser.cookbooks.lengh) {
        if (foundUser.recipes.lengh) {
          return foundUser.populate("recipes");
        } else {
          return foundUser;
        }
      } else if (!foundUser.recipes.lengh) {
        if (foundUser.cookbooks.lengh) {
          return foundUser.populate("cookbooks");
        } else {
          return foundUser;
        }
      } else {
        return foundUser.populate("recipes").populate("cookbooks");
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
})
//Tested Works
router.put("/update", isAuthenticated, (req, res, next) => {
  const { name, email, image } = req.body;

  User.findById(req.user._id)
    .then((foundUser) => {
      if (email !== foundUser.email) {
        User.findByIdAndUpdate(
          req.user._id,
          {
            email,
          },
          { new: true }
        )
        .then(updatedUser => console.log('Changed User Email'))
        .catch((err) => {
          console.log(err);
          res.json(err);
          next(err);
        });
      }
      if (image !== "") {
        User.findByIdAndUpdate(
          req.user._id,
          {
            image,
          },
          { new: true }
        )
        .then(updatedUser => console.log('Changed User Image'))
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
          if (!updatedUser.cookbooks.lengh) {
            if (updatedUser.recipes.lengh) {
              return updatedUser.populate("recipes");
            } else {
              return updatedUser;
            }
          } else if (!updatedUser.recipes.lengh) {
            if (updatedUser.cookbooks.lengh) {
              return updatedUser.populate("cookbooks");
            } else {
              return updatedUser;
            }
          } else {
            return updatedUser.populate("recipes").populate("cookbooks");
          }
        })
        .then((updatedUser) => {
          const { _id, email, name, cookbooks, recipes, reviews, image } = updatedUser;
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
router.delete('/delete', isAuthenticated, (req, res, next) =>{
  User.findByIdAndDelete(req.user._id)
  .then(deletedUser => {
    console.log('User Deleted ====>', deletedUser);
    res.json({message: "User Deleted", deletedUser})
  })
  .catch((err) => {
    console.log(err);
    res.json({message: "An error occured while deleting user."});
    next(err);
  });
})



module.exports = router;