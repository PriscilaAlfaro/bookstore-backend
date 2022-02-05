const mongoose = require('mongoose');

// collection name carts
const Carts = new mongoose.Schema({
    userId: {
        type: mongoose.ObjectId,
        unique: true,
        required: true
    },
    items: [{
        productId: {
            type: mongoose.ObjectId,
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
}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
    }
});

module.exports = mongoose.model('Carts', Carts);