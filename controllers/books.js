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
        res.status(404).json({ response: 'Id does not exist', success: false });
      } else {
        req.bookById = result;
        next();
      }
    }
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ response: "Bad id request", success: false });
    } else {
      return res.status(500).json({ response: error.message, success: false });
    }
  }
})

bookRouter.get('/', async (req, res) => {
  try {
    const { limit } = req.query || 20;
    const books = await Books.find().limit(+limit);
    if (books) {
      res.status(200).json({ response: books, success: true });
    } else {
      res.status(404).json({ response: 'No results', success: false });
    }
  } catch (error) {
    return res.status(500).json({ response: error.message, success: false });
  }
})

bookRouter.get('/authors', async (req, res) => {
  try {
    const { authors } = req.query;
    const bookByAuthor = await Books.find({ authors: { $regex: `.*${authors}.*` } });
    if (bookByAuthor.length > 0) {
      res.status(200).json({ response: bookByAuthor, success: true });
    } else {
      res.status(404).json({ response: 'No results', success: false });
    }
  } catch (error) {
    return res.status(500).json({ response: error.message, success: false });
  }
})

bookRouter.get('/title', async (req, res) => {
  try {
    const { title } = req.query;
    const bookByTitle = await Books.find({ title: { $regex: `.*${title}.*` } });
    if (bookByTitle.length > 0) {
      res.status(200).json({ response: bookByTitle, success: true });
    } else {
      res.status(404).json({ response: 'No results', success: false });
    }
  } catch (error) {
    return res.status(500).json({ response: error.message, success: false });
  }
})

//For search bar
bookRouter.get('/topic', async (req, res) => {
  try {
    const { topic } = req.query;
    const isThereABook = await Books.find(
      {
        $or: [
          { title: { $regex: `.*${topic}.*`, $options: "$i" } },
          { authors: { $regex: `.*${topic}.*`, $options: "$i" } },
          { categories: { $regex: `.*${topic}.*`, $options: "$i" } },
        ]
      }
    ).sort({ title: "asc" });

    if (isThereABook.length > 0) {
      res.status(200).json({ response: isThereABook, success: true });
    } else {
      res.status(404).json({ response: 'No results', success: false });
    }
  } catch (error) {
    return res.status(500).json({ response: error.message, success: false });
  }
})


bookRouter.get('/:id', async (req, res) => {
  try {
    res.status(200).json({ response: req.bookById, success: true });
  } catch (error) {
    return res.status(500).json({ response: error.message, success: false });
  }
})


bookRouter.get('/:id', async (req, res) => {
  try {
    res.status(200).json({ response: req.bookById, success: true });
  } catch (error) {
    return res.status(500).json({ response: error.message, success: false });
  }
})

// should send all body
bookRouter.put('/:id', async (req, res) => {
  const { body } = req
  try {
    const bookUpdated = await Books.updateOne({ _id: req.bookById }, body);
    if (bookUpdated.nModified > 0) {
      res.status(200).json({ response: body, success: true });
    } else {
      res.status(404).json({ response: 'No updated', success: false });
    }
  } catch (error) {
    return res.status(500).json({ response: error.message, success: false });
  }
})

// update just one value of the object
bookRouter.patch('/:id', async (req, res) => {
  const { body } = req
  try {
    const bookUpdated = await Books.updateOne({ _id: req.bookById },
      { $set: body });

    if (bookUpdated.nModified > 0) {
      res.status(200).json({ response: body, success: true });
    } else {
      res.status(404).json({ response: 'No updated', success: false });
    }
  } catch (error) {
    return res.status(500).json({ response: error.message, success: false });
  }
})

bookRouter.delete('/:id', async (req, res) => {
  try {
    await Books.deleteOne({ _id: req.bookById });
    return res.status(204).json({ success: true });
  } catch (error) {
    return res.status(500).json({ response: error.message, success: false });
  }
})

bookRouter.post('/', async (req, res) => {
  try {
    const {
      title,
      authors,
      price,
      isbn,
      pageCount,
      language,
      shortDescription,
      longDescription,
      availability,
      thumbnailUrl,
      publishedDate,
      categories
    } = req.body;
    if (
      title &&
      authors &&
      price &&
      categories &&
      isbn &&
      format &&
      pageCount &&
      publishedDate &&
      language &&
      shortDescription &&
      longDescription &&
      availability &&
      thumbnailUrl
    ) {
      const book = new Books({ ...req.body });
      const savedBook = await book.save();
      res.status(200).json({ response: savedBook, success: true });
    } else {
      return res.status(400).json({ response: "Bad request", success: false });
    }
  } catch (error) {
    return res.status(500).json({ response: error.message, success: false });
  }
})

module.exports = bookRouter;