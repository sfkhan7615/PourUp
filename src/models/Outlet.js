const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Outlet = sequelize.define('Outlet', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  outlet_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  location: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  ava_location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  instagram_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  facebook_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  linkedin_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  business_types: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isValidBusinessTypes(value) {
        const validTypes = ['winery', 'vineyard', 'tasting_room'];
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('At least one business type must be selected');
        }
        for (let type of value) {
          if (!validTypes.includes(type)) {
            throw new Error(`Invalid business type: ${type}`);
          }
        }
      }
    }
  },
  operation_hours: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      monday: { start_time: null, end_time: null, is_closed: true },
      tuesday: { start_time: null, end_time: null, is_closed: true },
      wednesday: { start_time: null, end_time: null, is_closed: true },
      thursday: { start_time: null, end_time: null, is_closed: true },
      friday: { start_time: null, end_time: null, is_closed: true },
      saturday: { start_time: null, end_time: null, is_closed: true },
      sunday: { start_time: null, end_time: null, is_closed: true }
    }
  },
  amenities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  atmosphere: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  soil_type: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  ownership: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  wine_production: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  business_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
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
  tableName: 'outlets',
  indexes: [
    {
      fields: ['outlet_name']
    },
    {
      fields: ['business_id']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Instance methods
Outlet.prototype.isOpenToday = function() {
  const today = new Date().toLocaleLowerCase();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[new Date().getDay()];
  
  if (!this.operation_hours[dayName]) return false;
  return !this.operation_hours[dayName].is_closed;
};

Outlet.prototype.getTodayHours = function() {
  const today = new Date().toLocaleLowerCase();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[new Date().getDay()];
  
  return this.operation_hours[dayName] || null;
};

Outlet.prototype.hasBusinessType = function(businessType) {
  return this.business_types.includes(businessType);
};

Outlet.prototype.addBusinessType = function(businessType) {
  if (!this.business_types.includes(businessType)) {
    this.business_types.push(businessType);
  }
};

Outlet.prototype.removeBusinessType = function(businessType) {
  this.business_types = this.business_types.filter(type => type !== businessType);
};

// Class methods
Outlet.findByBusiness = async function(businessId) {
  return await Outlet.findAll({
    where: { business_id: businessId, is_active: true },
    order: [['created_at', 'DESC']]
  });
};

Outlet.findByCreator = async function(creatorId) {
  return await Outlet.findAll({
    where: { created_by: creatorId, is_active: true },
    order: [['created_at', 'DESC']]
  });
};

Outlet.findByBusinessType = async function(businessType) {
  return await Outlet.findAll({
    where: {
      business_types: {
        [sequelize.Sequelize.Op.contains]: [businessType]
      },
      is_active: true
    },
    order: [['created_at', 'DESC']]
  });
};

module.exports = Outlet; 