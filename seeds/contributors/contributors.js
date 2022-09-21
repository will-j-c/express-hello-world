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
  const fifthProjectID = await ProjectModel.findOne({ title: 'Appwrite' }).exec();
  const sixthProjectID = await ProjectModel.findOne({ title: 'Templates by Equals' }).exec();
  const seventhProjectID = await ProjectModel.findOne({ title: 'AppLogger by PLG Works' }).exec();
  const eighthProjectID = await ProjectModel.findOne({ title: 'Spotify Audiobooks' }).exec();
  const ninthProjectID = await ProjectModel.findOne({ title: 'Retention AI' }).exec();
  const tenthProjectID = await ProjectModel.findOne({ title: 'Amazon Go' }).exec();
  const eleventhProjectID = await ProjectModel.findOne({ title: 'PhotoScan by Google' }).exec();
  const twelfthProjectID = await ProjectModel.findOne({ title: 'Google Duplex' }).exec();
  const thirteenthProjectID = await ProjectModel.findOne({ title: 'Brain.fm' }).exec();

  contributors[0].project_id = firstProjectID;
  contributors[1].project_id = secondProjectID;
  contributors[2].project_id = firstProjectID;
  contributors[3].project_id = thirdProjectID;
  contributors[4].project_id = fourthProjectID;
  contributors[5].project_id = fifthProjectID;
  contributors[6].project_id = sixthProjectID;
  contributors[7].project_id = seventhProjectID;
  contributors[8].project_id = eighthProjectID;
  contributors[9].project_id = ninthProjectID;
  contributors[10].project_id = tenthProjectID;
  contributors[11].project_id = eleventhProjectID;
  contributors[12].project_id = twelfthProjectID;
  contributors[13].project_id = thirteenthProjectID;

  for await (const contributor of contributors) {
    try {
      await contributorModel.create(contributor);
    } catch (err) {
      console.log(`err creating contributor: ${err}`);
    }
  }
};

module.exports = createcontributors;
