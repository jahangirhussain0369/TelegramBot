const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    telegramId: { type: String, required: true },
    message: { type: String },
    eventType: { type: String },  // 'command', 'message', 'callback_query', etc.
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
