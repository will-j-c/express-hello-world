const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const UserModel = require('../models/userModel');
// const UserValidationSchema = require('../validations/userValidation');

const controller = {
  register: async (req, res) => {
    // TO DO: validation
    const validatedValues = req.body;

    // check if email in used
    try {
      const user = await UserModel.findOne({
        email: validatedValues.email,
      });
      if (user) {
        return res.status(409).json({ error: 'email in used' });
      }
    } catch (err) {
      return res.status(500).json({ error: 'failed to get user' });
    }

    return res.json();
  },

  login: async (req, res) => {
    // TO DO: validate input

    const validatedValues = req.body;
    const errMsg = 'Incorrect username or password';
    let user = null;

    try {
      user = await UserModel.findOne({ username: validatedValues.username });
      if (!user) {
        return res.status(401).json({ error: errMsg });
      }
    } catch (err) {
      return res.status(500).json({ err: 'failed to get user' });
    }

    const isPasswordCorrect = await bcrypt.compare(validatedValues.password, user.hash);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: errMsg });
    }

    const accessToken = jwt.sign(
      {
        // TO DO: change token expiry to a longer period (currently 1 hr)
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        data: { username: user.username },
      },
      process.env.JWT_SECRET_ACCESS
    );

    return res.json({ accessToken });
  },
};

module.exports = controller;
