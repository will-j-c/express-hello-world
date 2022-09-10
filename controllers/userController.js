const UserModel = require('../models/userModel');
const ProjectModel = require('../models/projectModel');
const UsersRelationshipModel = require('../models/usersRelationship');

const controller = {
  showAllUsers: async (req, res) => {
    let users = [];
    try {
      users = await UserModel.aggregate([
        { $match: {} },
        { $sort: { updatedAt: -1 } },
        { $project: { hash: 0 } },
      ]);
      console.log(users);
      res.status(200);
      return res.json(users);
    } catch (error) {
      res.status(500);
      return res.json({
        error: 'Failed to fetch users from database',
      });
    }
  },
  //TODO: Considering about AuthUser , who is not profileOwner
  showProfile: async (req, res) => {
    const username = req.params.username;
    try {
      const profileOwner = await UserModel.findOne({ username }, { __v: 0, hash: 0 }).lean();
      if (!profileOwner) {
        return res.status(404).json();
      }
      const projects = await await ProjectModel.findOne(
        { user_id: profileOwner._id },
        { __v: 0, _id: 0 }
      ).lean();
      res.status(200);
      return res.json({ profileOwner, projects });
    } catch (error) {
      res.status(500);
      return res.json({
        error: 'Failed to fetch user by username from database',
      });
    }
  },
  showFollowingUsers: async (req, res) => {
    const username = req.params;
    const user = await UserModel.findOne({ username }).exec();
    console.log(user);
    // const followingUsers = [];
    // try {
    //   followingUsers = await UsersRelationshipModel.aggregate([
    //     { $match: { follower: username } },
    //     { $sort: { updatedAt: -1 } },
    //   ]);
    //   res.status(200);
    //   return res.json(followingUsers);
    // } catch (error) {
    //   res.status(500);
    //   return res.json({
    //     error: 'Failed to fetch followingUsers from database',
    //   });
    // }
  },
  showFollowerUsers: async (req, res) => {},
  addFollowUser: async (req, res) => {},
  unfollowUser: async (req, res) => {},
  deleteAccount: async (req, res) => {},
};
module.exports = controller;
