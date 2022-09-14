/* eslint-disable prettier/prettier */
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const projectRouter = require('./routes/projectRoutes');
const authRouter = require('./routes/authRoutes');
const commentRouter = require('./routes/commentRoutes');
const contributorRouter = require('./routes/contributorRoutes');
const userRouter = require('./routes/userRoutes');
const dataRouter = require('./routes/dataRoutes');

const app = express();
const port = process.env.PORT || 8800;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({ origin: process.env.CORS_ORIGIN }));

app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/contributors', contributorRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/data/', dataRouter);

app.listen(port, async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_STRING, { dbName: 'hello-world' });
  } catch (error) {
    console.log(`====>Failed to connect to DB<==== Error: ${error}`);
    process.exit(1);
  }
  console.log(`====>Connected to MongoDB`);
  console.log(`====>HelloWorld app listening on port ${port}<====`);
});
