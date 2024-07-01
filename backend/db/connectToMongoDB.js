const mongoose = require('mongoose');
require('dotenv').config();

/* ------------------ Connect with MongoDB Cloud------------------------------ */

const connectToMongoDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

module.exports = connectToMongoDB;
