/* eslint-disable no-underscore-dangle */
const ContributorModel = require('../models/contributorModel');
const ProjectModel = require('../models/projectModel');
const RelationshipModel = require('../models/contributorsRelationship');
const UserModel = require('../models/userModel');

const controller = {
  showAll: async (req, res) => {
    // not sure but may need to apply filters based on req.query in future
    const filters = {};
    let contributors = [];
    let projects = [];
    try {
      // note: unsure the implementation on FE
      // hence currently returning all data (in case need for filtering, etc)
      // can add $projects later on once FE implemnentation is confirmed
      contributors = await ContributorModel.aggregate([
        { $match: filters },
        { $sort: { updatedAt: -1 } },
      ]);

      const projectIDsData = await ContributorModel.aggregate([
        { $match: filters },
        { $project: { _id: 0, project_id: 1 } },
      ]);

      const projectIDs = [];

      projectIDsData.forEach((e) => {
        const id = e.project_id;
        if (!projectIDs.includes(id)) {
          projectIDs.push(id);
        }
      });

      // get projects
      // currently returning title, slug, tagline, logo
      // can adjust later depending on FE implementation
      projects = await ProjectModel.find(
        { _id: { $in: projectIDs } },
        { _id: 0, title: 1, slug: 1, tagline: 1, logo_url: 1 }
      );

      // for consideration later: do we also want to pull contributorRelationships
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch data',
      });
    }
    return res.json({ contributors, projects });
  },

  showOne: async (req, res) => {
    let contributor = null;
    let project = null;
    let relations = [];
    const { id } = req.params;
    try {
      contributor = await ContributorModel.findOne({ _id: id });
      project = await ProjectModel.findOne(
        { _id: contributor.project_id },
        { _id: 0, title: 1, slug: 1, tagline: 1, logo_url: 1 }
      );
      relations = await RelationshipModel.find({ contributor_id: id });
    } catch (error) {
      return res.status(404).json({
        error: 'Resource cannot be found',
      });
    }
    return res.json({ contributor, project, relations });
  },

  add: async (req, res) => {
    // TO DO: add validator
    const { project_slug, title, skills, is_remote, description, commitmentLevel, available_slots } = req.body;
    try {
      const user = await UserModel.findOne({ username: req.authUser.username });
      const project = await ProjectModel.findOne({ slug: project_slug });

      // authorisation check: whether user is the project owner
      if (project.user_id.toString() !== user._id.toString()) {
        return res.status(401).json({
          error: 'User is not authorised to change this project',
        });
      }

      // check if there exists a contributor with the same name in database
      const existingContributor = await ContributorModel.find({
        project_id: project._id,
        title,
      });

      if (existingContributor.length > 0) {
        return res.status(409).json({
          error: 'There is existing contributor with the same title',
        });
      }

      const newContributor = await ContributorModel.create({
        title,
        project_id: project._id,
        // TO DO: change skills to array
        skills,
        is_remote,
        description,
        commitmentLevel,
        available_slots
      });

      return res.status(201).json(newContributor);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch data',
      });
    }

  },

  update: async (req, res) => {

  },

  delete: async (req, res) => {

  },

  addApplicant: async (req, res) => {

  },

  removeApplicant: async (req, res) => {

  },

  acceptApplicant: async (req, res) => {

  },

  rejectApplicant: async (req, res) => {

  },
}

module.exports = controller;
