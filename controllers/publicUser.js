const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
const Image = require('../models/image.js');

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

//! /posts
//? GET routes
router.get('/:userId/', async (req, res) => {
  const uid = req.session.user?._id;
  if (uid === req.params.userId) {
    return res.redirect(`/users/${uid}`);
  }
  const userImages = await Image.find({ uploader: req.params.userId });
  const user = await User.findById(userImages[0].uploader);
  res.render('posts/index.ejs', { images: userImages.toReversed(), username: user.username+"'s", verified: false });
});

router.get("/:userId/:imageId", async (req, res) => {
  const uid = req.session.user?._id;
  if (uid === req.params.userId) {
    return res.redirect(`/users/${uid}/${req.params.imageId}`);
  }
  const dbImage = await Image.findById(req.params.imageId);
  const uploader = await User.findById(dbImage.uploader);
  const image = {...dbImage._doc};

  image.uploadDate = formatDate(image.uploadDate);
  image.uploaderId = image.uploader;
  image.uploader = uploader.username;
  res.render("posts/show.ejs", { image, verified: false });
});

module.exports = router;
