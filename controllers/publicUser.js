const express = require('express');
const router = express.Router();

// const User = require('../models/user.js');
const Image = require('../models/image.js');

//! /users/:userId/posts
//? GET routes
router.get('/', (req, res) => {
  const userImages = Image.find({ uploader: req.params.userId })
  res.render('posts/index.ejs', { images: userImages });
});

router.get("/:imageId", (req, res) => {
  const image = Image.findById(req.params.imageId);
  res.render("posts/show.ejs", { image });
});

module.exports = router;
