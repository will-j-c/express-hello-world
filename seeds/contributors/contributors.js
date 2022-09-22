/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
const contributorModel = require('../../models/contributorModel');
const ProjectModel = require('../../models/projectModel');

const createcontributors = async (contributors) => {
  // get projectIDs from DB
  const firstProjectID = await ProjectModel.findOne({ title: 'Happy Robot' }).exec();
  const secondProjectID = await ProjectModel.findOne({ title: 'Happy Meal' }).exec();
  const thirdProjectID = await ProjectModel.findOne({ title: 'An Archived Project' }).exec();
  const fourthProjectID = await ProjectModel.findOne({ title: 'Filled Out Project' }).exec();

  contributors[0].project_id = firstProjectID;
  contributors[1].project_id = secondProjectID;
  contributors[2].project_id = firstProjectID;
  contributors[3].project_id = thirdProjectID;
  contributors[4].project_id = fourthProjectID;

  const allProjects = await ProjectModel.find().exec();

  // for the rest of the projects, assign random userID among the main users
  for (let i = 5, j = contributors.length; i < j; i++) {
    const randomProject = allProjects[Math.floor(Math.random() * allProjects.length)];
    contributors[i].project_id = randomProject._id;
  }

  for await (const contributor of contributors) {
    try {
      await contributorModel.create(contributor);
    } catch (err) {
      console.log(`err creating contributor: ${err}`);
    }
  }
};

module.exports = createcontributors;
