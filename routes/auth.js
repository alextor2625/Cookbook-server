var express = require("express");
var router = express.Router();

//Model Imports
const User = require("../models/User");

//Authentification Imports
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//Authentification Middleware
const isAuthenticated = require("../middleware/isAuthenticated");

//Bcrypt Saltrounds
const saltRounds = 10;

//Tested Works
router.post("/signup", (req, res, next) => {
  console.log(req.body, "<<<<This Is Req.body");
  const { name, email, password, image } = req.body;
  if (email == "" || password == "" || name == "") {
    res.status(400).json({ message: "Provide email, password and name" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  /*  //   Use regex to validate the password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
    return;
  }
*/

  //Try to find if the email is already in use by another user
  User.findOne({ email })
    .then((foundUser) => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      // If the email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);
      if (image) {
        // Create a new user in the database
        // We return a pending promise, which allows us to chain another `then`
        User.create({ email, password: hashedPassword, name, image })
          .then((createdUser) => {
            // Deconstruct the newly created user object to omit the password
            // We should never expose passwords publicly
            const { email, name, _id, image, cookbooks, recipes } = createdUser;

            // Create a new object that doesn't expose the password
            const payload = { _id, email, name, cookbooks, recipes, image };

            // Create and sign the token
            const authToken = jwt.sign(payload, process.env.SECRET, {
              algorithm: "HS256",
              expiresIn: "6h",
            });

            // Send the token as the response
            res.status(200).json({ authToken });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
          });
      } else {
        // Create a new user in the database
        // We return a pending promise, which allows us to chain another `then`
        User.create({ email, password: hashedPassword, name })
          .then((createdUser) => {
            // Deconstruct the newly created user object to omit the password
            // We should never expose passwords publicly
            const { email, name, _id, image, cookbooks, recipes } = createdUser;

            // Create a new object that doesn't expose the password
            const payload = { _id, email, name, cookbooks, recipes, image };

            // Create and sign the token
            const authToken = jwt.sign(payload, process.env.SECRET, {
              algorithm: "HS256",
              expiresIn: "6h",
            });

            // Send the token as the response
            res.status(200).json({ authToken });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
});
//Tested Works
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;
  if (email == "" || password == "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        console.log("User not found.");
        res.status(401).json({ message: "User not found." });
        return;
      } else {
        const passwordCorrect = bcrypt.compareSync(
          password,
          foundUser.password
        );
        if (passwordCorrect) {
          let { email, name, _id, image, cookbooks, recipes, reviews } =
            foundUser;
          const promises = [];
          if (recipes.length) {
            promises.push(
              User.findById(_id)
                .populate("recipes")
                .then((populatedUser) => {
                  recipes = JSON.parse(JSON.stringify(populatedUser.recipes));
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({ message: "Internal Server Error" });
                })
            );
          }
          if (cookbooks.length) {
            promises.push(
              User.findById(_id)
                .populate("cookbooks")
                .then((populatedUser) => {
                  cookbooks = JSON.parse(
                    JSON.stringify(populatedUser.cookbooks)
                  );
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({ message: "Internal Server Error" });
                })
            );
          }
          if (reviews.length) {
            promises.push(
              User.findById(_id)
                .populate("reviews")
                .then((populatedUser) => {
                  reviews = JSON.parse(JSON.stringify(populatedUser.reviews));
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({ message: "Internal Server Error" });
                })
            );
          }
          Promise.all(promises)
            .then(() => {
              const payload = {
                email,
                name,
                _id,
                image,
                cookbooks,
                recipes,
                reviews,
              };
              const authToken = jwt.sign(payload, process.env.SECRET, {
                algorithm: "HS256",
                expiresIn: "6h",
              });
              res.status(200).json({ authToken });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({ message: "Internal Server Error" });
            });
        } else {
          res.status(401).json({ message: "Unable to authenticate the user" });
        }
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
});
//Tested Works
router.get("/verify", isAuthenticated, (req, res, next) => {
  // <== CREATE NEW ROUTE

  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`
  console.log("req.user", req.user);

  // Send back the object with user data
  // previously set as the token payload
  res.status(200).json(req.user);
});

module.exports = router;
