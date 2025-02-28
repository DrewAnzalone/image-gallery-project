const express = require('express');
const router = express.Router();

// const User = require('../models/user.js');
const Image = require('../models/image.js');

//! /users
router.get('/:userId/', async (req, res) => {
  const uid = req.session.user?.id;
  if (uid !== req.params.userId) { return res.redirect(`/posts/${req.params.userId}`); }

  const userImages = await Image.find({ uploader: uid });
  res.render('posts/index.ejs', { images: userImages, verified: true });
});

router.get("/:userId/new", (req, res) => { // async?
  const uid = req.session.user?.id;
  if (uid !== req.params.userId) { return res.redirect(`/posts/${req.params.userId}`); }

  res.render("posts/new.ejs");
});

router.get("/:userId/:imageId/edit", async (req, res) => {
  const uid = req.session.user?.id;
  if (uid !== req.params.userId) { return res.redirect(`/posts/${req.params.userId}/${req.params.imageId}`); }

  const image = await Image.findById(req.params.imageId);
  res.render("posts/edit.ejs", { image });
});

router.get("/:userId/:imageId", async (req, res) => {
  const uid = req.session.user?.id;
  if (uid !== req.params.userId) { return res.redirect(`/posts/${req.params.userId}/${req.params.imageId}`); }

  const image = await Image.findById(req.params.imageId);
  res.render("posts/show.ejs", { image, verified: true });
});

//? POST routes
router.post("/:userId/", async (req, res) => {
  const uid = req.session.user?.id;
  if (uid !== req.params.userId) { return res.redirect(`/posts/${req.params.userId}`); }

  const valid = await checkImage(req.body.url);
  if (!valid) { return res.redirect(`/users/${uid}/new`); }

  req.body.tags = req.body.tags.split(",").map(tag => tag.trim());
  req.body["uploader"] = req.session.user.id;
  req.body["uploadDate"] = Date.now();
  req.body.artist = req.body.artist || "Unknown";
  // console.log(req.body)
  const image = await Image.create(req.body);
  return res.redirect(`/users/${uid}/${image._id}`);
});

//? PUT routes
//edit
// router.put();


//* helper method
// source https://stackoverflow.com/questions/55880196/is-there-a-way-to-easily-check-if-the-image-url-is-valid-or-not
async function checkImage(url) {
  try {
    const res = await fetch(url);
    const buff = await res.blob();

    return buff.type.startsWith('image/');
  } catch (error) {
    return false;
  }
}

module.exports = router;
