const express = require('express');
const { Op } = require('sequelize');
const { Booking, Experience, Outlet, User, OutletManager } = require('../models');
const { authenticate, requireOutletManager } = require('../middleware/auth');
const { validate, bookingSchemas, paramSchemas } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings for outlet manager's outlets
 * @access  Private (Outlet Manager)
 */
router.get('/',
  authenticate,
  requireOutletManager,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, outlet_id, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    // Get outlet manager's assigned outlets
    const managedOutlets = await OutletManager.findAll({
      where: { 
        manager_id: req.user.id,
        is_active: true
      },
      attributes: ['outlet_id']
    });

    const outletIds = managedOutlets.map(om => om.outlet_id);

    if (outletIds.length === 0) {
      return res.json({
        status: 'success',
        data: {
          bookings: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        }
      });
    }

    // Build where clause
    const whereClause = {
      outlet_id: { [Op.in]: outletIds }
    };

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by specific outlet
    if (outlet_id) {
      if (!outletIds.includes(outlet_id)) {
        throw new AppError('You do not have access to this outlet', 403);
      }
      whereClause.outlet_id = outlet_id;
    }

    // Filter by date range
    if (date_from || date_to) {
      whereClause.booking_date = {};
      if (date_from) whereClause.booking_date[Op.gte] = date_from;
      if (date_to) whereClause.booking_date[Op.lte] = date_to;
    }

    const { rows: bookings, count } = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Experience,
          as: 'experience',
          attributes: ['id', 'title', 'price_per_person']
        },
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['id', 'outlet_name', 'location']
        }
      ],
      order: [
        ['booking_date', 'DESC'],
        ['booking_time', 'DESC']
      ],
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
 * @route   GET /api/bookings/:id
 * @desc    Get booking details
 * @access  Private (Outlet Manager)
 */
router.get('/:id',
  authenticate,
  requireOutletManager,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Experience,
          as: 'experience',
          attributes: ['id', 'title', 'price_per_person']
        },
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['id', 'outlet_name', 'location']
        }
      ]
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check if outlet manager has access to this booking's outlet
    const hasAccess = await OutletManager.findOne({
      where: {
        manager_id: req.user.id,
        outlet_id: booking.outlet_id,
        is_active: true
      }
    });

    if (!hasAccess) {
      throw new AppError('You do not have access to this booking', 403);
    }

    res.json({
      status: 'success',
      data: {
        booking
      }
    });
  })
);

/**
 * @route   PUT /api/bookings/:id/status
 * @desc    Update booking status (confirm/reject/complete)
 * @access  Private (Outlet Manager)
 */
router.put('/:id/status',
  authenticate,
  requireOutletManager,
  validate(paramSchemas.id, 'params'),
  validate(bookingSchemas.updateStatus),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Outlet,
          as: 'outlet'
        }
      ]
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check if outlet manager has access to this booking's outlet
    const hasAccess = await OutletManager.findOne({
      where: {
        manager_id: req.user.id,
        outlet_id: booking.outlet_id,
        is_active: true
      }
    });

    if (!hasAccess) {
      throw new AppError('You do not have access to this booking', 403);
    }

    // Validate status transition
    if (!booking.canTransitionTo(status)) {
      throw new AppError(`Cannot transition booking from ${booking.status} to ${status}`, 400);
    }

    await booking.update({
      status,
      notes: notes || booking.notes,
      updated_by: req.user.id
    });

    // Get updated booking with relations
    const updatedBooking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Experience,
          as: 'experience',
          attributes: ['id', 'title', 'price_per_person']
        },
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['id', 'outlet_name', 'location']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Booking status updated successfully',
      data: {
        booking: updatedBooking
      }
    });
  })
);

module.exports = router; 