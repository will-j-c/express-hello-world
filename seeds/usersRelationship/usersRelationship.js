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
  relations[4].follower = users[6]._id;
  relations[4].followee = users[0]._id;
  relations[5].follower = users[0]._id;
  relations[5].followee = users[7]._id;
  relations[6].follower = users[0]._id;
  relations[6].followee = users[5]._id;
  relations[7].follower = users[0]._id;
  relations[7].followee = users[6]._id;
  relations[8].follower = users[9]._id;
  relations[8].followee = users[0]._id;
  relations[9].follower = users[6]._id;
  relations[9].followee = users[2]._id;
  relations[10].follower = users[6]._id;
  relations[10].followee = users[3]._id;
  relations[11].follower = users[6]._id;
  relations[11].followee = users[1]._id;


  for await (const relation of relations) {
    try {
      await UsersRelationShipModel.create(relation);
    } catch (err) {
      console.log(`err creating users relationship: ${err}`);
    }
  }
};

module.exports = createUsersRelationships;
