const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
  url: { type: String, required: true },
  title: String,
  notes: String,
  tags: [String],
  artist: String,
  uploader: mongoose.ObjectId,
  uploadDate: { type: Date, set: d => new Date(d) } // epoch time
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
