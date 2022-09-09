const UserModel = require('../models/userModel');
const UserValidationSchema = require('../validations/userValidation');

const controller = {
  showAllUsers: async (req, res) => {
    let users = [];
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
};
module.exports = controller;
