const express = require('express');
const { User, OutletManager, Outlet } = require('../models');
const { generateAccessToken } = require('../utils/jwt');
const { authenticate, requireSuperAdmin, requireWineryAdmin } = require('../middleware/auth');
const { validate, userSchemas, paramSchemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (Super Admin only)
 * @access  Private (Super Admin)
 */
router.get('/',
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (role) {
      whereClause.role = role;
    }

    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        users,
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
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Super Admin or own profile)
 */
router.get('/:id',
  authenticate,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if user can access this profile
    if (req.user.role !== 'super_admin' && req.user.id !== id) {
      throw new AppError('You can only access your own profile', 403);
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: OutletManager,
          as: 'outletManagements',
          where: { is_active: true },
          required: false,
          include: [
            {
              model: Outlet,
              as: 'outlet'
            }
          ]
        }
      ]
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: {
        user
      }
    });
  })
);

/**
 * @route   POST /api/users/outlet-manager
 * @desc    Create outlet manager (Winery Admin only)
 * @access  Private (Winery Admin)
 */
router.post('/outlet-manager',
  authenticate,
  requireWineryAdmin,
  validate(userSchemas.createOutletManager),
  asyncHandler(async (req, res) => {
    const { outlet_id, first_name, last_name, email, password, date_of_birth } = req.body;

    // Check if outlet exists and user has permission to manage it
    const outlet = await Outlet.findByPk(outlet_id);
    if (!outlet) {
      throw new AppError('Outlet not found', 404);
    }

    // Check if winery admin owns this outlet (unless super admin)
    if (req.user.role !== 'super_admin' && outlet.created_by !== req.user.id) {
      throw new AppError('You can only add managers to your own outlets', 403);
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Create outlet manager user
    const manager = await User.create({
      first_name,
      last_name,
      email,
      password,
      date_of_birth,
      role: 'outlet_manager',
      created_by: req.user.id,
      email_verified: true
    });

    // Assign manager to outlet
    await OutletManager.assignManager(outlet_id, manager.id, req.user.id);

    // Generate token for the new manager
    const token = generateAccessToken(manager);

    // Remove password from response
    const managerResponse = { ...manager.toJSON() };
    delete managerResponse.password;

    res.status(201).json({
      status: 'success',
      message: 'Outlet manager created successfully',
      data: {
        manager: managerResponse,
        token,
        outlet: outlet
      }
    });
  })
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (Super Admin or own profile)
 * @access  Private
 */
router.put('/:id',
  authenticate,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, phone_number, date_of_birth, role, is_active } = req.body;

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.id !== id) {
      throw new AppError('You can only update your own profile', 403);
    }

    // Only super admin can change role and status
    const updateData = {
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      phone_number: phone_number || user.phone_number,
      date_of_birth: date_of_birth || user.date_of_birth
    };

    if (req.user.role === 'super_admin') {
      if (role) updateData.role = role;
      if (is_active !== undefined) updateData.is_active = is_active;
    }

    await user.update(updateData);

    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user: userResponse
      }
    });
  })
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Deactivate user (Super Admin only)
 * @access  Private (Super Admin)
 */
router.delete('/:id',
  authenticate,
  requireSuperAdmin,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent super admin from deactivating themselves
    if (user.id === req.user.id) {
      throw new AppError('You cannot deactivate your own account', 400);
    }

    // Soft delete (deactivate)
    await user.update({ is_active: false });

    // Also deactivate any outlet manager assignments
    if (user.role === 'outlet_manager') {
      await OutletManager.update(
        { is_active: false },
        { where: { manager_id: user.id } }
      );
    }

    res.json({
      status: 'success',
      message: 'User deactivated successfully'
    });
  })
);

/**
 * @route   GET /api/users/outlet-managers/:outletId
 * @desc    Get managers for a specific outlet
 * @access  Private (Winery Admin or outlet owner)
 */
router.get('/outlet-managers/:outletId',
  authenticate,
  requireWineryAdmin,
  validate(paramSchemas.outletId, 'params'),
  asyncHandler(async (req, res) => {
    const { outletId } = req.params;

    // Check if outlet exists
    const outlet = await Outlet.findByPk(outletId);
    if (!outlet) {
      throw new AppError('Outlet not found', 404);
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && outlet.created_by !== req.user.id) {
      throw new AppError('You can only view managers for your own outlets', 403);
    }

    const managers = await OutletManager.findByOutlet(outletId);

    res.json({
      status: 'success',
      data: {
        outlet,
        managers
      }
    });
  })
);

/**
 * @route   DELETE /api/users/outlet-manager/:outletId/:managerId
 * @desc    Remove outlet manager assignment
 * @access  Private (Winery Admin)
 */
router.delete('/outlet-manager/:outletId/:managerId',
  authenticate,
  requireWineryAdmin,
  validate(paramSchemas.outletIdAndManagerId, 'params'),
  asyncHandler(async (req, res) => {
    const { outletId, managerId } = req.params;

    // Check if outlet exists and user has permission
    const outlet = await Outlet.findByPk(outletId);
    if (!outlet) {
      throw new AppError('Outlet not found', 404);
    }

    if (req.user.role !== 'super_admin' && outlet.created_by !== req.user.id) {
      throw new AppError('You can only manage your own outlets', 403);
    }

    // Remove manager assignment
    await OutletManager.removeManager(outletId, managerId);

    res.json({
      status: 'success',
      message: 'Manager removed from outlet successfully'
    });
  })
);

module.exports = router; 