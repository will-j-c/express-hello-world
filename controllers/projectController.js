/* eslint-disable no-underscore-dangle */
const ProjectModel = require('../models/projectModel');
const UserModel = require('../models/userModel');
const CommentModel = require('../models/commentModel');
const ContributorModel = require('../models/contributorModel');
const ContributorRelationshipsModel = require('../models/contributorsRelationship');
const ProjectsRelationshipModel = require('../models/projectsRelationship');
const ProjectValidationSchema = require('../validations/projectValidation');

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
      return res.status(500).json({
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
  deleteProject: async (req, res) => {
    try {
      // Find the project to delete so that you can use the _id, if the project doesn't exist return 404 Not Found
      const projectToDelete = await ProjectModel.findOne({ slug: req.params.slug }, { _id: 1 });
      if (!projectToDelete) {
        return res.status(404).json();
      }
      // Delete the roles and the relationships
      const rolesToDelete = await ContributorModel.find(
        { project_id: projectToDelete._id },
        { _id: 1 }
      );
      await ContributorRelationshipsModel.deleteMany({ contributor_id: { $in: rolesToDelete } });
      await ContributorModel.deleteMany({ project_id: projectToDelete._id });
      // Delete project references in comments
      await CommentModel.deleteMany({ project_id: projectToDelete._id });
      // Delete project references in project relationships
      await ProjectsRelationshipModel.deleteMany({ project_id: projectToDelete._id });
      // Delete project in projects
      projectToDelete.deleteOne();
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: 'Failed to delete project',
      });
    }
    return res.status(200).json();
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
      comments = await CommentModel.find(
        { project_id: project._id },
        { _id: 0, project_id: 0, __v: 0 }
      ).lean();
      for (let i = 0, len = comments.length; i < len; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const user = await UserModel.findOne(
          { _id: comments[i].user_id },
          { username: 1, profile_pic_url: 1, _id: 0 }
        ).lean();
        comments[i].createdBy = user;
        delete comments[i].user_id;
      }
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
      const updatedRelationship = await ProjectsRelationshipModel.findOneAndUpdate(
        { user_id: user._id, project_id: project._id },
        {},
        { upsert: true, new: true }
      );
      console.log(updatedRelationship);
      if (updatedRelationship) {
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
