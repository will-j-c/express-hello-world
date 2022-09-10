const jwt = require('jsonwebtoken');

const userAuth = {
  isAuthenticated: (req, res, next) => {
    const authzHeader = req.header('Authorization');
    if (!authzHeader) {
      return res.status(401).json({
        message: 'Authentication details empty',
      });
    }
    if (authzHeader.slice(0, 7) !== 'Bearer ') {
      return res.status(401).json({
        message: 'Invalid authentication type',
      });
    }
    const token = authzHeader.slice(7);
    if (token.length === 0) {
      return res.status(401).json({
        message: 'Invalid authentication token',
      });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET_ACCESS);

    if (verified) {
      res.locals.userAuth = verified;
      next();
      // eslint-disable-next-line consistent-return
      return;
    }

    return res.status(401).json({
      message: 'Invalid authentication token',
    });
  },

  isAuthorised: (req, res, next) => {
    // TO DO: check if user is authorized
    next();
  },
};

module.exports = userAuth;
