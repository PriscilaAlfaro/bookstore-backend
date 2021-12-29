const mongoose = require('mongoose');

// collection name SalesOrders
const SalesOrders = new mongoose.Schema({
    userId: mongoose.ObjectId,
    details: [{
        productId: mongoose.ObjectId,
        quantity: Number,
        unitPrice: Number,
    }],
    createdAt: Date
});

module.exports = mongoose.model('SalesOrders', SalesOrders);