/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
// const ProjectsJson = require('./projects.json');
const ProjectModel = require('../../models/projectModel');
const UserModel = require('../../models/userModel');

const createProjects = async (projects) => {
  // get userIDs from DB to create projects
  const harold = await UserModel.findOne({ username: 'harold' }).exec();
  const steve = await UserModel.findOne({ username: 'steve' }).exec();
  const mcspicy = await UserModel.findOne({ username: 'mcspicy' }).exec();

  projects[0].user_id = harold._id;
  projects[1].user_id = steve._id;
  projects[2].user_id = harold._id;
  projects[3].user_id = harold._id;
  projects[4].user_id = mcspicy._id;

  for await (const project of projects) {
    try {
      await ProjectModel.create(project);
    } catch (err) {
      console.log(`err creating project: ${err}`);
    }
  }
};

module.exports = createProjects;
