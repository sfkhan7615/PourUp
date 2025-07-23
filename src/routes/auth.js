const express = require('express');
const { User } = require('../models');
const { generateAccessToken } = require('../utils/jwt');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');
const { validate, userSchemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Super Admin only)
 * @access  Private (Super Admin)
 */
router.post('/register', 
  authenticate,
  requireSuperAdmin,
  validate(userSchemas.register),
  asyncHandler(async (req, res) => {
    const { first_name, last_name, email, password, date_of_birth, phone_number, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Create user
    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
      date_of_birth,
      phone_number,
      role,
      created_by: req.user.id,
      email_verified: true // Auto-verify for admin-created users
    });

    // Generate token
    const token = generateAccessToken(user);

    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });
  })
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  validate(userSchemas.login),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate token
    const token = generateAccessToken(user);

    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  })
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({
      status: 'success',
      message: 'Logout successful'
    });
  })
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me',
  authenticate,
  asyncHandler(async (req, res) => {
    // Remove password from response
    const userResponse = { ...req.user.toJSON() };
    delete userResponse.password;

    res.json({
      status: 'success',
      data: {
        user: userResponse
      }
    });
  })
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  authenticate,
  validate(userSchemas.updateProfile || userSchemas.register),
  asyncHandler(async (req, res) => {
    const { first_name, last_name, phone_number, date_of_birth } = req.body;

    // Update user profile
    await req.user.update({
      first_name: first_name || req.user.first_name,
      last_name: last_name || req.user.last_name,
      phone_number: phone_number || req.user.phone_number,
      date_of_birth: date_of_birth || req.user.date_of_birth
    });

    // Remove password from response
    const userResponse = { ...req.user.toJSON() };
    delete userResponse.password;

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: userResponse
      }
    });
  })
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password',
  authenticate,
  validate({
    current_password: userSchemas.login.extract('password'),
    new_password: userSchemas.register.extract('password'),
    confirm_password: userSchemas.register.extract('confirm_password')
  }),
  asyncHandler(async (req, res) => {
    const { current_password, new_password } = req.body;

    // Validate current password
    const isCurrentPasswordValid = await req.user.validatePassword(current_password);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Update password
    await req.user.update({ password: new_password });

    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });
  })
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh',
  authenticate,
  asyncHandler(async (req, res) => {
    // Generate new token
    const token = generateAccessToken(req.user);

    res.json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        token
      }
    });
  })
);

module.exports = router; 