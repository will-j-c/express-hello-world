/* eslint-disable no-underscore-dangle */
const ProjectModel = require('../models/projectModel');
const UserModel = require('../models/userModel');
const CommentModel = require('../models/commentModel');
const ContributorModel = require('../models/contributorModel');
const ContributorRelationshipsModel = require('../models/contributorsRelationship');
const ProjectsRelationshipModel = require('../models/projectsRelationship');
const projectValidationSchema = require('../validations/projectValidation');
const ImageKit = require('imagekit');

const imageKit = new ImageKit({
  publicKey: 'public_QbELL12FWyFW2r8fpAWMLY2t6j0=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: 'https://ik.imagekit.io/wu6yrdrjf/',
});

const getLogoUrl = async (photoUploaded, fileName) => {
  try {
    if (photoUploaded) {
      const logo_from_multer = photoUploaded[0]; //.logo_url[0];
      const logo_from_imageKit = await imageKit.upload({
        file: logo_from_multer.buffer,
        fileName: `${fileName}-logo_url-${Date.now()}`,
        folder: `helloworld/logo_url`,
      });
      return logo_from_imageKit.url;
    } else {
      return 'https://i.pinimg.com/564x/a9/d6/7e/a9d67e7c7c1f738141b3d728c31b2dd8.jpg';
    }
  } catch (error) {}
};

const getProjectImageUrls = async (photosUploadedArr, fileName) => {
  try {
    let photosImageKit = [];
    for (let i = 0, len = photosUploadedArr?.length; i < len; i++) {
      const project_image = await imageKit.upload({
        file: photosUploadedArr[i]?.buffer,
        fileName: `${fileName}-image_urls-${Date.now()}`,
        folder: `helloworld/image_urls`,
      });
      photosImageKit[i] = project_image.url;
    }
    return photosImageKit;
  } catch (error) {}
};

const diffArray = (oldData, deletedData) => {
  return [...oldData, ...deletedData].filter(
    (v) => oldData.includes(v) && !deletedData.includes(v)
  );
};

