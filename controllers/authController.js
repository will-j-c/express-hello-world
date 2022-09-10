const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const UserModel = require('../models/userModel');
// const UserValidationSchema = require('../validations/userValidation');

const controller = {
  register: async (req, res) => {
    // TO DO: validation
    const validatedValues = req.body;

    let user = null;

    // check if email in used
    try {
      user = await UserModel.findOne({
        email: validatedValues.email,
      });
      if (user) {
        return res.status(409).json({
          error: 'An account with this email already exists',
        });
      }

      user = await UserModel.findOne({
        username: validatedValues.username,
      });
      if (user) {
        return res.status(409).json({
          error: 'Username is already in use',
        });
      }

      const hash = await bcrypt.hash(validatedResults.password, 10);

      // Generate token
      const activateToken = jwt.sign(
        {
          // activateToken expiring in 15 minutes
          exp: Math.floor(Date.now() / 1000) + 60 * 15,
          data: {
            email: validatedValues.email,
            username: validatedValues.username,
            hash,
          },
        },
        process.env.JWT_SECRET_ACTIVATE
      );
    } catch (err) {
      return res.status(500).json({ error: 'Failed to get user' });
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
      return res.status(500).json({ error: 'failed to get user' });
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
