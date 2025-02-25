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

router.get("/:imageId/edit", (req, res) => {
  const image = Image.findById(req.params.imageId);
  res.render("posts/edit.ejs", { image });
})

router.get("/:imageId", (req, res) => {
  const image = Image.findById(req.params.imageId);
  res.render("posts/show.ejs", { image });
})

router.get("/new", (req, res) => { // async?
  console.log(req.status)
  res.render("posts/new.ejs", {redirect: req.status === 302});
});

//? POST routes
router.post("/", async (req, res) => {
  const valid = await checkImage(req.body.url);
  if (!valid) {
    // Window.alert("URL does not contain an image.");
    return res.redirect(`/users/${req.session.user._id}/posts/new`);
  }
  req.body.tags = req.body.tags.split(",").map(tag => tag.trim());
  req.body["uploader"] = req.session.user._id;
  req.body["uploadDate"] = Date.now();
  const image = Image.create(req.body);
  return res.redirect(`/users/${req.session.user._id}/posts/${image._id}`);
});

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
