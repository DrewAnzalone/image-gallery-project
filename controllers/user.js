const express = require('express');
const router = express.Router();

// const User = require('../models/user.js');
const Image = require('../models/image.js');

//! /users/:userId/posts
router.get("/new", (req, res) => { // async?
  res.render("posts/new.ejs");
});

router.get("/:imageId/edit", (req, res) => {
  const image = Image.findById(req.params.imageId);
  res.render("posts/edit.ejs", { image });
})

//? POST routes
router.post("/", async (req, res) => {
  const valid = await checkImage(req.body.url);
  if (!valid) {
    return res.redirect(`/users/${req.session.user._id}/posts/new`);
  }
  req.body.tags = req.body.tags.split(",").map(tag => tag.trim());
  req.body["uploader"] = req.session.user._id;
  req.body["uploadDate"] = Date.now();
  req.body.artist = req.body.artist || "Unknown";
  console.log(req.body)
  const image = Image.create(req.body);
  return res.redirect(`/users/${req.session.user._id}/posts/${image._id}`);
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
