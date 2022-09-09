/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const UserModel = require('../../models/userModel');
const UsersRelationShipModel = require('../../models/usersRelationship');

const createUsersRelationships = async (relations) => {
  // get userIDs from DB to create projects
  const firstUserID = await UserModel.findOne({ username: 'harold' }).exec();
  const secondUserID = await UserModel.findOne({ username: 'steve' }).exec();
  const thirdUserID = await UserModel.findOne({ username: 'mcspicy' }).exec();
  const fourthUserID = await UserModel.findOne({ username: 'zoe' }).exec();

  relations[0].follower = firstUserID._id;
  relations[0].followee = secondUserID._id;
  relations[1].follower = secondUserID._id;
  relations[1].followee = firstUserID._id;
  relations[2].follower = firstUserID._id;
  relations[2].followee = thirdUserID._id;
  relations[3].follower = fourthUserID._id;
  relations[3].followee = firstUserID._id;

  for await (const relation of relations) {
    try {
      await UsersRelationShipModel.create(relation);
    } catch (err) {
      console.log(`err creating users relationship: ${err}`);
    }
  }
};

module.exports = createUsersRelationships;
