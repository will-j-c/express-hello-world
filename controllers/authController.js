const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const UserModel = require('../models/userModel');
const UserValidator = require('../validations/userValidation');

const controller = {
  register: async (req, res) => {
    let validatedResults = null;
    try {
      validatedResults = await UserValidator.register.validateAsync(req.body);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid input',
      });
    }

    let user = null;

    user = await UserModel.findOne({
      email: validatedResults.email,
    });
    if (user) {
      return res.status(409).json({
        error: 'An account with this email already exists',
      });
    }

    user = await UserModel.findOne({
      username: validatedResults.username,
    });
    if (user) {
      return res.status(409).json({
        error: 'Username is already in use',
      });
    }

    const hash = await bcrypt.hash(validatedResults.hash, 10);
    const { email, username } = validatedResults;

    // Generate activation token
    const activateToken = jwt.sign(
      {
        // activateToken expiring in 15 minutes
        exp: Math.floor(Date.now() / 1000) + 60 * 15,
        data: {
          email,
          username,
          hash,
        },
      },
      process.env.JWT_SECRET_ACTIVATE
    );
    // } catch (err) {
    //   return res.status(500).json({ error: 'Failed to get user' });
    // }

    // TO DO: send email to user to activate the token
    // the activation url should be sth like
    // clientURL/users/activate/${activateToken}
  },

  login: async (req, res) => {
    let validatedResults = null;
    try {
      validatedResults = await UserValidator.login.validateAsync(req.body);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid input',
      });
    }

    const errMsg = 'Incorrect username or password';
    let user = null;

    try {
      user = await UserModel.findOne({ username: validatedResults.username });
      if (!user) {
        return res.status(401).json({ error: errMsg });
      }
    } catch (err) {
      return res.status(500).json({ error: 'failed to get user' });
    }

    const isPasswordCorrect = await bcrypt.compare(validatedResults.hash, user.hash);

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
