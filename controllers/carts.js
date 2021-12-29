/* eslint-disable camelcase */
const express = require('express');
const Carts = require('../models/carts');

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
                res.status(404).json({ message: 'Id does not exist', success: "false" });
            } else {
                req.cartById = result;
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

cartRouter.get('/', async (req, res) => {
    try {
        const { limit } = req.query;
        const carts = await Carts.find().limit(+limit);
        if (carts) {
            res.status(200).json({ carts: carts, success: "true" });
        } else {
            res.status(404).json({ message: 'No results', success: "false" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})


cartRouter.get('/:id', async (req, res) => {
    try {
        res.status(200).json({ cart: req.cartById, success: "true" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

cartRouter.get('/:id/items', async (req, res) => {
    try {
        const result = await Carts.findById(req.cartById);
        if (result === null || !result) {
            res.status(404).json({ message: 'Id does not exist', success: "false" });
        } else {
            res.status(200).json({ items: result.items, success: "true" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// should send all body
cartRouter.put('/:id', async (req, res) => {
    const { body } = req
    try {
        const cartUpdated = await Carts.updateOne({ _id: req.cartById }, body);
        if (cartUpdated.nModified > 0) {
            res.status(200).json({ ...body, success: "true" });
        } else {
            res.status(404).json({ message: 'No updated', success: "false" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// update just one value of the object
cartRouter.patch('/:id', async (req, res) => {
    const { body } = req
    try {
        const cartUpdated = await Carts.updateOne({ _id: req.cartById },
            { $set: body });

        if (cartUpdated.nModified > 0) {
            res.status(200).json({ ...body, success: "true" });
        } else {
            res.status(404).json({ message: 'No updated', success: "false" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

cartRouter.delete('/:id', async (req, res) => {
    try {
        await Carts.deleteOne({ _id: req.cartById });
        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

cartRouter.post('/', async (req, res) => {
    try {
        const {
            items
        } = req.body;

        if (
            items && items.length > 0
        ) {
            const cart = new Carts({ ...req.body, createdAt: Date.now() })
            const savedCart = await cart.save();
            res.status(200).json({ cart: savedCart, success: "true" });
        } else {
            return res.status(400).json({ message: "Bad request", success: "true" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

module.exports = cartRouter;