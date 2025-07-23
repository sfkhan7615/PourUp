const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { User } = require('../models');

/**
 * Authentication middleware - Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Find user in database
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token or user not found'
      });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Attach user to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: error.message || 'Authentication failed'
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} allowedRoles - Array of roles that can access the route
 * @returns {Function} Middleware function
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions to access this resource'
      });
    }

    next();
  };
};

/**
 * Super Admin authorization middleware
 */
const requireSuperAdmin = authorize(['super_admin']);

/**
 * Winery Admin authorization middleware
 */
const requireWineryAdmin = authorize(['super_admin', 'winery_admin']);

/**
 * Outlet Manager authorization middleware
 */
const requireOutletManager = authorize(['super_admin', 'winery_admin', 'outlet_manager']);

/**
 * Any authenticated user authorization middleware
 */
const requireAuth = authorize(['super_admin', 'winery_admin', 'outlet_manager', 'user']);

/**
 * Check if user owns the resource or has appropriate permissions
 * @param {String} resourceField - Field name in the resource that contains the owner ID
 * @returns {Function} Middleware function
 */
const requireOwnershipOrAdmin = (resourceField = 'created_by') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Super admins can access everything
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Check if user owns the resource (will be validated in the route handler)
    req.ownershipField = resourceField;
    next();
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.id);
      
      if (user && user.is_active) {
        req.user = user;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  requireSuperAdmin,
  requireWineryAdmin,
  requireOutletManager,
  requireAuth,
  requireOwnershipOrAdmin,
  optionalAuth
}; 