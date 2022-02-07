/* eslint-disable camelcase */
const express = require('express');
const mongoose = require('mongoose');
const Wishlists = require('../models/wishlists');
const Books = require('../models/books');
const authenticateUser = require('../auth/auth');

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
                res.status(404).json({ response: 'Id does not exist', success: false });
            } else {
                req.wishlistById = result;
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

//get all wishlist
wishlistRouter.get('/', async (req, res) => {
    try {
        const { limit } = req.query;
        const wishlists = await Wishlists.find().limit(+limit);
        if (wishlists) {
            res.status(200).json({ response: wishlists, success: true });
        } else {
            res.status(404).json({ response: 'No results', success: false });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

//ge twishlist by Id
wishlistRouter.get('/:id', async (req, res) => {
    try {
        res.status(200).json({ response: req.wishlistById, success: true });
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

// should send all body
wishlistRouter.put('/:id', async (req, res) => {
    const { body } = req
    try {
        const wishlistUpdated = await Wishlists.updateOne({ _id: req.wishlistById }, body);
        if (wishlistUpdated.nModified > 0) {
            res.status(200).json({ response: body, success: true });
        } else {
            res.status(404).json({ response: 'No updated', success: false });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

// update just one value of the object
//Si se agrega un item nuevo solo, borra el resto dentro de items 
wishlistRouter.patch('/:id', async (req, res) => {
    const { body } = req
    try {
        const wishlistUpdated = await Wishlists.updateOne({ _id: req.wishlistById },
            { $set: body });

        if (wishlistUpdated.nModified > 0) {
            res.status(200).json({ response: body, success: true });
        } else {
            res.status(404).json({ response: 'No updated', success: false });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

//get wishlist by user id
wishlistRouter.get('/:userId/userId', authenticateUser);
wishlistRouter.get('/:userId/userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // search wishlist by userId
        const wish = await Wishlists.find({ userId });
        //create an array of bookId of that wishlist
        const productIdBatch = wish[0]?.items.map(item => item.productId);
        //find all books in books collection by Id
        const books = await Books.find({ _id: { $in: productIdBatch } });
        // create a new wishlist hidratated (wishlist + books) to display in wishlist page in frontend
        const itemsInfo = books.map(book => {
            return {
                productId: book._id,
                title: book.title,
                price: book.price,
                url: book.thumbnailUrl
            }
        });

        const hidratatedWishlist = {
            _id: wish[0]._id,
            userId: wish[0].userId,
            items: itemsInfo,
        }

        res.status(200).json({ response: hidratatedWishlist, success: true });

    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

//delete item inside a wishlist
wishlistRouter.delete('/:userId/items/:productId', authenticateUser);
wishlistRouter.delete('/:userId/items/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;

        if (userId && productId) {
            const userIdAsObjectId = mongoose.Types.ObjectId(userId);
            const productIdAsObjectId = mongoose.Types.ObjectId(productId);

            const wish = await Wishlists.find({ userId: userIdAsObjectId });

            const itemAlreadyExists = wish[0]?.items.find(item => item.productId.equals(productIdAsObjectId));

            if (itemAlreadyExists) {
                //delete item
                await Wishlists.updateOne({ userId: userIdAsObjectId, 'items.productId': productIdAsObjectId }, { $pull: { items: { productId: productIdAsObjectId } } });
            } else {
                return res.status(404).json({ response: "Not Found", success: false });
            }

            const wishUpdated = await Wishlists.find({ userId: userIdAsObjectId });
            //create an array of bookId of that wishlist
            const productIdBatch = wishUpdated[0]?.items.map(item => item.productId);
            //find all books in books collection by Id
            const books = await Books.find({ _id: { $in: productIdBatch } });
            // create a new wishlist hidratated (wishlist + books) to display in wishlist page in frontend
            const itemsInfo = books.map(book => {
                return {
                    productId: book._id,
                    title: book.title,
                    price: book.price,
                    url: book.thumbnailUrl
                }
            });

            const hidratatedWishlist = {
                _id: wishUpdated[0]._id,
                userId: wishUpdated[0].userId,
                items: itemsInfo,
            }

            res.status(200).json({ response: hidratatedWishlist, success: true }); //If 204 don't show content

        } else {
            return res.status(400).json({ response: "Bad request not deleted", success: false });
        }

    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

//add an item to wishlist - idempotent
wishlistRouter.post('/:userId/items/:productId', authenticateUser);
wishlistRouter.post('/:userId/items/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;

        if (productId && userId) {
            const userIdAsObjectId = mongoose.Types.ObjectId(userId);
            const productIdAsObjectId = mongoose.Types.ObjectId(productId);
            //check if wishlist exist
            const wishListAlreadyExists = await Wishlists.exists({ userId: userIdAsObjectId });
            if (wishListAlreadyExists) {
                const itemAlreadyExists = await Wishlists.exists({ userId: userIdAsObjectId, "items.productId": productIdAsObjectId })
                if (!itemAlreadyExists) {
                    await Wishlists.updateOne(
                        { userId: userIdAsObjectId },
                        { $push: { items: { productId: productIdAsObjectId } } },
                    );
                }

            } else {
                //if wishlist does not exist: create the wishlist with the item
                const wish = new Wishlists({ userId: userIdAsObjectId, items: [{ productId: productIdAsObjectId }] });
                await wish.save();
            }

            //response with the wishlist latest version hidrated
            const wish = await Wishlists.find({ userId: userIdAsObjectId });

            //create an array of bookId of that wishlist
            const productIdBatch = wish[0]?.items.map(item => item.productId);

            //find all books in books collection by Id
            const books = await Books.find({ _id: { $in: productIdBatch } });
            // create a new wishlist hidratated (wishlist + books) to display in wishlist page in frontend
            const itemsInfo = books.map(book => {
                return {
                    productId: book._id,
                    title: book.title,
                    price: book.price,
                    url: book.thumbnailUrl
                }
            });

            const hidratatedWish = {
                _id: wish[0]._id,
                userId: wish[0].userId,
                items: itemsInfo,
            }

            res.status(200).json({ response: hidratatedWish, success: true });

        } else {
            return res.status(400).json({ response: "Bad request", success: false });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }

})

module.exports = wishlistRouter;