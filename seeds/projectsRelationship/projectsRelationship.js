/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const UserModel = require('../../models/userModel');
const ProjectModel = require('../../models/projectModel');
const ProjectsRelationShipModel = require('../../models/projectsRelationship');

const createProjectsRelationships = async (relations) => {
  const users = await UserModel.find().exec();
  const projects = await ProjectModel.find().exec();

  relations[0].user_id = users[0]._id;
  relations[0].project_id = projects[1]._id;
  relations[1].user_id = users[0]._id;
  relations[1].project_id = projects[4]._id;
  relations[2].user_id = users[1]._id;
  relations[2].project_id = projects[0]._id;
  relations[3].user_id = users[2]._id;
  relations[3].project_id = projects[4]._id;
  relations[4].user_id = users[1]._id;
  relations[4].project_id = projects[3]._id;
  relations[5].user_id = users[0]._id;
  relations[5].project_id = projects[6]._id;
  relations[6].user_id = users[1]._id;
  relations[6].project_id = projects[7]._id;
  relations[7].user_id = users[6]._id;
  relations[7].project_id = projects[0]._id;
  relations[8].user_id = users[5]._id;
  relations[8].project_id = projects[0]._id;
  relations[9].user_id = users[1]._id;
  relations[9].project_id = projects[5]._id;
  relations[10].user_id = users[3]._id;
  relations[10].project_id = projects[0]._id;
  relations[11].user_id = users[3]._id;
  relations[11].project_id = projects[1]._id;

  for await (const relation of relations) {
    try {
      await ProjectsRelationShipModel.create(relation);
    } catch (err) {
      console.log(`err creating projects relationship: ${err}`);
    }
  }
};

module.exports = createProjectsRelationships;
