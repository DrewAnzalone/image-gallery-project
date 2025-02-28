const express = require('express');
const router = express.Router();

// const User = require('../models/user.js');
const Image = require('../models/image.js');

//! /posts
//? GET routes
router.get('/:userId/', (req, res) => {
  const uid = req.session.user?.id;
  if (uid === req.params.userId) {
    return res.redirect(`/users/${uid}`);
  }
  const userImages = Image.find({ uploader: req.params.userId });
  res.render('posts/index.ejs', { images: userImages, verified: false });
});

router.get("/:userId/:imageId", async (req, res) => {
  const uid = req.session.user?.id;
  if (uid === req.params.userId) {
    return res.redirect(`/users/${uid}/${req.params.imageId}`);
  }
  const image = await Image.findById(req.params.imageId);
  res.render("posts/show.ejs", { image, verified: false });
});

module.exports = router;
