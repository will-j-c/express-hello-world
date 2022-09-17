/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const UserModel = require('../../models/userModel');
const UsersRelationShipModel = require('../../models/usersRelationship');

const createUsersRelationships = async (relations) => {
  const users = await UserModel.find().exec();

  relations[0].follower = users[0]._id;
  relations[0].followee = users[1]._id;
  relations[1].follower = users[1]._id;
  relations[1].followee = users[0]._id;
  relations[2].follower = users[0]._id;
  relations[2].followee = users[2]._id;
  relations[3].follower = users[3]._id;
  relations[3].followee = users[0]._id;

  for await (const relation of relations) {
    try {
      await UsersRelationShipModel.create(relation);
    } catch (err) {
      console.log(`err creating users relationship: ${err}`);
    }
  }
};

module.exports = createUsersRelationships;
