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
    const username = req.params.username;
    try {
      const userProfile = await UserModel.findOne({ username }, { __v: 0, hash: 0 }).lean();
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
    const username = req.params.username;
    try {
      const profileOwner = await UserModel.findOne({ username }, { __v: 0, hash: 0 }).lean();
      if (!profileOwner) {
        return res.status(404).json();
      }
      const userProjects = await ProjectModel.find(
        { user_id: profileOwner._id },
        { __v: 0, _id: 0, user_id: 0 }
      ).lean();
      return res.json(userProjects);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: 'Failed to fetch projects of this user from database',
      });
    }
  },
  showUserProjectsPublic: async (req, res) => {
    const username = req.params.username;
    try {
      const profileOwner = await UserModel.findOne({ username }, { __v: 0, hash: 0 }).lean();
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
      console.log(error);
      return res.status(500).json({
        error: 'Failed to fetch public projects of this user from database',
      });
    }
  },
  showUserProjectsDraft: async (req, res) => {
    const username = req.params.username;
    try {
      const profileOwner = await UserModel.findOne({ username }, { __v: 0, hash: 0 }).lean();
      if (!profileOwner) {
        return res.status(404).json();
      }
      const userProjectsDraft = await ProjectModel.aggregate([
        { $match: { state: 'draft', user_id: profileOwner._id } },
        { $sort: { updatedAt: -1 } },
        { $project: { __v: 0, user_id: 0, _id: 0 } },
      ]);

      return res.json(userProjectsDraft);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: 'Failed to fetch draft projects of this user from database',
      });
    }
  },
  showUserProjectsApplied: async (req, res) => {
    const username = req.params.username;
    try {
      const profileOwner = await UserModel.findOne({ username }, { __v: 0, hash: 0 }).lean();
      if (!profileOwner) {
        return res.status(404).json();
      }
      const appliedJobs = await ContributorRelationshipModel.find(
        {
          user_id: profileOwner._id,
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
      console.log(error);
      return res.status(500).json({
        error: 'Failed to fetch applied projects of this user from database',
      });
    }
  },
  showUserProjectsAccepted: async (req, res) => {
    const username = req.params.username;
    try {
      const profileOwner = await UserModel.findOne({ username }, { __v: 0, hash: 0 }).lean();
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
      console.log(error);
      return res.status(500).json({
        error: 'Failed to fetch contributed projects of this user from database',
      });
    }
  },
  showUserProjectsFollowing: async (req, res) => {
    const username = req.params.username;
    try {
      const profileOwner = await UserModel.findOne({ username }, { __v: 0, hash: 0 }).lean();
      if (!profileOwner) {
        return res.status(404).json();
      }
      const followingProjectsRelationship = await ProjectsRelationshipModel.find(
        { user_id: profileOwner._id },
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
      console.log(error);
      return res.status(500).json({
        error: 'Failed to fetch contributed projects of this user from database',
      });
    }
  },

  editProfile: async (req, res) => {
    const profileOwner = await UserModel.findOne({ username: req.authUser.username });
    const user = await UserModel.findOne({ username: req.params.username });
    // authorisation check: whether user is the project owner
    if (user?._id.toString() !== profileOwner._id.toString()) {
      return res.status(401).json({
        error: 'User is not authorised to change this profile',
      });
    }
    const { name, tagline, interests, linkedin, github, twitter, facebook } = req.body;
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
      facebook: req.body.facebook,
      linkedin: req.body.linkedin,
      github: req.body.github,
      twitter: req.body.twitter,
    };
    //remove the empty attribute from socmedFormat
    const socmed = Object.fromEntries(Object.entries(socmedFormat).filter(([_, v]) => v != ''));

    //handle skills:
    const validatedSkills = req.body.skills?.filter((skill) => validSkills.includes(skill));
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
      // const skillsArr = skills
      //   ?.split(',')
      //   .map((item) => item.trim())
      //   .filter((item) => validSkills.includes(item));

      // const interestsArr = interests?.split(',').map((item) => item.trim());

      await UserModel.findOneAndUpdate(
        { username: req.params.username },
        { name, tagline, skills, interests, socmed, profile_pic_url }
      );
      return res.status(201).json();
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to edit profile',
      });
    }
  },

  showFollowingUsers: async (req, res) => {
    const username = req.params.username;
    const user = await UserModel.findOne({ username }, { __v: 0, hash: 0 }).lean();
    if (!user) {
      return res.status(404).json();
    }
    let followingUsers = null;
    try {
      followingUsers = await UsersRelationshipModel.find(
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
    const username = req.params.username;
    const user = await UserModel.findOne({ username }, { __v: 0, hash: 0 }).lean();
    if (!user) {
      return res.status(404).json();
    }
    let followerUsers = null;
    try {
      followerUsers = await UsersRelationshipModel.find(
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
    const profileOwner = await UserModel.findOne({ username: req.authUser.username });
    const user = await UserModel.findOne({ username: req.params.username });
    // authorisation check: whether user is the project owner
    if (user?._id.toString() !== profileOwner?._id.toString()) {
      return res.status(401).json({
        error: 'User is not authorised to change this project',
      });
    }

    try {
      const hostProjects = await ProjectModel.find({ user_id: profileOwner?._id }, { _id: 1 });
      if (hostProjects.length) {
        for (let i = 0, len = hostProjects.length; i < len; i += 1) {
          await ContributorModel.deleteMany({ project_id: hostProjects[i]._id });
        }
        await ProjectModel.deleteMany({ user_id: profileOwner?._id });
      }
      await UsersRelationshipModel.deleteMany({
        $or: [{ follower: profileOwner?._id }, { followee: profileOwner?._id }],
      });
      await ContributorRelationshipModel.deleteMany({ user_id: profileOwner?._id });
      await ProjectsRelationshipModel.deleteMany({ user_id: profileOwner?._id });
      await CommentModel.deleteMany({ user_id: profileOwner?._id });

      profileOwner?.deleteOne();

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
};
module.exports = controller;
