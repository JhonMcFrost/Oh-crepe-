const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Invalid token',
      message: 'Token is not valid'
    });
  }
};

// Authorization middleware factory
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Check if user is customer
const isCustomer = authorizeRoles('customer');

// Check if user is staff or admin
const isStaffOrAdmin = authorizeRoles('staff', 'admin');

// Check if user is admin
const isAdmin = authorizeRoles('admin');

module.exports = {
  authenticateToken,
  authorizeRoles,
  isCustomer,
  isStaffOrAdmin,
  isAdmin
};