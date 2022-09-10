/* eslint-disable no-unused-vars */
require('./config');

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
  const projectsRelationshipsSeeding = await projectsRelationshipsSeed(ProjectsRelations);
  const contributorsRelationshipsSeeding = await contributorsRelationshipsSeed(
    contributorsRelations
  );
  process.exit(1);
};

seed();
