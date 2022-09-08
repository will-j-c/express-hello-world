const ProjectModel = require('../models/projectModel');

const controller = {
  showAllProjects: async (req, res) => {
    let projects = [];
    try {
      projects = await ProjectModel.aggregate([{ $match: {} }, { $sort: { createdAt: 1 } }]);
    } catch (error) {
      res.status(500);
      return res.json({
        error: 'Failed to fetch projects from database',
      });
    }
    res.status(200);
    return res.json(projects);
  },
};

module.exports = controller;
