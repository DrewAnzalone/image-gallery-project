const express = require('express');
const router = express.Router();
const processTags = (req) => req.body.tags.split(",").map(tag => tag.trim().toLowerCase()).filter(e => e);

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

//! /users
router.get('/:userId/', async (req, res) => {
  const uid = req.session.user?._id;
  if (uid !== req.params.userId) { return res.redirect(`/posts/${req.params.userId}`); }

  const userImages = await Image.find({ uploader: uid });
  res.render('posts/index.ejs', { images: userImages, verified: true });
});

router.get("/:userId/new", (req, res) => { // async?
  const uid = req.session.user?._id;
  if (uid !== req.params.userId) { return res.redirect(`/posts/${req.params.userId}`); }

  res.render("posts/new.ejs");
});

router.get("/:userId/:imageId/edit", async (req, res) => {
  const uid = req.session.user?._id;
  if (uid !== req.params.userId) { return res.redirect(`/posts/${req.params.userId}/${req.params.imageId}`); }

  const image = await Image.findById(req.params.imageId);
  res.render("posts/edit.ejs", { image });
});

router.get("/:userId/:imageId", async (req, res) => {
  const uid = req.session.user?._id;
  if (uid !== req.params.userId) { return res.redirect(`/posts/${req.params.userId}/${req.params.imageId}`); }

  const dbImage = await Image.findById(req.params.imageId);
  const uploader = await User.findById(dbImage.uploader);
  const image = {...dbImage._doc};

  image.uploadDate = formatDate(image.uploadDate);
  image.uploaderId = image.uploader;
  image.uploader = uploader.username;
  res.render("posts/show.ejs", { image, verified: true });
});

//? POST routes
router.post("/:userId/", async (req, res) => {
  const uid = req.session.user?._id;
  if (uid !== req.params.userId) { return res.redirect(`/posts/${req.params.userId}`); }

  const valid = await checkImage(req.body.url);
  if (!valid) { return res.redirect(`/users/${uid}/new`); }

  req.body.tags = processTags(req);
  req.body["uploader"] = req.session.user._id;
  req.body["uploadDate"] = Date.now();
  req.body.artist = req.body.artist || "Unknown";
  // console.log(req.body)
  const image = await Image.create(req.body);
  return res.redirect(`/users/${uid}/${image._id}`);
});

//? PUT routes
router.put("/:userId/:imageId", async (req, res) => {
  const uid = req.session.user?._id;
  if (uid !== req.params.userId) { return res.redirect(`/posts/${req.params.userId}/${req.params.imageId}`); }

  req.body.tags = processTags(req);
  await Image.findByIdAndUpdate(req.params.imageId, req.body);
  return res.redirect(`/users/${uid}/${req.params.imageId}`);
});

//? DELETE routes
router.delete("/:userId/:imageId", async (req, res) => {
  const uid = req.session.user?._id;
  if (uid !== req.params.userId) { return res.redirect(`/posts/${req.params.userId}/${req.params.imageId}`); }
  
  await Image.findByIdAndDelete(req.params.imageId);
  res.redirect(`/users/${uid}`);
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
