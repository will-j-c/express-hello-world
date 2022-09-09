/* eslint-disable no-unused-vars */
require('./config');

const userSeed = require('./users/users');
const UsersJson = require('./users/users.json');

const projectsSeed = require('./projects/projects');
const ProjectsJson = require('./projects/projects.json');

const rolesSeed = require('./roles/roles');
const RolesJson = require('./roles/roles.json');

const usersRelationshipsSeed = require('./usersRelationship/usersRelationship');
const UsersRelations = require('./usersRelationship/usersRelationship.json');

const seed = async () => {
  const usersSeeding = await userSeed(UsersJson);
  const projectsSeeding = await projectsSeed(ProjectsJson);
  const rolesSeeding = await rolesSeed(RolesJson);
  const usersRelationshipsSeeding = await usersRelationshipsSeed(UsersRelations);
  process.exit(1);
};

seed();
