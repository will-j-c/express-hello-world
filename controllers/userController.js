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
};
module.exports = controller;
