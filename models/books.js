const mongoose = require('mongoose');

// collection name Books
const Books = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: true,
  },
  authors: {
    type: [String],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  categories: {
    type: [String],
    required: true,
  },
  isbn: {
    type: Number,
    unique: true,
    required: true,
  },
  pageCount: {
    type: Number,
    required: true,
  },
  publishedDate: {
    type: Date,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  longDescription: {
    type: String,
    required: true,
  },
  availability: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date()
  }
});


module.exports = mongoose.model('Books', Books);