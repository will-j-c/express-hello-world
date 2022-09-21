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
  const melody = await UserModel.findOne({ username: 'melody' }).exec();
  const will = await UserModel.findOne({ username: 'will' }).exec();
  const zoe = await UserModel.findOne({ username: 'zoe' }).exec();

  projects[0].user_id = harold._id;
  projects[1].user_id = steve._id;
  projects[2].user_id = harold._id;
  projects[3].user_id = harold._id;
  projects[5].user_id = mcspicy._id;
  projects[6].user_id = mcspicy._id;
  projects[7].user_id = will._id;
  projects[8].user_id = will._id;
  projects[9].user_id = zoe._id;
  projects[10].user_id = zoe._id;
  projects[11].user_id = melody._id;
  projects[12].user_id = melody._id;

  for await (const project of projects) {
    try {
      await ProjectModel.create(project);
    } catch (err) {
      console.log(`err creating project: ${err}`);
    }
  }
};

module.exports = createProjects;
