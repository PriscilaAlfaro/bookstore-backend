const mongoose = require('mongoose');

// collection name Users
const Users = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
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
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
    createdAt: {
        type: Date,
        required: true,
        default: new Date()
    },
});

module.exports = mongoose.model('Users', Users);