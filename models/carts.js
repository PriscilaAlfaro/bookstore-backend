const mongoose = require('mongoose');

// collection name carts
const Carts = new mongoose.Schema({
    userId: mongoose.ObjectId,
    items: [{
        productId: mongoose.ObjectId,
        quantity: Number
    }]
});

module.exports = mongoose.model('Carts', Carts);