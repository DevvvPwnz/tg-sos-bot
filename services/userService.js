const User = require('../models/User');

// Function to create a new user
async function createUser({ username, contacts, id, lang }) {
    try {
        const newUser = new User({
            username,
            contacts,
            id,
            lang,
        });
        return await newUser.save();
    } catch (error) {
        throw error;
    }
}

// Function to find a user by ID
async function findUserById(userId) {
    try {
        return await User.findOne({ id: userId.toString() });
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createUser,
    findUserById,
};
