/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
const UserModel = require('../../models/userModel');
const RoleModel = require('../../models/roleModel');
const RolesRelationShipModel = require('../../models/rolesRelationship');

const createRolesRelationships = async (relations) => {
  const users = await UserModel.find().exec();
  const roles = await RoleModel.find().exec();

  relations[0].user_id = users[0]._id;
  relations[0].role_id = roles[1]._id;
  relations[1].user_id = users[0]._id;
  relations[1].role_id = roles[4]._id;
  relations[2].user_id = users[1]._id;
  relations[2].role_id = roles[0]._id;
  relations[3].user_id = users[1]._id;
  relations[3].role_id = roles[2]._id;
  relations[4].user_id = users[2]._id;
  relations[4].role_id = roles[0]._id;
  relations[5].user_id = users[3]._id;
  relations[5].role_id = roles[0]._id;

  for await (const relation of relations) {
    try {
      await RolesRelationShipModel.create(relation);
    } catch (err) {
      console.log(`err creating roles relationship: ${err}`);
    }
  }
};

module.exports = createRolesRelationships;
