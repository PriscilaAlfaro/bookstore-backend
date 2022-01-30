/* eslint-disable camelcase */
const express = require('express');
const mongoose = require('mongoose');
const Carts = require('../models/carts');
const Books = require('../models/books');

const cartRouter = express.Router();

// middleware to catch the id param
cartRouter.param('id', async (req, res, next, id) => {
    try {
        const cartId = id;
        if (!cartId || cartId === null) {
            return res.status(404).send('Id does not exist')
        } else {
            const result = await Carts.findById(cartId);
            if (result === null || !result) {
                res.status(404).json({ message: 'Id does not exist', success: false });
            } else {
                req.cartById = result;
                next();
            }
        }
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Bad id request", success: true });
        } else {
            return res.status(500).json({ message: error.message, success: false });
        }
    }
})

cartRouter.get('/', async (req, res) => {
    try {
        const { limit } = req.query;
        const carts = await Carts.find().limit(+limit);
        if (carts) {
            res.status(200).json({ response: carts, success: true });
        } else {
            res.status(404).json({ response: 'No results', success: false });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

//for display cart + book information 
cartRouter.get('/:userId/userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // search cart by userId
        const cart = await Carts.find({ userId: userId });
        //create an array of bookId of that cart
        const productIdBatch = cart[0].items.map(item => item.productId);
        //find all books in books collection by Id
        const books = await Books.find({ _id: { $in: productIdBatch } });
        // create a new cart hidratated (cart + books) to display in cart page in frontend
        const itemsInfo = books.map(book => {
            const cartItem = cart[0].items.find(item => item.productId.equals(book._id)) //to find quantity by item
            return {
                productId: book._id,
                quantity: cartItem.quantity,
                title: book.title,
                price: book.price,
                url: book.thumbnailUrl
            }
        });

        const hidratatedCart = {
            _id: cart[0]._id,
            userId: cart[0].userId,
            items: itemsInfo,
        }

        res.status(200).json({ response: hidratatedCart, success: true });

    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

cartRouter.get('/:id/items', async (req, res) => {
    try {
        res.status(200).json({ response: req.cartById.items, success: true });
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

// should send all body
cartRouter.put('/:id', async (req, res) => {
    const { body } = req
    try {
        const cartUpdated = await Carts.updateOne({ _id: req.cartById }, body);
        if (cartUpdated.nModified > 0) {
            res.status(200).json({ response: body, success: true });
        } else {
            res.status(404).json({ response: 'No updated', success: false });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

// update just one value of the object => update cart items
cartRouter.patch('/:id', async (req, res) => {
    const itemToPatch = req.body.item;
    try {
        const productObjectId = mongoose.Types.ObjectId(itemToPatch.productId);

        const bookAlreadyExists = req.cartById.items.filter(item => item.productId.equals(productObjectId));

        if (bookAlreadyExists.length > 0) {
            const filter = { _id: req.cartById._id, "items.productId": productObjectId };
            const updateStatement = { $set: { 'items.$.quantity': itemToPatch.quantity } };
            const cartUpdated = await Carts.updateOne(filter, updateStatement);

            if (cartUpdated.nModified > 0) {
                res.status(200).json({ response: itemToPatch, success: true });
            } else {
                res.status(404).json({ response: 'No updated', success: false });
            }


        } else {
            const cartUpdated = await Carts.updateOne({ _id: req.cartById._id },
                { $push: { items: itemToPatch } });
            if (cartUpdated.nModified > 0) {
                res.status(200).json({ response: itemToPatch, success: true });
            } else {
                res.status(404).json({ response: 'No updated', success: false });
            }
        }

    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})


cartRouter.delete('/:id', async (req, res) => {
    try {
        await Carts.deleteOne({ _id: req.cartById });
        return res.status(204).json({ success: true });
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

cartRouter.post('/', async (req, res) => {
    try {
        const {
            items, userId
        } = req.body;

        if (items && userId) {
            const cart = new Carts({ ...req.body })
            const savedCart = await cart.save();
            res.status(200).json({ response: savedCart, success: true });
        } else {
            return res.status(400).json({ response: "Bad request", success: false });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

module.exports = cartRouter;