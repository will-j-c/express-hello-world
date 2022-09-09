const ProjectModel = require('../models/projectModel');
const ProjectValidationSchema = require('../validations/projectValidation');

const controller = {
  showAllProjects: async (req, res) => {
    let projects = [];
    try {
      projects = await ProjectModel.aggregate([{ $match: {} }, { $sort: { updatedAt: -1 } }]);
    } catch (error) {
      res.status(500);
      return res.json({
        error: 'Failed to fetch projects from database',
      });
    }
    res.status(200);
    return res.json(projects);
  },
  createProject: async (req, res) => {
    // Validations
    let validatedResults = null;
    try {
      validatedResults = await ProjectValidationSchema.validateAsync(req.body);
      console.log(validatedResults);
    } catch (error) {
      console.log(error);
      res.status(400);
      return res.json({
        error: 'Validation failed',
      });
    }
    // Create new document
    try {
      await ProjectModel.create(validatedResults);
    } catch (error) {
      console.log(error);
      res.status(500);
      return res.json({
        error: 'Failed to create project',
      });
    }
    return res.status(201).json();
  },
};

module.exports = controller;
