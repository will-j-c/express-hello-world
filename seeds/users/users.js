/* eslint-disable no-restricted-syntax */
const bcrypt = require('bcrypt');

const UsersJson = require('./users.json');
const UserModel = require('../../models/userModel');

const createUsers = async (users) => {
  for await (const user of users) {
    console.log(`current user is ${JSON.stringify(user)}`);
    const pw = user.hash;
    const hash = await bcrypt.hash(pw, 10);
    user.hash = hash;
    console.log(`new hash is ${user.hash}`);

    try {
      await UserModel.create(user);
    } catch (err) {
      console.log(`err creating user: ${err}`);
    }
  }
};

module.exports = createUsers(UsersJson);
