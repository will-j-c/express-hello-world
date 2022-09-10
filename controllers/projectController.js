/* eslint-disable no-underscore-dangle */
const ProjectModel = require('../models/projectModel');
const UserModel = require('../models/userModel');
const CommentModel = require('../models/commentModel');
const ContributorModel = require('../models/contributorModel');
const ContributorRelationshipsModel = require('../models/contributorsRelationship');
const ProjectsRelationshipModel = require('../models/projectsRelationship');
const ProjectValidationSchema = require('../validations/projectValidation');
const { findOne } = require('../models/projectModel');

const controller = {
  showAllProjects: async (req, res) => {
    let projects = [];
    try {
      projects = await ProjectModel.aggregate([
        { $match: {} },
        { $project: { _id: 0, user_id: 0, description: 0 } },
        { $sort: { updatedAt: -1 } },
      ]);
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
      jobs = await ContributorModel.find(
        { project_id: project._id },
        { project_id: 0, __v: 0 }
      ).lean();
      // Get users for jobs
      for (let i = 0, len = jobs.length; i < len; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        jobs[i].contributors = await ContributorRelationshipsModel.find(
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
    try {
      const user = await UserModel.findOne({ username: req.params.username }, { _id: 1 }).lean();
      const project = await ProjectModel.findOne({ slug: req.params.slug }, { _id: 1 }).lean();
      // Check if user has already followed project and create relationship if not
      const userAlreadyFollowing = await ProjectsRelationshipModel.findOne(
        { user_id: user._id, project_id: project._id },
        { _id: 1 }
      ).lean();
      if (!userAlreadyFollowing) {
        await ProjectsRelationshipModel.create({ user_id: user._id, project_id: project._id });
        return res.status(201).json();
      }
      return res.status(204).json();
    } catch (error) {
      console.log(error);
      res.status(500);
      return res.json({
        error: 'Failed to follow project',
      });
    }
  },
  unfollowProject: async (req, res) => {
    try {
      const user = await UserModel.findOne({ username: req.params.username }, { _id: 1 }).lean();
      const project = await ProjectModel.findOne({ slug: req.params.slug }, { _id: 1 }).lean();
      // Check if user has already followed project and create relationship if not
      const response = await ProjectsRelationshipModel.deleteOne({
        user_id: user._id,
        project_id: project._id,
      });
      if (response.deletedCount) {
        return res.status(205).json();
      }
      return res.status(204).json();
    } catch (error) {
      console.log(error);
      res.status(500);
      return res.json({
        error: 'Failed to unfollow project',
      });
    }
  },
};

module.exports = controller;
