/* eslint-disable prettier/prettier */
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const projectRouter = require('./routes/projectRoutes');
const authRouter = require('./routes/authRoutes');
const commentRouter = require('./routes/commentRoutes');
const roleRouter = require('./routes/roleRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 8800;

app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/roles', roleRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/users', userRouter);

app.listen(port, async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_STRING,
      { dbName: 'hello-world' }
    );
  } catch (error) {
    console.log(`====>Failed to connect to DB<==== Error: ${error}`);
    process.exit(1);
  }
  console.log(`====>Connected to MongoDB`);
  console.log(`====>HelloWorld app listening on port ${port}<====`);
});
