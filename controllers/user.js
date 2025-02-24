const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
// const Image = require('../models/image.js');

//! /users/:userId/posts
//? GET routes
router.get('/', (req, res) => {
  res.render('posts/index.ejs');
});

router.get("/show", (req, res) => {
  res.render("posts/show.ejs");
})

router.get("/new", (req, res) => { // async?
  res.render("posts/new.ejs");
});

//? POST routes
router.post("/", async (req, res) => {
  req.body.edible = req.body.edible === "on";
  try {
    const userInDatabase = await User.findById(req.session.user._id);
    userInDatabase.pantry.push(req.body);
    req.session.user.pantry.push(req.body);
    await userInDatabase.save();
    return res.redirect("posts/index.ejs");
  } catch (e) {
    console.log(e);
    return res.redirect("/")
  }
});

module.exports = router;
