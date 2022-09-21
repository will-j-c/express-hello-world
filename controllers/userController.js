const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const ProjectModel = require('../models/projectModel');
const UsersRelationshipModel = require('../models/usersRelationship');
const ProjectsRelationshipModel = require('../models/projectsRelationship');
const ContributorRelationshipModel = require('../models/contributorsRelationship');
const ContributorModel = require('../models/contributorModel');
const CommentModel = require('../models/commentModel');
const validator = require('../validations/userValidation');
const validSkills = require('../seeds/predefined-data/skills.json');
const { profile } = require('../validations/userValidation');
const ImageKit = require('imagekit');

const imageKit = new ImageKit({
  publicKey: 'public_QbELL12FWyFW2r8fpAWMLY2t6j0=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: 'https://ik.imagekit.io/wu6yrdrjf/',
});

const controller = {
  showAllUsers: async (req, res) => {
    try {
      const users = await UserModel.aggregate([
        { $match: {} },
        { $sort: { updatedAt: -1 } },
        { $project: { hash: 0 } },
      ]);
      return res.json(users);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch users from database',
      });
    }
  },

  showUserProfile: async (req, res) => {
    try {
      const userProfile = await UserModel.findOne(
        { username: req.params.username },
        { __v: 0, hash: 0 }
      ).lean();
      if (!userProfile) {
        return res.status(404).json();
      }

      return res.json(userProfile);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch user by username from database',
      });
    }
  },

  showUserProjects: async (req, res) => {
    try {
      const profileOwner = await UserModel.findOne(
        { username: req.params.username },
        { __v: 0, hash: 0 }
      ).lean();
      if (!profileOwner) {
        return res.status(404).json();
      }
      const userProjects = await ProjectModel.find(
        { user_id: profileOwner._id },
        { __v: 0, _id: 0, user_id: 0 }
      ).lean();
      return res.json(userProjects);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch projects of this user from database',
      });
    }
  },

  showUserProjectsPublic: async (req, res) => {
    try {
      const profileOwner = await UserModel.findOne(
        { username: req.params.username },
        { __v: 0, hash: 0 }
      ).lean();
      if (!profileOwner) {
        return res.status(404).json();
      }
      const userProjectsPublic = await ProjectModel.aggregate([
        { $match: { state: 'published', user_id: profileOwner._id } },
        { $sort: { updatedAt: -1 } },
        { $project: { __v: 0, user_id: 0, _id: 0 } },
      ]);

      return res.json(userProjectsPublic);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch public projects of this user from database',
      });
    }
  },

  showUserProjectsApplied: async (req, res) => {
    try {
      const appliedJobs = await ContributorRelationshipModel.find(
        {
          user_id: req.userID,
          state: 'applied',
        },
        { contributor_id: 1, _id: 0 }
      )
        .populate({
          path: 'contributor_id',
          select: 'project_id -_id',
          populate: { path: 'project_id', select: '-__v -user_id -_id' },
        })
        .lean();
      const userProjectApplied = [];
      for (let i = 0, len = appliedJobs.length; i < len; i++) {
        userProjectApplied[i] = appliedJobs[i]?.contributor_id?.project_id;
      }

      return res.json(userProjectApplied);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch applied projects of this user from database',
      });
    }
  },

  showUserProjectsAccepted: async (req, res) => {
    try {
      const profileOwner = await UserModel.findOne(
        { username: req.params.username },
        { __v: 0, hash: 0 }
      ).lean();
      if (!profileOwner) {
        return res.status(404).json();
      }
      const jobsAccepted = await ContributorRelationshipModel.find(
        {
          user_id: profileOwner._id,
          state: 'accepted',
        },
        { contributor_id: 1, _id: 0 }
      )
        .populate({
          path: 'contributor_id',
          select: 'project_id -_id',
          populate: { path: 'project_id', select: '-__v -user_id -_id' },
        })
        .lean();
      const userProjectsAccepted = [];
      for (let i = 0, len = jobsAccepted?.length; i < len; i++) {
        userProjectsAccepted[i] = jobsAccepted[i]?.contributor_id?.project_id;
      }

      return res.json(userProjectsAccepted);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch contributed projects of this user from database',
      });
    }
  },

  showUserProjectsFollowing: async (req, res) => {
    try {
      const followingProjectsRelationship = await ProjectsRelationshipModel.find(
        { user_id: req.userID },
        { project_id: 1, _id: 0 }
      )
        .lean()
        .populate({ path: 'project_id', select: '-__v -_id -user_id' });
      const projectsUserFollowing = [];
      for (let i = 0, len = followingProjectsRelationship.length; i < len; i++) {
        projectsUserFollowing[i] = followingProjectsRelationship[i]?.project_id;
      }

      return res.json(projectsUserFollowing);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch contributed projects of this user from database',
      });
    }
  },

  editProfile: async (req, res) => {
    const { name, tagline, linkedin, github, twitter, facebook, about } = req.body;
    const file = req.file;

    if (file) {
      try {
        const result = await imageKit.upload({
          file: file.buffer,
          fileName: `${req.authUser.username}-${Date.now()}`,
          folder: `helloworld/user-avatar`,
        });
        req.body[`profile_pic_url`] =
          result.url || 'https://i.pinimg.com/564x/a9/d6/7e/a9d67e7c7c1f738141b3d728c31b2dd8.jpg';
      } catch (error) {
        return res.status(401).json({
          error: 'Failed to upload profile Images',
        });
      }
    }
    const profile_pic_url = req.body['profile_pic_url'];
    const socmedFormat = {
      facebook,
      linkedin,
      github,
      twitter,
    };
    //remove the empty attribute from socmedFormat
    const socmed = Object.fromEntries(Object.entries(socmedFormat).filter(([_, v]) => !!v));
    //handle skills:
    const skillsArr = JSON.parse(req.body.skills);

    let validatedSkills = [];
    if (skillsArr.length) {
      validatedSkills = skillsArr?.filter((skill) => validSkills.includes(skill));
    }
    const interests = JSON.parse(req.body.interests);

    const skills = validatedSkills;
    try {
      await validator.profile.validateAsync({
        name,
        tagline,
        skills,
        interests,
        socmed,
        profile_pic_url,
        skills,
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid input',
      });
    }
    try {
      await UserModel.findOneAndUpdate(
        { username: req.params.username },
        { name, tagline, skills, interests, socmed, profile_pic_url, about }
      );
      return res.status(201).json();
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to edit profile',
      });
    }
  },

  showFollowingUsers: async (req, res) => {
    const user = await UserModel.findOne(
      { username: req.params.username },
      { __v: 0, hash: 0 }
    ).lean();
    if (!user) {
      return res.status(404).json();
    }

    try {
      const followingUsers = await UsersRelationshipModel.find(
        { follower: user._id },
        { followee: 1 }
      ).populate({ path: 'followee', select: '-email -__v -hash' });
      return res.json(followingUsers);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch followingUsers from database',
      });
    }
  },

  showFollowerUsers: async (req, res) => {
    const user = await UserModel.findOne(
      { username: req.params.username },
      { __v: 0, hash: 0 }
    ).lean();
    if (!user) {
      return res.status(404).json();
    }

    try {
      const followerUsers = await UsersRelationshipModel.find(
        { followee: user._id },
        { follower: 1 }
      ).populate({ path: 'follower', select: '-email -__v -hash' });
      return res.json(followerUsers);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch followingUsers from database',
      });
    }
  },

  followUser: async (req, res) => {
    try {
      const followee = await UserModel.findOne(
        { username: req.params.username },
        { _id: 1 }
      ).lean();
      const follower = await UserModel.findOne(
        { username: req.authUser.username },
        { _id: 1 }
      ).lean();

      const updatedRelationship = await UsersRelationshipModel.findOneAndUpdate(
        { follower: follower._id, followee: followee._id },
        {},
        { upsert: true, new: true }
      );
      if (updatedRelationship) {
        return res.status(201).json();
      }
      return res.status(204).json();
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to follow User',
      });
    }
  },

  unfollowUser: async (req, res) => {
    try {
      const followee = await UserModel.findOne(
        { username: req.params.username },
        { _id: 1 }
      ).lean();
      const follower = await UserModel.findOne(
        { username: req.authUser.username },
        { _id: 1 }
      ).lean();
      const response = await UsersRelationshipModel.findOneAndDelete({
        follower: follower._id,
        followee: followee._id,
      });
      if (response?.deletedCount) {
        return res.status(205).json();
      }
      return res.status(204).json();
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to unfollow User',
      });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      const user = await UserModel.findById(req.userID);
      const user_id = user._id;
      const hostProjects = await ProjectModel.find({ user_id }, { _id: 1 });
      if (hostProjects.length) {
        for (let i = 0, len = hostProjects.length; i < len; i += 1) {
          await ContributorModel.deleteMany({ project_id: hostProjects[i]._id });
        }
        await ProjectModel.deleteMany({ user_id });
      }
      await UsersRelationshipModel.deleteMany({
        $or: [{ follower: user_id }, { followee: user_id }],
      });
      await ContributorRelationshipModel.deleteMany({ user_id });
      await ProjectsRelationshipModel.deleteMany({ user_id });
      await CommentModel.deleteMany({ user_id });

      user.deleteOne();

      return res.status(200).json();
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to delete account',
      });
    }
  },

  activateAccount: async (req, res) => {
    const { token } = req.params;
    const verified = jwt.verify(token, process.env.JWT_SECRET_ACTIVATE);

    if (!verified) {
      return res.status(401).json({
        error: 'Activation link expired',
      });
    }

    try {
      const user = await UserModel.create(verified.data);
      return res.json({ user });
    } catch (error) {
      return res.status(401).json({
        error: 'Failed to activate user account',
      });
    }
  },

  showApplications: async (req, res) => {
    try {
      const user = await UserModel.findOne({ username: req.params.username });
      const user_id = user._id;
      const applications = await ContributorRelationshipModel.find(
        { user_id },
        { __v: 0, user_id: 0, _id: 0 }
      ).populate({
        path: 'contributor_id',
        select: '-__v',
        populate: {
          path: 'project_id',
          select: '-_id slug title',
        },
      });
      return res.json(applications);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch data',
      });
    }
  },
};
module.exports = controller;
