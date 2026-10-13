const mongoose = require('mongoose');

const connectDatabase = async () => {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not set. Add it to your .env file.');
  }

  await mongoose.connect(MONGO_URI);
};

module.exports = connectDatabase;