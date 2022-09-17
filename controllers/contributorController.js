/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const ContributorModel = require('../models/contributorModel');
const ProjectModel = require('../models/projectModel');
const RelationshipModel = require('../models/contributorsRelationship');
const UserModel = require('../models/userModel');

const validator = require('../validations/contributorValidation');
const validSkills = require('../seeds/predefined-data/skills.json');

const getData = async (username, contributorID) => {
  try {
    let user = await UserModel.findOne({ username });
    const contributor = await ContributorModel.findById(contributorID);
    const project = await ProjectModel.findOne({ _id: contributor?.project_id });
      const relation = await RelationshipModel.findOne({ 
      user_id: user._id,
      contributor_id: contributor._id,
    });

    return {
      user_id: user?._id,
      contributor_id: contributor?._id,
      projectOwnerId: project?.user_id,
      relation,
    }
  } catch (err) {
    return json.status(500).json({
      error: 'Failed to fetch data',
    })
  }
};

const controller = {
  index: async (req, res) => {
    try {
      // not sure but may need to apply filters based on req.query in future
      const filters = {};
      // note: unsure the implementation on FE
      // hence currently returning all data (in case need for filtering, etc)
      // can add $projects later on once FE implemnentation is confirmed
      const contributors = await ContributorModel
        .find({ filters }, { __v: 0 })
        .populate('project_id', { _id: 0, title: 1, slug: 1, tagline: 1, logo_url: 1 })
      ;

      // for consideration later: do we also want to pull contributorRelationships

      return res.json(contributors);

    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch data',
      });
    }
  },

  show: async (req, res) => {
    try {
      const { id } = req.params;
      const contributor = await ContributorModel.findOne({ _id: id });
      const project = await ProjectModel.findOne(
        { _id: contributor.project_id },
        { _id: 0, title: 1, slug: 1, tagline: 1, logo_url: 1 }
      );
      const relations = await RelationshipModel.find({ contributor_id: id });
      return res.json({ contributor, project, relations });
    } catch (error) {
      return res.status(404).json({
        error: 'Resource cannot be found',
      });
    }
  },

  showByProject: async (req, res) => {
    try {
      const project = await ProjectModel.findOne({ slug: req.params.slug });
      const project_id = project._id;
      const contributors = await ContributorModel.aggregate([
        { $match: { project_id } },
        { $project: { project_id: 0, __v: 0 } },
        { $sort: { updatedAt: -1 } },
      ]);
      
      for await (const contributor of contributors) {
        const contributor_id = contributor._id;
        const relations = await RelationshipModel
          .find({ contributor_id }, { _id: 0, __v: 0, contributor_id: 0 })
          .populate('user_id', { username: 1, _id: 0 })
        contributor.relations = relations;
      }

      return res.json(contributors);

    } catch (error) {
      console.log(error);
      return res.status(404).json({
        error: `Unable to find resource`,
      })
    }
  },

  add: async (req, res) => {
    let data = null;

    try {
      data = await validator.details.validateAsync(req.body);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid input',
      });
    }

    try {
      const { skills, title } = data;

      // get project
      const project = await ProjectModel.findOne({ slug: req.params.slug }, '_id');

      // check if there exists a contributor with the same name in database
      const existingContributor = await ContributorModel.findOne({
        project_id: project._id,
        title,
      });

      if (existingContributor) {
        return res.status(409).json({
          error: 'There is existing contributor with the same title',
        });
      }

      const validatedSkills = skills.filter(skill => validSkills.includes(skill));

      data.skills = validatedSkills;
      data.project_id = project._id;

      const newContributor = await ContributorModel.create(data);

      return res.status(201).json(newContributor);
    } catch (error) {
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
      return res.status(400).json({
        error: 'Invalid input',
      });
    }

    const relations = await RelationshipModel.find({ contributor_id: req.contributorID });

    const validatedSkills = data.skills.filter(skill => validSkills.includes(skill));
    data.skills = validatedSkills;

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
        { _id: req.contributorID },
        data,
        { new: true }
      );
      return res.json(updatedContributor);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to edit contributor',
      });
    }
  },

  delete: async (req, res) => {
    try {
      await ContributorModel.deleteOne({ _id: req.contributorID });
      await RelationshipModel.deleteMany({ contributor_id: req.contributorID });
      return res.json({
        message: `Successfully removed contributor ${req.contributorID}`,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to delete contributor',
      });
    }
  },

  addApplicant: async (req, res) => {
    try {
      const { user_id, contributor_id, projectOwnerId, relation } = await getData(req.authUser.username, req.params.id);

      if (relation) {
        return res.status(409).json({
          error: 'User has already applied previously',
        })
      }

      if (user_id.toString() === projectOwnerId.toString()) {
        return res.status(409).json({
          error: 'Project owner cannot apply to be a contributor',
        })
      }
      const newRelation = await RelationshipModel.create({
        user_id,
        contributor_id,
        state: 'applied'
      });
      return res.json(newRelation);

    } catch (error) {
      return res.status(500).json({
        error: 'Failed to apply',
      });
    }
  },

  removeApplicant: async (req, res) => {
    try {
      const { relation }= await getData(req.authUser.username, req.params.id);
      await relation.deleteOne();
      return res.json({
        message: `successfully delete ${relation._id}`,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to delete',
      });
    }
  },

  acceptApplicant: async (req, res) => {
    try {
      const { relation }= await getData(req.params.username, req.params.id);
      await relation.updateOne({ state: 'accepted' });
      return res.json({
        message: `Updated relationship ${relation._id} state to accepted`,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to update contributor status',
      });
    }
  },

  rejectApplicant: async (req, res) => {
    try {
      const { relation }= await getData(req.params.username, req.params.id);
      await relation.updateOne({ state: 'rejected' });
      return res.json({
        message: `Updated relationship ${relation._id} state to rejected`,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to update contributor status',
      });
    }
  },
};

module.exports = controller;
