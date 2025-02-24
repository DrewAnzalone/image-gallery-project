const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
  url: { type: String, required: true },
  title: String,
  notes: String,
  tags: String,
  artist: String,
  uploader: String,
  uploadDate: Date
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
