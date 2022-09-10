/* eslint-disable no-underscore-dangle */
const ProjectModel = require('../models/projectModel');
const UserModel = require('../models/userModel');
const CommentModel = require('../models/commentModel');
const ContributorModel = require('../models/contributorModel');
const ContributorRelationships = require('../models/contributorsRelationship');

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
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        error: 'Validation failed',
      });
    }
    // Create new document
    try {
      await ProjectModel.create(validatedResults);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: 'Failed to create project',
      });
    }
    return res.status(201).json();
  },
  editProject: async (req, res) => {
    // Validations
    let validatedResults = null;
    try {
      validatedResults = await ProjectValidationSchema.validateAsync(req.body);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        error: 'Validation failed',
      });
    }
    // Find and update the document
    try {
      await ProjectModel.findOneAndUpdate({ slug: req.params.slug }, validatedResults);
      return res.status(201).json();
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: 'Failed to edit project',
      });
    }
  },
  projectShow: async (req, res) => {
    let project = null;
    let createdBy = null;
    let comments = null;
    let jobs = null;
    try {
      project = await ProjectModel.findOne({ slug: req.params.slug }, { __v: 0 }).lean();
      // Get creator
      createdBy = await UserModel.findOne(
        { _id: project.user_id },
        { username: 1, profile_pic_url: 1, _id: 0 }
      ).lean();
      // Get comments TODO consolidate user details into comments
      comments = await CommentModel.find({ project_id: project.user_id }).lean();
      // Get jobs
      // eslint-disable-next-line no-underscore-dangle
      jobs = await ContributorModel.find(
        { project_id: project._id },
        { project_id: 0, __v: 0 }
      ).lean();
      // Get users for jobs
      for (let i = 0, len = jobs.length; i < len; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        jobs[i].contributors = await ContributorRelationships.find(
          // eslint-disable-next-line no-underscore-dangle
          { contributor_id: jobs[i]._id },
          { _id: 0, contributor_id: 0, __v: 0 }
        );
        // Get the user details for each contributor and append to the jobs contributors
        for (let j = 0, { length } = jobs[i].contributors; j < length; j += 1) {
          // eslint-disable-next-line no-await-in-loop
          const user = await UserModel.findOne(
            { _id: jobs[i].contributors[j].user_id },
            { username: 1, profile_pic_url: 1, _id: 0 }
          ).lean();
          if (user) {
            jobs[i].contributors[j] = { user, state: jobs[i].contributors[j].state };
          }
        }
        delete jobs[i]._id;
      }
      // Clean up data that does not need to be sent
      delete project._id;
      delete project.user_id;
    } catch (error) {
      console.log(error);
      res.status(500);
      return res.json({
        error: 'Failed to fetch project from database',
      });
    }
    res.status(200);
    return res.json({ project, createdBy, comments, jobs });
  },
  followProject: async (req, res) => {
    res.send('hello');
  },
};

module.exports = controller;
