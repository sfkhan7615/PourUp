const express = require('express');
const { Op } = require('sequelize');
const { User, Outlet, Experience, Business, Booking, sequelize } = require('../models');
const { generateAccessToken } = require('../utils/jwt');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, websiteSchemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { format } = require('date-fns');

const router = express.Router();

/**
 * @route   POST /api/website/auth/signup
 * @desc    User signup for website
 * @access  Public
 */
router.post('/auth/signup',
  validate(websiteSchemas.signup),
  asyncHandler(async (req, res) => {
    const { first_name, last_name, email, password, date_of_birth } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    // Create user with 'user' role
    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
      date_of_birth,
      role: 'user',
      is_active: true,
      email_verified: true // No email verification required for now
    });

    // Generate token
    const token = generateAccessToken(user);

    // Remove password from response
    const userResponse = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      date_of_birth: user.date_of_birth,
      location: user.location,
      created_at: user.createdAt
    };

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
 * @route   POST /api/website/auth/login
 * @desc    User login for website
 * @access  Public
 */
router.post('/auth/login',
  validate(websiteSchemas.login),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user with email
    const user = await User.findOne({ where: { email, is_active: true } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateAccessToken(user);

    // Update last login
    await user.update({ last_login: new Date() });

    // Remove password from response
    const userResponse = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      date_of_birth: user.date_of_birth,
      location: user.location,
      last_login: user.last_login
    };

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
 * @route   PUT /api/website/user/location
 * @desc    Update user location
 * @access  Private (User)
 */
router.put('/user/location',
  authenticate,
  validate(websiteSchemas.updateLocation),
  asyncHandler(async (req, res) => {
    const { location } = req.body;

    await req.user.update({ location });

    res.json({
      status: 'success',
      message: 'Location updated successfully',
      data: {
        user: {
          id: req.user.id,
          location: req.user.location
        }
      }
    });
  })
);

/**
 * @route   GET /api/website/outlets
 * @desc    Get outlets for website with filters
 * @access  Public
 */
router.get('/outlets',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { location, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = { is_active: true };
    
    if (location) {
      whereClause.location = { [Op.like]: `%${location}%` };
    }

    if (search) {
      whereClause.outlet_name = { [Op.like]: `%${search}%` };
    }

    const { rows: outlets, count } = await Outlet.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['business_name', 'description'],
          where: { approval_status: 'approved', is_active: true }
        },
        {
          model: Experience,
          as: 'experiences',
          attributes: ['id', 'title', 'price_per_person', 'images'],
          where: { is_active: true },
          required: false,
          limit: 3 // Show preview of experiences
        }
      ],
      order: [['outlet_name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        outlets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  })
);

/**
 * @route   GET /api/website/outlets/:id
 * @desc    Get outlet details with experiences
 * @access  Public
 */
router.get('/outlets/:id',
  validate(websiteSchemas.outletId, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const outlet = await Outlet.findByPk(id, {
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['business_name', 'description', 'website_url']
        },
        {
          model: Experience,
          as: 'experiences',
          attributes: [
            'id', 'title', 'business_types', 'price_per_person', 
            'description', 'images', 'menu_item_title', 'time_slots'
          ]
        }
      ]
    });

    if (!outlet) {
      throw new AppError('Outlet not found', 404);
    }

    res.json({
      status: 'success',
      data: {
        outlet
      }
    });
  })
);

/**
 * @route   GET /api/website/experiences/:id
 * @desc    Get experience details
 * @access  Public
 */
router.get('/experiences/:id',
  validate(websiteSchemas.experienceId, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const experience = await Experience.findByPk(id, {
      include: [
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['id', 'outlet_name', 'location', 'operation_hours'],
          include: [
            {
              model: Business,
              as: 'business',
              attributes: ['business_name']
            }
          ]
        }
      ]
    });

    if (!experience) {
      throw new AppError('Experience not found', 404);
    }

    res.json({
      status: 'success',
      data: {
        experience
      }
    });
  })
);

/**
 * @route   POST /api/website/bookings
 * @desc    Create a booking
 * @access  Private (User)
 */
router.post('/bookings',
  authenticate,
  validate(websiteSchemas.createBooking),
  asyncHandler(async (req, res) => {
    const { experience_id, party_size, booking_date, booking_time, special_requests } = req.body;

    // Get experience and outlet details
    const experience = await Experience.findByPk(experience_id, {
      include: [
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['id', 'outlet_name', 'operation_hours']
        }
      ]
    });

    if (!experience) {
      throw new AppError('Experience not found', 404);
    }

    // Validate booking date and time
    const bookingDateObj = new Date(booking_date);
    const dayOfWeek = format(bookingDateObj, 'EEEE').toLowerCase();

    // Check if outlet is open on this day
    const operationDay = experience.outlet.operation_hours[dayOfWeek];

    if (!operationDay || operationDay.is_closed) {
      throw new AppError('Outlet is closed on the selected date', 400);
    }

    // Check if booking time is within operation hours
    if (booking_time < operationDay.start_time || booking_time > operationDay.end_time) {
      throw new AppError('Booking time is outside operation hours', 400);
    }

    // Check if time slot is available in experience
    const availableSlot = experience.time_slots.find(slot => 
      slot.start_time <= booking_time && 
      slot.end_time >= booking_time && 
      slot.is_available &&
      slot.max_party_size >= party_size
    );

    if (!availableSlot) {
      throw new AppError('No available time slot for the selected time and party size', 400);
    }

    // Calculate total price
    const total_price = experience.price_per_person * party_size;

    // Create booking
    const booking = await Booking.create({
      user_id: req.user.id,
      experience_id,
      outlet_id: experience.outlet.id,
      party_size,
      booking_date,
      booking_time,
      total_price,
      special_requests
    });

    // Generate confirmation code
    booking.generateConfirmationCode();
    await booking.save();

    // Load booking with relations
    const bookingWithDetails = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Experience,
          as: 'experience',
          attributes: ['title', 'price_per_person']
        },
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['outlet_name', 'location']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: {
        booking: bookingWithDetails
      }
    });
  })
);

/**
 * @route   GET /api/website/bookings
 * @desc    Get user bookings
 * @access  Private (User)
 */
router.get('/bookings',
  authenticate,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const { rows: bookings, count } = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Experience,
          as: 'experience',
          attributes: ['title', 'business_types', 'price_per_person']
        },
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['outlet_name', 'location']
        }
      ],
      order: [['booking_date', 'DESC'], ['booking_time', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  })
);

/**
 * @route   PUT /api/website/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private (User)
 */
router.put('/bookings/:id/cancel',
  authenticate,
  validate(websiteSchemas.bookingId, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const booking = await Booking.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (!booking.canBeCancelled()) {
      throw new AppError('Booking cannot be cancelled at this time', 400);
    }

    await booking.update({ status: 'cancelled' });

    res.json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: {
        booking
      }
    });
  })
);

module.exports = router; 