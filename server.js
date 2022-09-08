/* eslint-disable prettier/prettier */
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const projectRouter = require('./routes/projectRoutes');

const app = express();
const port = process.env.PORT || 8800;

app.use('/api/v1/projects', projectRouter);

app.listen(port, async () => {
  try {
    await mongoose.connect(`mongodb://${process.env.MONGO_USER_NAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_DB_STRING}/?authMechanism=DEFAULT` || 'mongodb://localhost:27017',{dbName: 'hello-world'});
  } catch(error) {
    console.log(`====>Failed to connect to DB<==== Error: ${error}`);
    process.exit(1);
  }
  console.log(`====>Connected to MongoDB`);
  console.log(`====>HelloWorld app listening on port ${port}<====`);
});
