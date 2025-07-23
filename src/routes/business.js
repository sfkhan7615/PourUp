const express = require('express');
const { Business, User, Outlet } = require('../models');
const { authenticate, requireSuperAdmin, requireWineryAdmin, optionalAuth } = require('../middleware/auth');
const { validate, businessSchemas, paramSchemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @route   GET /api/businesses
 * @desc    Get all businesses (public for users, filtered for admins)
 * @access  Public/Private
 */
router.get('/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, search, created_by } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { is_active: true };

    // Filter by approval status
    if (status) {
      whereClause.approval_status = status;
    } else if (!req.user || req.user.role === 'user') {
      // Regular users can only see approved businesses
      whereClause.approval_status = 'approved';
    }

    // Filter by creator (for winery admins viewing their own businesses)
    if (created_by && req.user && (req.user.role === 'super_admin' || req.user.id === created_by)) {
      whereClause.created_by = created_by;
    } else if (req.user && req.user.role === 'winery_admin') {
      // Winery admins can only see their own businesses
      whereClause.created_by = req.user.id;
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { business_name: { [Op.like]: `%${search}%` } },
        { legal_business_name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: businesses } = await Business.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false
        },
        {
          model: Outlet,
          as: 'outlets',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'outlet_name', 'location', 'business_types']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        businesses,
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
 * @route   GET /api/businesses/:id
 * @desc    Get business by ID
 * @access  Public for approved businesses, Private for others
 */
router.get('/:id',
  optionalAuth,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const business = await Business.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false
        },
        {
          model: Outlet,
          as: 'outlets',
          where: { is_active: true },
          required: false
        }
      ]
    });

    if (!business || !business.is_active) {
      throw new AppError('Business not found', 404);
    }

    // Check permissions for non-approved businesses
    if (business.approval_status !== 'approved') {
      if (!req.user) {
        throw new AppError('Business not found', 404);
      }

      if (req.user.role !== 'super_admin' && business.created_by !== req.user.id) {
        throw new AppError('You can only view your own pending businesses', 403);
      }
    }

    res.json({
      status: 'success',
      data: {
        business
      }
    });
  })
);

/**
 * @route   POST /api/businesses
 * @desc    Create new business (Winery Admin only)
 * @access  Private (Winery Admin)
 */
router.post('/',
  authenticate,
  requireWineryAdmin,
  validate(businessSchemas.create),
  asyncHandler(async (req, res) => {
    const businessData = {
      ...req.body,
      created_by: req.user.id,
      approval_status: 'pending'
    };

    const business = await Business.create(businessData);

    // Include creator information in response
    const businessWithCreator = await Business.findByPk(business.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Business created successfully and submitted for approval',
      data: {
        business: businessWithCreator
      }
    });
  })
);

/**
 * @route   PUT /api/businesses/:id
 * @desc    Update business
 * @access  Private (Owner or Super Admin)
 */
router.put('/:id',
  authenticate,
  validate(paramSchemas.id, 'params'),
  validate(businessSchemas.update),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const business = await Business.findByPk(id);
    if (!business || !business.is_active) {
      throw new AppError('Business not found', 404);
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && business.created_by !== req.user.id) {
      throw new AppError('You can only update your own businesses', 403);
    }

    // If updating an approved business, reset to pending status
    const updateData = { ...req.body };
    if (business.approval_status === 'approved' && req.user.role !== 'super_admin') {
      updateData.approval_status = 'pending';
      updateData.approved_by = null;
      updateData.approved_at = null;
    }

    await business.update(updateData);

    // Get updated business with relations
    const updatedBusiness = await Business.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Business updated successfully',
      data: {
        business: updatedBusiness
      }
    });
  })
);

/**
 * @route   PUT /api/businesses/:id/approve
 * @desc    Approve business (Super Admin only)
 * @access  Private (Super Admin)
 */
router.put('/:id/approve',
  authenticate,
  requireSuperAdmin,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const business = await Business.findByPk(id);
    if (!business || !business.is_active) {
      throw new AppError('Business not found', 404);
    }

    if (business.approval_status === 'approved') {
      throw new AppError('Business is already approved', 400);
    }

    await business.approve(req.user.id);

    // Get updated business with relations
    const approvedBusiness = await Business.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Business approved successfully',
      data: {
        business: approvedBusiness
      }
    });
  })
);

/**
 * @route   PUT /api/businesses/:id/reject
 * @desc    Reject business (Super Admin only)
 * @access  Private (Super Admin)
 */
router.put('/:id/reject',
  authenticate,
  requireSuperAdmin,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const business = await Business.findByPk(id);
    if (!business || !business.is_active) {
      throw new AppError('Business not found', 404);
    }

    if (business.approval_status === 'rejected') {
      throw new AppError('Business is already rejected', 400);
    }

    await business.reject();

    res.json({
      status: 'success',
      message: 'Business rejected successfully',
      data: {
        business
      }
    });
  })
);

/**
 * @route   DELETE /api/businesses/:id
 * @desc    Delete business (Super Admin or Owner)
 * @access  Private
 */
router.delete('/:id',
  authenticate,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const business = await Business.findByPk(id);
    if (!business || !business.is_active) {
      throw new AppError('Business not found', 404);
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && business.created_by !== req.user.id) {
      throw new AppError('You can only delete your own businesses', 403);
    }

    // Soft delete
    await business.update({ is_active: false });

    // Also deactivate associated outlets
    await Outlet.update(
      { is_active: false },
      { where: { business_id: id } }
    );

    res.json({
      status: 'success',
      message: 'Business deleted successfully'
    });
  })
);

/**
 * @route   GET /api/businesses/pending/approval
 * @desc    Get businesses pending approval (Super Admin only)
 * @access  Private (Super Admin)
 */
router.get('/pending/approval',
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: businesses } = await Business.findAndCountAll({
      where: { 
        approval_status: 'pending',
        is_active: true 
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'ASC']] // Oldest first for approval queue
    });

    res.json({
      status: 'success',
      data: {
        businesses,
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
 * @route   GET /api/businesses/my/businesses
 * @desc    Get current user's businesses
 * @access  Private (Winery Admin)
 */
router.get('/my/businesses',
  authenticate,
  requireWineryAdmin,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      created_by: req.user.id,
      is_active: true
    };

    if (status) {
      whereClause.approval_status = status;
    }

    const { count, rows: businesses } = await Business.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false
        },
        {
          model: Outlet,
          as: 'outlets',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'outlet_name', 'location']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        businesses,
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