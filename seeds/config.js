require('dotenv').config();
const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_STRING, { dbName: 'hello-world' });
    console.log('Connected to DB');
  } catch (err) {
    console.log(`Failed to connect to DB: ${err}`);
    process.exit(1);
  }
};

module.exports = connectDb();
