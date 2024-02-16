const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    contacts: {
        type: [Object],
        default: [],
    },
    id: {
        type: String,
        required: true,
        unique: true,
    },
    lang: String,
    ref: {
        type: Object,
        default: null,
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
