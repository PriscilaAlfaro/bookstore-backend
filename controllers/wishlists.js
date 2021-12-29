/* eslint-disable camelcase */
const express = require('express');
const Wishlists = require('../models/wishlists');

const wishlistRouter = express.Router();

// middleware to catch the id param
wishlistRouter.param('id', async (req, res, next, id) => {
    try {
        const whislistId = id;
        if (!whislistId || whislistId === null) {
            return res.status(404).send('Id does not exist')
        } else {
            const result = await Wishlists.findById(whislistId);
            if (result === null || !result) {
                res.status(404).json({ message: 'Id does not exist', success: "false" });
            } else {
                req.wishlistById = result;
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

wishlistRouter.get('/', async (req, res) => {
    try {
        const { limit } = req.query;
        const wishlists = await Wishlists.find().limit(+limit);
        if (wishlists) {
            res.status(200).json({ wishlists: wishlists, success: "true" });
        } else {
            res.status(404).json({ message: 'No results', success: "false" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})


wishlistRouter.get('/:id', async (req, res) => {
    try {
        res.status(200).json({ wishlist: req.wishlistById, success: "true" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// should send all body
wishlistRouter.put('/:id', async (req, res) => {
    const { body } = req
    try {
        const wishlistUpdated = await Wishlists.updateOne({ _id: req.wishlistById }, body);
        if (wishlistUpdated.nModified > 0) {
            res.status(200).json({ ...body, success: "true" });
        } else {
            res.status(404).json({ message: 'No updated', success: "false" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// update just one value of the object
//Si se agrega un item nuevo solo, borra el resto dentro de items // sirve para update cada vez que suma o resta un element
wishlistRouter.patch('/:id', async (req, res) => {
    const { body } = req
    try {
        const wishlistUpdated = await Wishlists.updateOne({ _id: req.wishlistById },
            { $set: body });

        if (wishlistUpdated.nModified > 0) {
            res.status(200).json({ ...body, success: "true" });
        } else {
            res.status(404).json({ message: 'No updated', success: "false" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

wishlistRouter.delete('/:id', async (req, res) => {
    try {
        await Wishlists.deleteOne({ _id: req.wishlistById });
        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

wishlistRouter.post('/', async (req, res) => {
    try {
        const {
            items
        } = req.body;

        if (
            items && items.length > 0
        ) {
            const wishlist = new Wishlists({ ...req.body, createdAt: Date.now() })
            const savedWishlist = await wishlist.save();
            res.status(200).json({ wishlist: savedWishlist, success: "true" });
        } else {
            return res.status(400).json({ message: "Bad request", success: "true" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

module.exports = wishlistRouter;