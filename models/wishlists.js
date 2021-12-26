const mongoose = require('mongoose');

// collection name Wishlists
const Wishlists = new mongoose.Schema({
    userId: mongoose.ObjectId,
    items: [{
        productId: mongoose.ObjectId,
        quantity: Number
    }]
});

module.exports = mongoose.model('Wishlists', Wishlists);