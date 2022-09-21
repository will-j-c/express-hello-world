/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
const UserModel = require('../../models/userModel');
const contributorModel = require('../../models/contributorModel');
const contributorsRelationShipModel = require('../../models/contributorsRelationship');

const createcontributorsRelationships = async (relations) => {
  const users = await UserModel.find().exec();
  const contributors = await contributorModel.find().exec();

  relations[0].user_id = users[0]._id;
  relations[0].contributor_id = contributors[1]._id;
  relations[1].user_id = users[0]._id;
  relations[1].contributor_id = contributors[4]._id;
  relations[2].user_id = users[1]._id;
  relations[2].contributor_id = contributors[0]._id;
  relations[3].user_id = users[1]._id;
  relations[3].contributor_id = contributors[2]._id;
  relations[4].user_id = users[2]._id;
  relations[4].contributor_id = contributors[0]._id;
  relations[5].user_id = users[3]._id;
  relations[5].contributor_id = contributors[0]._id;
  relations[6].user_id = users[4]._id;
  relations[6].contributor_id = contributors[0]._id;

  for await (const relation of relations) {
    try {
      await contributorsRelationShipModel.create(relation);
    } catch (err) {
      console.log(`err creating contributors relationship: ${err}`);
    }
  }
};

module.exports = createcontributorsRelationships;
