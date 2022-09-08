const ProjectsJson = require('./projects.json');
const ProjectModel = require('../../models/projectModel');
const UserModel = require('../../models/userModel');

const createProjects = async (projects) => {
  // gert userIDs from DB to create projects
  const firstUserID = await UserModel.findOne({ username: 'harold' }).exec();
  // const secondUserID = await UserModel.findOne({ username: 'steve' }).exec();
  // const thirdUserID = await UserModel.findOne({ username: 'mcspicy' }).exec();

  projects[0].user_id = firstUserID;
  console.log(`first project user_id is ${projects[0].user_id}`);
  // projects[1].user_id = firstUserID;
  // projects[3].user_id = firstUserID;

  const xx = await ProjectModel.create(projects);
  console.log(`Created ${xx.length} users`);
};

module.exports = createProjects(ProjectsJson);
