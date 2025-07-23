const express = require('express');
const { Outlet, Business, User, OutletManager, Experience } = require('../models');
const { authenticate, requireWineryAdmin, optionalAuth } = require('../middleware/auth');
const { validate, outletSchemas, paramSchemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @route   GET /api/outlets
 * @desc    Get all outlets (public for users, filtered for admins)
 * @access  Public/Private
 */
router.get('/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, business_id, business_types, search, location } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { is_active: true };

    // Filter by business ID
    if (business_id) {
      whereClause.business_id = business_id;
    }

    // Filter by business type
    if (business_types) {
      whereClause.business_types = {
        [Op.contains]: [business_types]
      };
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { outlet_name: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
        { ava_location: { [Op.like]: `%${search}%` } }
      ];
    }

    // Location filter
    if (location) {
      whereClause.location = { [Op.like]: `%${location}%` };
    }

    // For winery admins, only show their own outlets
    if (req.user && req.user.role === 'winery_admin') {
      whereClause.created_by = req.user.id;
    }

    // For outlet managers, only show their assigned outlets
    if (req.user && req.user.role === 'outlet_manager') {
      const assignments = await OutletManager.findAll({
        where: { 
          manager_id: req.user.id,
          is_active: true
        },
        attributes: ['outlet_id']
      });
      whereClause.id = {
        [Op.in]: assignments.map(a => a.outlet_id)
      };
    }

    const { count, rows: outlets } = await Outlet.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_name', 'approval_status'],
          where: req.user && req.user.role !== 'super_admin' ? { approval_status: 'approved' } : undefined
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Experience,
          as: 'experiences',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'title', 'business_types', 'price_per_person']
        },
        {
          model: OutletManager,
          as: 'outletManagements',
          where: { is_active: true },
          required: false,
          include: [
            {
              model: User,
              as: 'manager',
              attributes: ['id', 'first_name', 'last_name', 'email']
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
 * @route   GET /api/outlets/:id
 * @desc    Get outlet by ID
 * @access  Public
 */
router.get('/:id',
  optionalAuth,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const outlet = await Outlet.findByPk(id, {
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_name', 'approval_status', 'website_url', 'phone_number']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Experience,
          as: 'experiences',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'title', 'business_types', 'price_per_person', 'description', 'images']
        },
        {
          model: OutletManager,
          as: 'outletManagements',
          where: { is_active: true },
          required: false,
          include: [
            {
              model: User,
              as: 'manager',
              attributes: ['id', 'first_name', 'last_name', 'email']
            }
          ]
        }
      ]
    });

    if (!outlet || !outlet.is_active) {
      throw new AppError('Outlet not found', 404);
    }

    // Check if associated business is approved (for regular users)
    if (!req.user || req.user.role === 'user') {
      if (outlet.business.approval_status !== 'approved') {
        throw new AppError('Outlet not found', 404);
      }
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
 * @route   POST /api/outlets
 * @desc    Create new outlet (Winery Admin only)
 * @access  Private (Winery Admin)
 */
router.post('/',
  authenticate,
  requireWineryAdmin,
  validate(outletSchemas.create),
  asyncHandler(async (req, res) => {
    const { business_id } = req.body;

    // Check if business exists and user has permission
    const business = await Business.findByPk(business_id);
    if (!business || !business.is_active) {
      throw new AppError('Business not found', 404);
    }

    // Check if user owns this business (unless super admin)
    if (req.user.role !== 'super_admin' && business.created_by !== req.user.id) {
      throw new AppError('You can only add outlets to your own businesses', 403);
    }

    // Check if business is approved
    if (business.approval_status !== 'approved') {
      throw new AppError('Business must be approved before adding outlets', 400);
    }

    const outletData = {
      ...req.body,
      created_by: req.user.id
    };

    const outlet = await Outlet.create(outletData);

    // Include relations in response
    const outletWithRelations = await Outlet.findByPk(outlet.id, {
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_name', 'approval_status']
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
      message: 'Outlet created successfully',
      data: {
        outlet: outletWithRelations
      }
    });
  })
);

/**
 * @route   PUT /api/outlets/:id
 * @desc    Update outlet
 * @access  Private (Owner, Super Admin, or Assigned Outlet Manager)
 */
router.put('/:id',
  authenticate,
  validate(paramSchemas.id, 'params'),
  validate(outletSchemas.update),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const outlet = await Outlet.findByPk(id, {
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

    // Check permissions
    let hasPermission = false;

    if (req.user.role === 'super_admin') {
      hasPermission = true;
    } else if (req.user.role === 'winery_admin' && outlet.created_by === req.user.id) {
      hasPermission = true;
    } else if (req.user.role === 'outlet_manager') {
      // Check if the user is assigned as a manager to this outlet
      const isAssigned = await OutletManager.findOne({
        where: {
          outlet_id: id,
          manager_id: req.user.id,
          is_active: true
        }
      });
      hasPermission = !!isAssigned;
    }

    if (!hasPermission) {
      throw new AppError('You do not have permission to update this outlet', 403);
    }

    // For outlet managers, restrict which fields they can update
    let updateData = req.body;
    if (req.user.role === 'outlet_manager') {
      // Only allow updating specific fields
      const allowedFields = [
        'outlet_name',
        'location',
        'ava_location',
        'instagram_url',
        'facebook_url',
        'linkedin_url',
        'operation_hours',
        'amenities',
        'atmosphere',
        'images'
      ];
      updateData = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});
    }

    await outlet.update(updateData);

    // Get updated outlet with relations
    const updatedOutlet = await Outlet.findByPk(id, {
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_name', 'approval_status']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Experience,
          as: 'experiences',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'title', 'business_types', 'price_per_person']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Outlet updated successfully',
      data: {
        outlet: updatedOutlet
      }
    });
  })
);

