const mongoose = require('mongoose');

// collection name Users
const Users = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    isAdmin: Boolean,
    createdAt: Date
});

module.exports = mongoose.model('Users', Users);