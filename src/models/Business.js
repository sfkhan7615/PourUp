const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Business = sequelize.define('Business', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  business_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  legal_business_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  approval_status: {
    type: DataTypes.ENUM,
    values: ['pending', 'approved', 'rejected'],
    allowNull: false,
    defaultValue: 'pending'
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 20]
    }
  },
  business_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  website_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  primary_title: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  job_title: {
    type: DataTypes.STRING(100),
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
  yelp_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  logo_images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'businesses',
  indexes: [
    {
      fields: ['business_name']
    },
    {
      fields: ['approval_status']
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
Business.prototype.approve = async function(approvedBy) {
  this.approval_status = 'approved';
  this.approved_by = approvedBy;
  this.approved_at = new Date();
  return await this.save();
};

Business.prototype.reject = async function() {
  this.approval_status = 'rejected';
  return await this.save();
};

Business.prototype.isApproved = function() {
  return this.approval_status === 'approved';
};

Business.prototype.isPending = function() {
  return this.approval_status === 'pending';
};

Business.prototype.isRejected = function() {
  return this.approval_status === 'rejected';
};

// Class methods
Business.findByCreator = async function(creatorId) {
  return await Business.findAll({
    where: { created_by: creatorId, is_active: true },
    order: [['created_at', 'DESC']]
  });
};

Business.findApproved = async function() {
  return await Business.findAll({
    where: { approval_status: 'approved', is_active: true },
    order: [['created_at', 'DESC']]
  });
};

Business.findPending = async function() {
  return await Business.findAll({
    where: { approval_status: 'pending', is_active: true },
    order: [['created_at', 'DESC']]
  });
};

module.exports = Business; 