/**
 * @route   DELETE /api/outlets/:id
 * @desc    Delete outlet (Super Admin or Owner)
 * @access  Private
 */
router.delete('/:id',
  authenticate,
  requireWineryAdmin,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const outlet = await Outlet.findByPk(id);
    if (!outlet || !outlet.is_active) {
      throw new AppError('Outlet not found', 404);
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && outlet.created_by !== req.user.id) {
      throw new AppError('You can only delete your own outlets', 403);
    }

    // Soft delete
    await outlet.update({ is_active: false });

    // Also deactivate associated experiences and outlet manager assignments
    await Experience.update(
      { is_active: false },
      { where: { outlet_id: id } }
    );

    await OutletManager.update(
      { is_active: false },
      { where: { outlet_id: id } }
    );

    res.json({
      status: 'success',
      message: 'Outlet deleted successfully'
    });
  })
);

/**
 * @route   GET /api/outlets/business/:businessId
 * @desc    Get outlets for a specific business
 * @access  Public
 */
router.get('/business/:businessId',
  optionalAuth,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Check if business exists
    const business = await Business.findByPk(businessId);
    if (!business || !business.is_active) {
      throw new AppError('Business not found', 404);
    }

    // For regular users, only show outlets of approved businesses
    if (!req.user || req.user.role === 'user') {
      if (business.approval_status !== 'approved') {
        throw new AppError('Business not found', 404);
      }
    }

    const { count, rows: outlets } = await Outlet.findAndCountAll({
      where: {
        business_id: businessId,
        is_active: true
      },
      include: [
        {
          model: Experience,
          as: 'experiences',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'title', 'business_types', 'price_per_person']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        business: {
          id: business.id,
          business_name: business.business_name,
          approval_status: business.approval_status
        },
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
 * @route   GET /api/outlets/my/outlets
 * @desc    Get current user's outlets
 * @access  Private (Winery Admin)
 */
router.get('/my/outlets',
  authenticate,
  requireWineryAdmin,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, business_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      created_by: req.user.id,
      is_active: true
    };

    if (business_id) {
      // Verify user owns the business
      const business = await Business.findByPk(business_id);
      if (!business || business.created_by !== req.user.id) {
        throw new AppError('Business not found', 404);
      }
      whereClause.business_id = business_id;
    }

    const { count, rows: outlets } = await Outlet.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_name', 'approval_status']
        },
        {
          model: Experience,
          as: 'experiences',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'title', 'business_types']
        },
        {
          model: OutletManager,
          as: 'outletManagements',
          where: { is_active: true },
          required: false,
          include: [
            {
              model: User,
              as: 'manager',
              attributes: ['id', 'first_name', 'last_name', 'email']
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
 * @route   GET /api/outlets/manager/assigned
 * @desc    Get outlets assigned to current outlet manager
 * @access  Private (Outlet Manager)
 */
router.get('/manager/assigned',
  authenticate,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'outlet_manager') {
      throw new AppError('Only outlet managers can access this endpoint', 403);
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: outlets } = await Outlet.findAndCountAll({
      include: [
        {
          model: OutletManager,
          as: 'outletManagements',
          where: {
            manager_id: req.user.id,
            is_active: true
          },
          required: true,
          include: [
            {
              model: User,
              as: 'manager',
              attributes: ['id', 'first_name', 'last_name', 'email']
            }
          ]
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_name', 'approval_status']
        },
        {
          model: Experience,
          as: 'experiences',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'title', 'business_types', 'price_per_person']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
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

module.exports = router; 