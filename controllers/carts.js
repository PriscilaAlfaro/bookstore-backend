/* eslint-disable camelcase */
const express = require('express');
const mongoose = require('mongoose');
const Carts = require('../models/carts');
const Books = require('../models/books');
const authenticateUser = require('../auth/auth');
const cartRouter = express.Router();

// middleware to catch the id param
// cartRouter.param('id', async (req, res, next, id) => {
//     try {
//         const cartId = id;
//         if (!cartId || cartId === null) {
//             return res.status(404).send('Id does not exist')
//         } else {
//             const result = await Carts.findById(cartId);
//             if (result === null || !result) {
//                 res.status(404).json({ message: 'Id does not exist', success: false });
//             } else {
//                 req.cartById = result;
//                 next();
//             }
//         }
//     } catch (error) {
//         if (error.kind === "ObjectId") {
//             return res.status(400).json({ message: "Bad id request", success: false });
//         } else {
//             return res.status(500).json({ message: error.message, success: false });
//         }
//     }
// })

//get all carts 
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

//get cart by userId hidratated + book information 
cartRouter.get('/:userId/userId', authenticateUser);
cartRouter.get('/:userId/userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // search cart by userId
        const cart = await Carts.find({ userId });
        //create an array of bookId of that cart
        const productIdBatch = cart[0]?.items.map(item => item.productId);
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

cartRouter.get('/:id', async (req, res) => {
    try {
        res.status(200).json({ response: req.cartById, success: true });
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

// should send all body
// cartRouter.put('/:id', async (req, res) => {
//     const { body } = req
//     try {
//         const cartUpdated = await Carts.updateOne({ _id: req.cartById }, body);
//         if (cartUpdated.nModified > 0) {
//             res.status(200).json({ response: body, success: true });
//         } else {
//             res.status(404).json({ response: 'No updated', success: false });
//         }
//     } catch (error) {
//         return res.status(500).json({ response: error.message, success: false });
//     }
// })

// update just one value of the object => update cart items
cartRouter.patch('/:id', authenticateUser);
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

            const cartUpdated = await Carts.updateOne(
                { _id: req.cartById._id },
                { $push: { items: itemToPatch } });
            // console.log(cartUpdated)
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

//delete a cart
cartRouter.delete('/:id', async (req, res) => {
    try {
        await Carts.deleteOne({ _id: req.cartById });
        return res.status(204).json({ success: true });
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

/// delete an item inside a cart
cartRouter.delete('/:userId/items/:productId', authenticateUser);
cartRouter.delete('/:userId/items/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const { removeLine } = req.query;

        if (userId && productId) {
            const userIdAsObjectId = mongoose.Types.ObjectId(userId);
            const productIdAsObjectId = mongoose.Types.ObjectId(productId);

            const cart = await Carts.find({ userId: userIdAsObjectId });
            console.log(cart);
            const itemAlreadyExists = cart[0]?.items.find(item => item.productId.equals(productIdAsObjectId));


            if (itemAlreadyExists.quantity <= 1 || removeLine) {
                //delete item
                await Carts.updateOne({ userId: userIdAsObjectId, 'items.productId': productIdAsObjectId }, { $pull: { items: { productId: productIdAsObjectId } } });

            } else {
                //update item
                await Carts.updateOne({ userId: userIdAsObjectId, 'items.productId': productIdAsObjectId }, { $inc: { 'items.$.quantity': -1 } });
            }

            const cartUpdated = await Carts.find({ userId: userIdAsObjectId });
            //create an array of bookId of that cart
            const productIdBatch = cartUpdated[0]?.items.map(item => item.productId);
            //find all books in books collection by Id
            const books = await Books.find({ _id: { $in: productIdBatch } });
            // create a new cart hidratated (cart + books) to display in cart page in frontend
            const itemsInfo = books.map(book => {
                const cartItem = cartUpdated[0].items.find(item => item.productId.equals(book._id)) //to find quantity by item
                return {
                    productId: book._id,
                    quantity: cartItem.quantity,
                    title: book.title,
                    price: book.price,
                    url: book.thumbnailUrl
                }
            });

            const hidratatedCart = {
                _id: cartUpdated[0]._id,
                userId: cartUpdated[0].userId,
                items: itemsInfo,
            }

            console.log("hidratatedCart", hidratatedCart)
            res.status(200).json({ response: hidratatedCart, success: true }); //If 204 don't show content

        } else {
            return res.status(400).json({ response: "Bad request not deleted", success: false });
        }

    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

//create a new cart 
cartRouter.post('/', authenticateUser);
cartRouter.post('/', async (req, res) => {
    try {
        const { items, userId } = req.body;
        // console.log("in post a cart", req.body)
        if (items && userId) {
            const cart = new Carts(req.body);
            const savedCart = await cart.save();
            console.log("savedCart", savedCart);
            if (savedCart) {
                res.status(200).json({ response: savedCart, success: true });
            } else {
                res.status(404).json({ message: 'No created', success: false });
            }


        } else {
            return res.status(400).json({ response: "Bad request", success: false });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

//----->  Checked successfully
cartRouter.post('/:userId/items/:productId', authenticateUser);
cartRouter.post('/:userId/items/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;

        if (productId && userId) {
            const userIdAsObjectId = mongoose.Types.ObjectId(userId);
            const productIdAsObjectId = mongoose.Types.ObjectId(productId);
            //check if cart exist
            const cartAlreadyExists = await Carts.exists({ userId: userIdAsObjectId });
            if (cartAlreadyExists) {
                // check if item in cart exist
                const itemAlreadyExists = await Carts.exists({ userId: userIdAsObjectId, "items.productId": productIdAsObjectId })
                //if item exists
                if (itemAlreadyExists) {
                    await Carts.updateOne({ userId: userIdAsObjectId, 'items.productId': productIdAsObjectId }, { $inc: { 'items.$.quantity': 1 } });

                } else {// if item does not exist
                    await Carts.updateOne(
                        { userId: userIdAsObjectId },
                        { $push: { items: { productId: productIdAsObjectId, quantity: 1 } } });
                }

            } else {
                //if cart does not exist: create the cart with the item
                const cart = new Carts({ userId: userIdAsObjectId, items: [{ productId: productIdAsObjectId, quantity: 1 }] });
                await cart.save();
            }

            //response with the cart latest version hidrated
            const cart = await Carts.find({ userId: userIdAsObjectId });
            //create an array of bookId of that cart
            const productIdBatch = cart[0]?.items.map(item => item.productId);
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

        } else {
            return res.status(400).json({ response: "Bad request", success: false });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message, success: false });
    }
})

module.exports = cartRouter;