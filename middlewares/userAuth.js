const jwt = require('jsonwebtoken');

const userAuth = {
  isAuthenticated: (req, res, next) => {
    const authHeader = req.header('Authorisation');
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authentication details empty',
      });
    }
    if (authHeader.slice(0, 7) !== 'Bearer ') {
      return res.status(401).json({
        error: 'Invalid authentication type',
      });
    }
    const token = authHeader.slice(7);
    if (token.length === 0) {
      return res.status(401).json({
        error: 'Invalid authentication token',
      });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET_ACCESS);

    if (verified) {
      req.authUser = verified.data;
      return next();
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
