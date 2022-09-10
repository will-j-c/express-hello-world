const UserModel = require('../models/userModel');
const UsersRelationshipModel = require('../models/usersRelationship');
const UserValidationSchema = require('../validations/userValidation');

const controller = {
  showAllUsers: async (req, res) => {
    const users = [];
    try {
      users = await UserModel.aggregate([{ $match: {} }, { $sort: { updatedAt: -1 } }]);
    } catch (error) {
      res.status(500);
      return res.json({
        error: 'Failed to fetch users from database',
      });
    }
    res.status(200);
    return res.json(users);
  },
  showUsername: async (req, res) => {
    const username = req.params.username;
    try {
      const user = await UserModel.findOne({ username }).exec();
      console.log(user);
      if (!user) {
        return res.status(404).json();
      }
      res.status(200);
      return res.json(user);
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
