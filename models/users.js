const mongoose = require('mongoose');
const crypto = require('crypto');

// collection name Users
const Users = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    accessToken: {
        type: String,
        default: () => crypto.randomBytes(128).toString('hex')
    },
    createdAt: {
        type: Date,
        required: true,
        default: new Date()
    },
});

module.exports = mongoose.model('Users', Users);