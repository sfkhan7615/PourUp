const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Experience = sequelize.define('Experience', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  business_types: {
    type: DataTypes.ENUM,
    values: ['winery', 'vineyard', 'tasting_room'],
    allowNull: false
  },
  price_per_person: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  menu_item_title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  menu_item_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  time_slots: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isValidTimeSlots(value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('At least one time slot must be provided');
        }
        
        for (let slot of value) {
          if (!slot.start_time || !slot.end_time || typeof slot.max_party_size !== 'number' || typeof slot.is_available !== 'boolean') {
            throw new Error('Each time slot must have start_time, end_time, max_party_size, and is_available');
          }
          
          if (slot.max_party_size <= 0) {
            throw new Error('Max party size must be greater than 0');
          }
        }
      }
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  outlet_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'outlets',
      key: 'id'
    }
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'experiences',
  indexes: [
    {
      fields: ['title']
    },
    {
      fields: ['business_types']
    },
    {
      fields: ['outlet_id']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['price_per_person']
    }
  ]
});

// Instance methods
Experience.prototype.getAvailableTimeSlots = function() {
  return this.time_slots.filter(slot => slot.is_available);
};

Experience.prototype.getTotalTimeSlots = function() {
  return this.time_slots.length;
};

Experience.prototype.getAvailableTimeSlotsCount = function() {
  return this.time_slots.filter(slot => slot.is_available).length;
};

Experience.prototype.addTimeSlot = function(timeSlot) {
  if (!timeSlot.start_time || !timeSlot.end_time || typeof timeSlot.max_party_size !== 'number') {
    throw new Error('Invalid time slot data');
  }
  
  this.time_slots.push({
    start_time: timeSlot.start_time,
    end_time: timeSlot.end_time,
    max_party_size: timeSlot.max_party_size,
    is_available: timeSlot.is_available !== undefined ? timeSlot.is_available : true
  });
};

Experience.prototype.updateTimeSlot = function(index, updates) {
  if (index < 0 || index >= this.time_slots.length) {
    throw new Error('Invalid time slot index');
  }
  
  this.time_slots[index] = { ...this.time_slots[index], ...updates };
};

Experience.prototype.removeTimeSlot = function(index) {
  if (index < 0 || index >= this.time_slots.length) {
    throw new Error('Invalid time slot index');
  }
  
  this.time_slots.splice(index, 1);
};

Experience.prototype.hasBusinessType = function(businessType) {
  return this.business_types === businessType;
};

// Class methods
Experience.findByOutlet = async function(outletId) {
  return await Experience.findAll({
    where: { outlet_id: outletId, is_active: true },
    order: [['created_at', 'DESC']]
  });
};

Experience.findByBusinessType = async function(businessType) {
  return await Experience.findAll({
    where: { business_types: businessType, is_active: true },
    order: [['created_at', 'DESC']]
  });
};

Experience.findByCreator = async function(creatorId) {
  return await Experience.findAll({
    where: { created_by: creatorId, is_active: true },
    order: [['created_at', 'DESC']]
  });
};

Experience.findByPriceRange = async function(minPrice, maxPrice) {
  return await Experience.findAll({
    where: {
      price_per_person: {
        [sequelize.Sequelize.Op.between]: [minPrice, maxPrice]
      },
      is_active: true
    },
    order: [['price_per_person', 'ASC']]
  });
};

Experience.findAvailable = async function() {
  return await Experience.findAll({
    where: {
      is_active: true,
      time_slots: {
        [sequelize.Sequelize.Op.contains]: [{ is_available: true }]
      }
    },
    order: [['created_at', 'DESC']]
  });
};

module.exports = Experience; 