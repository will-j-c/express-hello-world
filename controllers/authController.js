const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_APIKEY);

const UserModel = require('../models/userModel');
const UserValidator = require('../validations/userValidation');
const RefreshTokenModel = require('../models/refreshTokenModel');

const createAccessToken = (username) => {
  const accessToken = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 5,
      data: { username },
    },
    process.env.JWT_SECRET_ACCESS
  );

  return accessToken;
};

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
    const { email, username, name } = validatedResults;

    // Generate activation token
    const activateToken = jwt.sign(
      {
        // activateToken expiring in 15 minutes
        exp: Math.floor(Date.now() / 1000) + 60 * 15,
        data: {
          email,
          name,
          username,
          hash,
        },
      },
      process.env.JWT_SECRET_ACTIVATE
    );

    const message = {
      to: email,
      from: 'helloworld.sg.ga@gmail.com',
      subject: 'Please Verify Your Email',
      // TO DO: change the verification url to client side url instead
      html: `
        <h1>Welcome to HelloWorld!</h1>
        <hr/>
        <h2>Let's verify your email</h2>
        <p>https://hello-world-zmw.netlify.app/api/v1/users/${activateToken}/activate</p>
        <a href="https://hello-world-zmw.netlify.app/api/v1/users/${activateToken}/activate"
          <button>Verify</button>
        </a>
      `,
    };

    try {
      await sgMail.send(message);
      return res.json({ activateToken });
    } catch (error) {
      return res.status(500).json({
        error: 'Unable to send activation email',
      });
    }
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

    const accessToken = createAccessToken(user.username);

    const refreshToken = jwt.sign(
      {
        // Refresh token expiring in 1 hr
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        data: { username: user.username },
      },
      process.env.JWT_SECRET_REFRESH
    );

    // store refresh token in database
    await RefreshTokenModel.create({
      token: refreshToken,
    });

    return res.json({ accessToken, refreshToken });
  },

  refresh: async (req, res) => {
    try {
      // get the refresh token from request body
      const { refreshToken } = req.body;
      const token = await RefreshTokenModel.findOne({ token: refreshToken });
      if (!token) {
        return res.status(401).json({
          error: 'Unable to verify refresh token',
        });
      }

      const verified = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
      if (verified) {
        // create new accessToken if refreshToken is verified
        const accessToken = createAccessToken(verified.data.username);

        return res.json({ accessToken });
      }

      return res.json({ accessToken: 'abcd' });
    } catch (err) {
      return res.status(401).json({
        error: 'Unable to verify refresh token',
      });
    }
  },

  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      await RefreshTokenModel.findOneAndDelete({ token: refreshToken });
      return res.json({
        message: 'Refresh Token deleted successfully',
      });
    } catch (err) {
      return res.status(409).json({
        error: 'Unable to remove refresh token',
      });
    }
  },
};

module.exports = controller;
