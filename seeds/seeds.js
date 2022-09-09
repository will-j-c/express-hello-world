/* eslint-disable no-unused-vars */
require('./config');

// const globAll = require('glob-all');
const userSeed = require('./users/users');
const UsersJson = require('./users/users.json');

const projectsSeed = require('./projects/projects');
const ProjectsJson = require('./projects/projects.json');

const seed = async () => {
  // const requireAll = globAll
  //   .sync(['seeds/users/*.js', '!seeds/config.js', '!seeds/seeds.js'])
  //   .map((filepath) => {
  //     console.log('Seeding: ', filepath);
  //     // eslint-disable-next-line import/no-dynamic-require, global-require
  //     return require(`../${filepath}`);
  //   });

  // await Promise.all(requireAll);
  // return require(`./users/users`);
  // process.exit(1);

  const usersSeeding = await userSeed(UsersJson);
  const projectsSeeding = await projectsSeed(ProjectsJson);
  process.exit(1);
};

seed();