const controller = {
  showAllProjects: async (req, res) => {
    const categoriesFilter = req.query?.categories?.replaceAll('-', ' ').split(',');
    const keywordsFilter = req.query?.q;
    const limit = req.query?.limit;

    try {
      let projects = null;
      if (!categoriesFilter && !keywordsFilter) {
        projects = await ProjectModel.find(
          {
            state: 'published',
          },
          { __v: 0, _id: 0, description: 0 }
        )
          .sort({ updatedAt: 'desc' })
          .populate({
            path: 'user_id',
            select: '-_id username',
          });

      } else if (keywordsFilter) {
        projects = await ProjectModel.find(
          { $and: [
            { state: 'published' },
            { $or: [
              { title: { "$regex": keywordsFilter, "$options": "i" } },
              { tagline: { "$regex": keywordsFilter, "$options": "i" } },
              { categories: { $elemMatch : {"$regex": keywordsFilter, "$options": "i" }} }
            ]}
          ]},
          { __v: 0, _id: 0, description: 0 }
        )
          .sort({ updatedAt: 'desc' })
          .populate({
            path: 'user_id',
            select: '-_id username',
          });

      } else if (categoriesFilter) {
        projects = await ProjectModel.find(
          {
            state: 'published',
            categories: { $in: categoriesFilter },
          },
          { __v: 0, _id: 0, description: 0 }
        )
          .sort({ updatedAt: 'desc' })
          .populate({
            path: 'user_id',
            select: '-_id username',
          });
      }

      if (limit) {
        projects = projects.slice(0, limit);
      }
      return res.json(projects);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: 'Failed to fetch projects from database',
      });
    }
  },

  uploadPhotos: async (req, res) => {
    if (req.files?.logo_url) {
      try {
        req.body.logo_url = await getLogoUrl(req.files.logo_url, req.query.slug);
      } catch (error) {
        return res.status(401).json({
          error: 'Failed to upload project logo',
        });
      }
    }
    if (req.files?.image_urls) {
      try {
        req.body.image_urls = await getProjectImageUrls(req.files.image_urls, req.query.slug);
      } catch (error) {
        return res.status(401).json({
          error: 'Failed to upload project Images',
        });
      }
    }
    try {
      await ProjectModel.findOneAndUpdate({ slug: req.query.slug }, req.body);
      return res.status(201).json(req.body);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to upload photos',
      });
    }
  },

  createProject: async (req, res) => {
    //define projectOwner
    const projectOwner = await UserModel.findOne({ username: req.authUser.username }, { _id: 1 });
    req.body.user_id = projectOwner?._id.toString();
    // Delete fields not required in create action
    delete req.body.username;
    delete req.body.step;
    delete req.body?.image_urls;
    delete req.body?.logo_url;
    delete req.body?.image_urls_files;
    delete req.body?.logo_url_files;
    delete req.body?.deleted_images;
    // Validations
    let validatedResults = null;
    if (req.headers['content-type'] === 'application/json') {
      try {
        validatedResults = await projectValidationSchema.create.validateAsync(req.body);
      } catch (error) {
        return res.status(400).json({
          error: 'Validation failed',
        });
      }
      // Create new document
      try {
        const project = await ProjectModel.create(validatedResults);
        return res.status(201).json({ slug: project.slug });
      } catch (error) {
        return res.status(500).json({
          error: 'Failed to create project',
        });
      }
    }
  },
  editImages: async (req, res) => {
    // check If user change project images and logo?
    if (req.files?.logo_url) {
      try {
        req.body.logo_url = await getLogoUrl(req.files.logo_url, req.params.slug);
        await ProjectModel.findOneAndUpdate(
          { slug: req.params.slug },
          { logo_url: req.body.logo_url }
        );
        return res.json();
      } catch (error) {
        return res.status(500).json({
          error: 'Failed to upload project logo',
        });
      }
    }
    if (req.files?.image_urls) {
      try {
        const newProjectImages = await getProjectImageUrls(req.files.image_urls, req.params.slug);
        const oldProjectData = await ProjectModel.findOne(
          { slug: req.params.slug },
          { image_urls: 1, _id: 0 }
        );
        const oldImages = oldProjectData?.image_urls;
        let oldImagesAfterDelete = oldImages;
        req.body.image_urls = [...oldImagesAfterDelete, ...newProjectImages];
        await ProjectModel.findOneAndUpdate(
          { slug: req.params.slug },
          { image_urls: req.body.image_urls }
        );
        return res.json();
      } catch (error) {
        return res.status(500).json({
          error: 'Failed to upload project Images',
        });
      }
    }
    return res.status(204).json();
  },

  editProject: async (req, res) => {
    // Validations
    const deletedImages = req.body.deleted_images;
    const oldImages = await ProjectModel.findOne({ slug: req.params.slug }, {_id: 0, image_urls: 1}).lean();
    const newImageArr = oldImages.image_urls.filter(image => {
      return !deletedImages.includes(image)
    });
    req.body.image_urls = newImageArr;
    let validatedResults = null;
    delete req.body.step;
    delete req.body.username;
    delete req.body?.deleted_images;
    delete req.body?.logo_url_files;
    delete req.body?.image_urls_files;
    try {
      validatedResults = await projectValidationSchema.edit.validateAsync(req.body);
    } catch (error) {
      return res.status(400).json({
        error: 'Validation failed',
      });
    }
    // Find and update the document
    try {
      await ProjectModel.findOneAndUpdate({ slug: req.params.slug }, validatedResults);
      return res.status(201).json({ slug: req.params.slug });
    } catch (error) {
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
      return res.status(500).json({
        error: 'Failed to delete project',
      });
    }
    return res.status(200).json();
  },

  projectShow: async (req, res) => {
    let project = null;
    let createdBy = null;
    let jobs = null;
    try {
      project = await ProjectModel.findOne({ slug: req.params.slug }, { __v: 0 }).lean();
      // Get creator
      createdBy = await UserModel.findOne(
        { _id: project.user_id },
        { username: 1, profile_pic_url: 1, _id: 0 }
      ).lean();
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
      }
      // Clean up data that does not need to be sent
      delete project._id;
      delete project.user_id;
    } catch (error) {
      res.status(500);
      return res.json({
        error: 'Failed to fetch project from database',
      });
    }
    res.status(200);
    return res.json({ project, createdBy, jobs });
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
      if (updatedRelationship) {
        return res.status(201).json();
      }
      return res.status(204).json();
    } catch (error) {
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
        return res.status(200).json();
      }
      return res.status(204).json();
    } catch (error) {
      res.status(500);
      return res.json({
        error: 'Failed to unfollow project',
      });
    }
  },
};

module.exports = controller;
