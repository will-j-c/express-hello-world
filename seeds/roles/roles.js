/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
const RoleModel = require('../../models/contributorModel');
const ProjectModel = require('../../models/projectModel');

const createRoles = async (roles) => {
  // get projectIDs from DB
  const firstProjectID = await ProjectModel.findOne({ title: 'Happy Robot' }).exec();
  const secondProjectID = await ProjectModel.findOne({ title: 'Happy Meal' }).exec();
  const thirdProjectID = await ProjectModel.findOne({ title: 'An Archived Project' }).exec();
  const fourthProjectID = await ProjectModel.findOne({ title: 'Filled Out Project' }).exec();

  roles[0].project_id = firstProjectID;
  roles[1].project_id = secondProjectID;
  roles[2].project_id = firstProjectID;
  roles[3].project_id = thirdProjectID;
  roles[4].project_id = fourthProjectID;

  for await (const role of roles) {
    try {
      await RoleModel.create(role);
    } catch (err) {
      console.log(`err creating role: ${err}`);
    }
  }
};

module.exports = createRoles;
