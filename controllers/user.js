const express = require('express');
const isSignedIn = require("../middleware/is-signed-in.js")
const router = express.Router();
const processTags = (req) => req.body.tags.split(",").map(tag => tag.trim().toLowerCase()).filter(e => e);

const User = require('../models/user.js');
const Image = require('../models/image.js');

//! /users
//? GET routes
router.get('/:username/', async (req, res) => {
  const uploader = req.params.username;
  const userImages = await Image.find({ uploader });

  const verified = req.session.user?.username === uploader;
  const username = verified ? "My" : uploader + "'s";
  const images = userImages.toReversed();

  res.render('posts/index.ejs', { images, username, verified });
});

router.get("/:username/new", (req, res) => {
  const uploader = req.params.username;
  const verified = req.session.user?.username === uploader;

  if (verified) res.render("posts/new.ejs");
  else res.redirect(`/users/${uploader}`);

});

router.get("/:username/:imageId/edit", async (req, res) => {
  const uploader = req.params.username;
  const verified = req.session.user?.username === uploader;

  if (verified) {
    const image = await Image.findById(req.params.imageId);
    res.render("posts/edit.ejs", { image });
  } else {
    res.redirect(`/users/${uploader}/${req.params.imageId}`);
  }
});

router.get("/:username/:imageId", async (req, res) => {
  const uploader = req.params.username;
  const verified = req.session.user?.username === uploader;

  const dbImage = await Image.findById(req.params.imageId);
  if (!dbImage) { return res.redirect(`/users/${uploader}`); 
}
  const image = { ...dbImage._doc };
  image.uploadDate = formatDate(image.uploadDate);

  res.render("posts/show.ejs", { image, verified });
});

//? POST routes
router.post("/:username/", isSignedIn, async (req, res) => {
  const uploader = req.params.username;
  const user = await User.findOne({ username: uploader });
  const verified = req.session.user?._id === user._id.toString();

  const valid = await checkImage(req.body.url);
  if (!valid) { return res.redirect(`/users/${uid}/new`); }
  if (!verified) { return res.redirect(`/users/${uploader}`); }

  req.body.tags = processTags(req);
  req.body["uploader"] = req.session.user.username;
  req.body["uploadDate"] = Date.now();
  req.body.artist = req.body.artist || "Unknown";

  const image = await Image.create(req.body);
  return res.redirect(`/users/${uploader}/${image._id}`);
});

//? PUT routes
router.put("/:username/:imageId", isSignedIn, async (req, res) => {
  const uploader = req.params.username;
  const user = await User.findOne({ username: uploader });
  const verified = req.session.user?._id === user._id.toString();

  if (!verified) { return res.redirect(`/users/${uploader}`); }

  req.body.tags = processTags(req);
  await Image.findByIdAndUpdate(req.params.imageId, req.body);
  return res.redirect(`/users/${uploader}/${req.params.imageId}`);
});

//? DELETE routes
router.delete("/:username/:imageId", async (req, res) => {
  const uploader = req.params.username;
  const user = await User.findOne({ username: uploader });
  const verified = req.session.user?._id === user._id.toString();

  if (!verified) { return res.redirect(`/users/${uploader}/${req.params.imageId}`); }

  await Image.findByIdAndDelete(req.params.imageId);
  res.redirect(`/users/${uploader}`);
});

//* helper methods
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

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = router;
