const mongoose = require('mongoose');

// collection name SalesOrders
const SalesOrders = new mongoose.Schema({
    userId: {
        type: mongoose.ObjectId,
        unique: true,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    orderAmount: {
        type: Number,
        required: true
    },
    orderTaxes: {
        type: Number,
        required: true
    },
    details: [{
        productId: {
            type: mongoose.ObjectId,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
        },
        unitPrice: {
            type: Number,
            required: true,
        },
        taxes: {
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

module.exports = mongoose.model('SalesOrders', SalesOrders);