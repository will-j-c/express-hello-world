const validSkills = require('../seeds/predefined-data/skills.json');
const validCategories = require('../seeds/predefined-data/categories.json');

const controller = {
  skills: (req, res) => res.json(validSkills),
  categories: (req, res) => res.json(validCategories),
};

module.exports = controller;
