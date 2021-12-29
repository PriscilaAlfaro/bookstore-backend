const mongoose = require('mongoose');

// collection name Books
const Books = new mongoose.Schema({
  title: String,
  authors: String,
  price: Number,
  topic: String,
  isbn: Number,
  format: String,
  pages: Number,
  publisher: String,
  language: String,
  weight: String,
  dimensions: String,
  description: String,
  availability: String,
  imageUrl: String,
  createdAt: Date,
});

module.exports = mongoose.model('Books', Books);