/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const ContributorModel = require('../models/contributorModel');
const ProjectModel = require('../models/projectModel');
const RelationshipModel = require('../models/contributorsRelationship');
const UserModel = require('../models/userModel');

const validator = require('../validations/contributorValidation');
const validSkills = require('../seeds/predefined-data/skills.json');

const getData = async (req) => {
  const user = await UserModel.findOne({ username: req.authUser.username });
  console.log(`userid is ${user._id}`);
  let projectFilter = null;
  let isProjectOwner = null;
  const contributor = await ContributorModel.findOne({ _id: req.params.id });

  let relations = null;
  if (contributor) {
    relations = await RelationshipModel.find({ contributor_id: contributor._id });
  }

  if (req.body.project_slug) {
    projectFilter = { slug: req.body.project_slug };
  } else if (contributor) {
    projectFilter = { _id: contributor.project_id };
  }

  const project = await ProjectModel.findOne(projectFilter);
  isProjectOwner = project.user_id.toString() === user._id.toString();

  // TO DO: once authorization middleware is ready, can remove this
  // const isProjectOwner = project.user_id.toString() === user._id.toString();
  return [user, project, contributor, isProjectOwner, relations];
};

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
    const data = { ...req.body };
    delete data.project_slug;
    try {
      await validator.details.validateAsync(data);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        error: 'Invalid input',
      });
    }

    try {
      const [, project, , isProjectOwner] = await getData(req);

      // authorisation check: whether user is the project owner
      if (!isProjectOwner) {
        return res.status(401).json({
          error: 'User is not authorised to change this project',
        });
      }

      const { skills, title } = data;

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

      const skillsArr = skills
        .split(',')
        .map((item) => item.trim())
        .filter((item) => validSkills.includes(item));

      data.skills = skillsArr;
      data.project_id = project._id;

      const newContributor = await ContributorModel.create(data);

      return res.status(201).json(newContributor);
    } catch (error) {
      console.log(`error: ${error}`);
      return res.status(500).json({
        error: 'Failed to fetch data',
      });
    }
  },

  update: async (req, res) => {
    let data = null;
    try {
      data = await validator.details.validateAsync(req.body);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        error: 'Invalid input',
      });
    }

    const [, , contributor, isProjectOwner, relations] = await getData(req);

    // authorisation check: whether user is the project owner
    if (!isProjectOwner) {
      return res.status(401).json({
        error: 'User is not authorised to change this project',
      });
    }

    const skillsArr = data.skills
      .split(',')
      .map((item) => item.trim())
      .filter((item) => validSkills.includes(item));
    data.skills = skillsArr;

    // cannot change available slots below the # of accepted users
    const acceptedRelations = relations.filter((relation) => relation.state === 'accepted');
    if (data.available_slots < acceptedRelations.length) {
      return res.status(400).json({
        error: 'Invalid input',
      });
    }

    // Find and update the document
    try {
      const updatedContributor = await ContributorModel.findOneAndUpdate(
        { _id: contributor._id },
        data,
        { new: true }
      );
      return res.status(200).json(updatedContributor);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: 'Failed to edit contributor',
      });
    }
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
