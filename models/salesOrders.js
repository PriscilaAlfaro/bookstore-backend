const mongoose = require('mongoose');

// collection name SalesOrders
const SalesOrders = new mongoose.Schema({
    userId: mongoose.ObjectId,
    details: [{
        productId: mongoose.ObjectId,
        quatity: Number,
        unitPrice: Number,
    }],
    timestamp: Date,
});

module.exports = mongoose.model('SalesOrders', SalesOrders);