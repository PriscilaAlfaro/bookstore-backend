const mongoose = require('mongoose');

// collection name Wishlists
const Wishlists = new mongoose.Schema({
    userId: {
        type: mongoose.ObjectId,
        unique: true,
        required: true
    },
    items: [{
        productId: {
            type: mongoose.ObjectId,
            unique: true,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
        },
    }],
    createdAt: {
        type: Date,
        required: true,
        default: new Date()
    },
});

module.exports = mongoose.model('Wishlists', Wishlists);