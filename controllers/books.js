/* eslint-disable camelcase */
const express = require('express');
const Books = require('../models/books');

const bookRouter = express.Router();

// middleware to catch the id param
bookRouter.param('id', async (req, res, next, id) => {
  try {
    const bookId = id;
    if (!bookId || bookId === null) {
      return res.status(404).send('Id does not exist')
    } else {
      const result = await Books.findById(bookId);
      if (result === null || !result) {
        res.status(404).json({ message: 'Id does not exist', success: "false" });
      } else {
        req.bookById = result;
        next();
      }
    }
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Bad id request", success: "true" });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
})

bookRouter.get('/', async (req, res) => {
  try {
    const { limit } = req.query;
    const books = await Books.find().limit(+limit);
    if (books) {
      res.status(200).json({ books, success: "true" });
    } else {
      res.status(404).json({ message: 'No results', success: "false" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

bookRouter.get('/authors', async (req, res) => {
  try {
    const { authors } = req.query;
    const bookByAuthor = await Books.find({ authors: { $regex: `.*${authors}.*` } });
    if (bookByAuthor.length > 0) {
      res.status(200).json({ author: bookByAuthor, success: "true" });
    } else {
      res.status(404).json({ message: 'No results', success: "false" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

bookRouter.get('/title', async (req, res) => {
  try {
    const { title } = req.query;
    const bookByTitle = await Books.find({ title: { $regex: `.*${title}.*` } });
    if (bookByTitle.length > 0) {
      res.status(200).json({ author: bookByTitle, success: "true" });
    } else {
      res.status(404).json({ message: 'No results', success: "false" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

bookRouter.get('/:id', async (req, res) => {
  try {
    res.status(200).json({ book: req.bookById, success: "true" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

// should send all body
bookRouter.put('/:id', async (req, res) => {
  const { body } = req
  try {
    const bookUpdated = await Books.updateOne({ _id: req.bookById }, body);
    if (bookUpdated.nModified > 0) {
      res.status(200).json({ ...body, success: "true" });
    } else {
      res.status(404).json({ message: 'No updated', success: "false" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

// update just one value of the object
bookRouter.patch('/:id', async (req, res) => {
  const { body } = req
  try {
    const bookUpdated = await Books.updateOne({ _id: req.bookById },
      { $set: body });

    if (bookUpdated.nModified > 0) {
      res.status(200).json({ ...body, success: "true" });
    } else {
      res.status(404).json({ message: 'No updated', success: "false" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

bookRouter.delete('/:id', async (req, res) => {
  try {
    await Books.deleteOne({ _id: req.bookById });
    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

bookRouter.post('/', async (req, res) => {
  try {
    const {
      title,
      author,
      price,
      topic,
      isbn,
      format,
      pages,
      publisher,
      language,
      weight,
      dimensions,
      description,
      availability,
      imageUrl,
      createdAt,
    } = req.body;

    if (
      title &&
      author &&
      price &&
      topic &&
      isbn &&
      format &&
      pages &&
      publisher &&
      language &&
      weight &&
      dimensions &&
      description &&
      availability &&
      imageUrl &&
      createdAt
    ) {
      const book = new Books(req.body)
      const savedBook = await book.save();
      res.status(200).json({ book: savedBook, success: "true" });
    } else {
      return res.status(400).json({ message: "Bad request", success: "true" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

module.exports = bookRouter;