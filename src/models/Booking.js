const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  experience_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'experiences',
      key: 'id'
    }
  },
  outlet_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'outlets',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM,
    values: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
    defaultValue: 'pending',
    allowNull: false
  },
  booking_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  booking_time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  party_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  confirmation_code: {
    type: DataTypes.STRING,
    unique: true
  },
  special_requests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'bookings',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['experience_id']
    },
    {
      fields: ['outlet_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['booking_date']
    },
    {
      fields: ['confirmation_code'],
      unique: true
    }
  ]
});

// Instance methods
Booking.prototype.generateConfirmationCode = function() {
  this.confirmation_code = `BK-${uuidv4().slice(0, 8).toUpperCase()}`;
};

Booking.prototype.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

Booking.prototype.canTransitionTo = function(newStatus) {
  const validTransitions = {
    pending: ['confirmed', 'rejected', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    rejected: [],
    completed: [],
    cancelled: []
  };

  return validTransitions[this.status]?.includes(newStatus) || false;
};

// Class methods
Booking.findByUser = async function(userId) {
  return await Booking.findAll({
    where: { user_id: userId },
    order: [['booking_date', 'DESC'], ['booking_time', 'DESC']]
  });
};

Booking.findByOutlet = async function(outletId) {
  return await Booking.findAll({
    where: { outlet_id: outletId },
    order: [['booking_date', 'DESC'], ['booking_time', 'DESC']]
  });
};

Booking.findByExperience = async function(experienceId) {
  return await Booking.findAll({
    where: { experience_id: experienceId },
    order: [['booking_date', 'DESC'], ['booking_time', 'DESC']]
  });
};

Booking.findByStatus = async function(status) {
  return await Booking.findAll({
    where: { status },
    order: [['booking_date', 'DESC'], ['booking_time', 'DESC']]
  });
};

module.exports = Booking; 