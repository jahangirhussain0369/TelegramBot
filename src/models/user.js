const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    lastMessage: { type: String },
    joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
