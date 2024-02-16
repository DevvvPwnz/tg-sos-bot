const mongoose = require('mongoose');
require('dotenv').config();

const connectToMongo = async() => {
    try {
        const client = await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to mongo')
        return client;
    } catch (err) {
        console.error('Error connecting to the database', err);
        throw err;
    }
};

module.exports = { connectToMongo };
