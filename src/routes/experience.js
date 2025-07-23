const express = require('express');
const { Experience, Outlet, Business, User, OutletManager } = require('../models');
const { authenticate, requireOutletManager, optionalAuth } = require('../middleware/auth');
const { validate, experienceSchemas, paramSchemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @route   GET /api/experiences
 * @desc    Get all experiences (public for users, filtered for managers)
 * @access  Public/Private
 */
router.get('/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, outlet_id, business_types, min_price, max_price, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { is_active: true };

    // Filter by outlet ID
    if (outlet_id) {
      whereClause.outlet_id = outlet_id;
    }

    // Filter by business type
    if (business_types) {
      whereClause.business_types = business_types;
    }

    // Filter by price range
    if (min_price || max_price) {
      whereClause.price_per_person = {};
      if (min_price) whereClause.price_per_person[Op.gte] = parseFloat(min_price);
      if (max_price) whereClause.price_per_person[Op.lte] = parseFloat(max_price);
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { menu_item_title: { [Op.like]: `%${search}%` } }
      ];
    }

    // For outlet managers, only show experiences for their assigned outlets
    if (req.user && req.user.role === 'outlet_manager') {
      const managerAssignments = await OutletManager.findAll({
        where: { manager_id: req.user.id, is_active: true },
        attributes: ['outlet_id']
      });
      
      const outletIds = managerAssignments.map(assignment => assignment.outlet_id);
      whereClause.outlet_id = { [Op.in]: outletIds };
    }

    const { count, rows: experiences } = await Experience.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['id', 'outlet_name', 'location', 'business_types'],
          include: [
            {
              model: Business,
              as: 'business',
              attributes: ['id', 'business_name', 'approval_status'],
              where: req.user && req.user.role !== 'super_admin' ? { approval_status: 'approved' } : undefined
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        experiences,
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
 * @route   GET /api/experiences/:id
 * @desc    Get experience by ID
 * @access  Public
 */
router.get('/:id',
  optionalAuth,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const experience = await Experience.findByPk(id, {
      include: [
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['id', 'outlet_name', 'location', 'business_types', 'operation_hours'],
          include: [
            {
              model: Business,
              as: 'business',
              attributes: ['id', 'business_name', 'approval_status', 'website_url', 'phone_number']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    if (!experience || !experience.is_active) {
      throw new AppError('Experience not found', 404);
    }

    // Check if associated business is approved (for regular users)
    if (!req.user || req.user.role === 'user') {
      if (experience.outlet.business.approval_status !== 'approved') {
        throw new AppError('Experience not found', 404);
      }
    }

    // Check permissions for outlet managers
    if (req.user && req.user.role === 'outlet_manager') {
      const isAssigned = await OutletManager.isManagerOfOutlet(req.user.id, experience.outlet_id);
      if (!isAssigned && experience.created_by !== req.user.id) {
        throw new AppError('You can only view experiences for your assigned outlets', 403);
      }
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
 * @route   POST /api/experiences
 * @desc    Create new experience (Outlet Manager only)
 * @access  Private (Outlet Manager)
 */
router.post('/',
  authenticate,
  requireOutletManager,
  validate(experienceSchemas.create),
  asyncHandler(async (req, res) => {
    const { outlet_id, business_types } = req.body;

    // Check if outlet exists
    const outlet = await Outlet.findByPk(outlet_id, {
      include: [
        {
          model: Business,
          as: 'business'
        }
      ]
    });

    if (!outlet || !outlet.is_active) {
      throw new AppError('Outlet not found', 404);
    }

    // Check if outlet manager is assigned to this outlet
    if (req.user.role === 'outlet_manager') {
      const isAssigned = await OutletManager.isManagerOfOutlet(req.user.id, outlet_id);
      if (!isAssigned && req.user.role !== 'super_admin') {
        throw new AppError('You can only add experiences to your assigned outlets', 403);
      }
    }

    // Check if business type is available in the outlet
    if (!outlet.business_types.includes(business_types)) {
      throw new AppError(`Business type '${business_types}' is not available in this outlet`, 400);
    }

    // Check if associated business is approved
    if (outlet.business.approval_status !== 'approved') {
      throw new AppError('Cannot add experiences to outlets of unapproved businesses', 400);
    }

    const experienceData = {
      ...req.body,
      created_by: req.user.id
    };

    const experience = await Experience.create(experienceData);

    // Include relations in response
    const experienceWithRelations = await Experience.findByPk(experience.id, {
      include: [
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['id', 'outlet_name', 'location', 'business_types'],
          include: [
            {
              model: Business,
              as: 'business',
              attributes: ['id', 'business_name']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Experience created successfully',
      data: {
        experience: experienceWithRelations
      }
    });
  })
);

/**
 * @route   PUT /api/experiences/:id
 * @desc    Update experience
 * @access  Private (Creator or Outlet Manager for assigned outlet)
 */
router.put('/:id',
  authenticate,
  requireOutletManager,
  validate(paramSchemas.id, 'params'),
  validate(experienceSchemas.update),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const experience = await Experience.findByPk(id, {
      include: [
        {
          model: Outlet,
          as: 'outlet'
        }
      ]
    });

    if (!experience || !experience.is_active) {
      throw new AppError('Experience not found', 404);
    }

    // Check permissions
    let hasPermission = false;
    
    if (req.user.role === 'super_admin') {
      hasPermission = true;
    } else if (experience.created_by === req.user.id) {
      hasPermission = true;
    } else if (req.user.role === 'outlet_manager') {
      hasPermission = await OutletManager.isManagerOfOutlet(req.user.id, experience.outlet_id);
    }

    if (!hasPermission) {
      throw new AppError('You can only update experiences you created or for your assigned outlets', 403);
    }

    // If business_types is being updated, validate it's available in the outlet
    if (req.body.business_types && req.body.business_types !== experience.business_types) {
      if (!experience.outlet.business_types.includes(req.body.business_types)) {
        throw new AppError(`Business type '${req.body.business_types}' is not available in this outlet`, 400);
      }
    }

    await experience.update(req.body);

    // Get updated experience with relations
    const updatedExperience = await Experience.findByPk(id, {
      include: [
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['id', 'outlet_name', 'location', 'business_types'],
          include: [
            {
              model: Business,
              as: 'business',
              attributes: ['id', 'business_name']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Experience updated successfully',
      data: {
        experience: updatedExperience
      }
    });
  })
);

/**
 * @route   DELETE /api/experiences/:id
 * @desc    Delete experience
 * @access  Private (Creator or assigned Outlet Manager)
 */
router.delete('/:id',
  authenticate,
  requireOutletManager,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const experience = await Experience.findByPk(id);
    if (!experience || !experience.is_active) {
      throw new AppError('Experience not found', 404);
    }

    // Check permissions
    let hasPermission = false;
    
    if (req.user.role === 'super_admin') {
      hasPermission = true;
    } else if (experience.created_by === req.user.id) {
      hasPermission = true;
    } else if (req.user.role === 'outlet_manager') {
      hasPermission = await OutletManager.isManagerOfOutlet(req.user.id, experience.outlet_id);
    }

    if (!hasPermission) {
      throw new AppError('You can only delete experiences you created or for your assigned outlets', 403);
    }

    // Soft delete
    await experience.update({ is_active: false });

    res.json({
      status: 'success',
      message: 'Experience deleted successfully'
    });
  })
);

/**
 * @route   GET /api/experiences/outlet/:outletId
 * @desc    Get experiences for a specific outlet
 * @access  Public
 */
router.get('/outlet/:outletId',
  optionalAuth,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { outletId } = req.params;
    const { page = 1, limit = 10, business_types } = req.query;
    const offset = (page - 1) * limit;

    // Check if outlet exists
    const outlet = await Outlet.findByPk(outletId, {
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_name', 'approval_status']
        }
      ]
    });

    if (!outlet || !outlet.is_active) {
      throw new AppError('Outlet not found', 404);
    }

    // For regular users, only show experiences of approved businesses
    if (!req.user || req.user.role === 'user') {
      if (outlet.business.approval_status !== 'approved') {
        throw new AppError('Outlet not found', 404);
      }
    }

    const whereClause = {
      outlet_id: outletId,
      is_active: true
    };

    if (business_types) {
      whereClause.business_types = business_types;
    }

    const { count, rows: experiences } = await Experience.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        outlet: {
          id: outlet.id,
          outlet_name: outlet.outlet_name,
          location: outlet.location,
          business_types: outlet.business_types
        },
        experiences,
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
 * @route   GET /api/experiences/my/experiences
 * @desc    Get current outlet manager's experiences
 * @access  Private (Outlet Manager)
 */
router.get('/my/experiences',
  authenticate,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'outlet_manager') {
      throw new AppError('Only outlet managers can access this endpoint', 403);
    }

    const { page = 1, limit = 10, outlet_id } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {
      created_by: req.user.id,
      is_active: true
    };

    // If specific outlet requested, verify access
    if (outlet_id) {
      const isAssigned = await OutletManager.isManagerOfOutlet(req.user.id, outlet_id);
      if (!isAssigned) {
        throw new AppError('You are not assigned to this outlet', 403);
      }
      whereClause.outlet_id = outlet_id;
    } else {
      // Get all outlets assigned to this manager
      const assignments = await OutletManager.findAll({
        where: { manager_id: req.user.id, is_active: true },
        attributes: ['outlet_id']
      });
      
      const outletIds = assignments.map(assignment => assignment.outlet_id);
      whereClause.outlet_id = { [Op.in]: outletIds };
    }

    const { count, rows: experiences } = await Experience.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['id', 'outlet_name', 'location', 'business_types'],
          include: [
            {
              model: Business,
              as: 'business',
              attributes: ['id', 'business_name']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        experiences,
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
 * @route   PUT /api/experiences/:id/time-slots
 * @desc    Update time slots for an experience
 * @access  Private (Creator or assigned Outlet Manager)
 */
router.put('/:id/time-slots',
  authenticate,
  requireOutletManager,
  validate(paramSchemas.id, 'params'),
  validate({
    time_slots: experienceSchemas.create.extract('time_slots')
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { time_slots } = req.body;

    const experience = await Experience.findByPk(id);
    if (!experience || !experience.is_active) {
      throw new AppError('Experience not found', 404);
    }

    // Check permissions
    let hasPermission = false;
    
    if (req.user.role === 'super_admin') {
      hasPermission = true;
    } else if (experience.created_by === req.user.id) {
      hasPermission = true;
    } else if (req.user.role === 'outlet_manager') {
      hasPermission = await OutletManager.isManagerOfOutlet(req.user.id, experience.outlet_id);
    }

    if (!hasPermission) {
      throw new AppError('You can only update time slots for experiences you manage', 403);
    }

    await experience.update({ time_slots });

    res.json({
      status: 'success',
      message: 'Time slots updated successfully',
      data: {
        experience
      }
    });
  })
);

module.exports = router; 