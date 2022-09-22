/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
require('./config');
const UserModel = require('../models/userModel');
const ProjectModel = require('../models/projectModel');
const CommentModel = require('../models/commentModel');

const userSeed = require('./users/users');
const UsersJson = require('./users/users.json');

const projectsSeed = require('./projects/projects');
const ProjectsJson = require('./projects/projects.json');

const contributorsSeed = require('./contributors/contributors');
const contributorsJson = require('./contributors/contributors.json');

const usersRelationshipsSeed = require('./usersRelationship/usersRelationship');
const UsersRelations = require('./usersRelationship/usersRelationship.json');

const projectsRelationshipsSeed = require('./projectsRelationship/projectsRelationship');
const ProjectsRelations = require('./projectsRelationship/projectsRelationship.json');

const contributorsRelationshipsSeed = require('./contributorsRelationship/contributorsRelationship');
const contributorsRelations = require('./contributorsRelationship/contributorsRelationship.json');

const seed = async () => {
  const usersSeeding = await userSeed(UsersJson);
  const projectsSeeding = await projectsSeed(ProjectsJson);
  const contributorsSeeding = await contributorsSeed(contributorsJson);
  const usersRelationshipsSeeding = await usersRelationshipsSeed(UsersRelations);
  // const projectsRelationshipsSeeding = await projectsRelationshipsSeed(ProjectsRelations);
  // const contributorsRelationshipsSeeding = await contributorsRelationshipsSeed(
  //   contributorsRelations
  // );

  // Seed some random comments
  // const numOfComments = 50;
  // const commentData = [];
  // const userIds = await UserModel.find({}, { _id: 1 }).lean();
  // const projectIds = await ProjectModel.find({}, { _id: 1 }).lean();
  // for (let i = 0; i < numOfComments; i += 1) {
  //   const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
  //   const randomProject = projectIds[Math.floor(Math.random() * projectIds.length)];
  //   const newComment = {
  //     user_id: randomUser._id,
  //     project_id: randomProject._id,
  //     content: `Comment ${i + 1}: I like dungeons and dragons and McSpicy`,
  //   };
  //   commentData.push(newComment);
  // }
  // await CommentModel.create(commentData);
  process.exit(1);
};

seed();
