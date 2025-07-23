const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [8, 255]
    }
  },
  role: {
    type: DataTypes.ENUM,
    values: ['super_admin', 'winery_admin', 'outlet_manager', 'user'],
    allowNull: false,
    defaultValue: 'user'
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [10, 20]
    }
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: [2, 255]
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['role']
    },
    {
      fields: ['is_active']
    }
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.getFullName = function() {
  return `${this.first_name} ${this.last_name}`;
};

User.prototype.hasRole = function(role) {
  return this.role === role;
};

User.prototype.isSuperAdmin = function() {
  return this.role === 'super_admin';
};

User.prototype.isWineryAdmin = function() {
  return this.role === 'winery_admin';
};

User.prototype.isOutletManager = function() {
  return this.role === 'outlet_manager';
};

User.prototype.isRegularUser = function() {
  return this.role === 'user';
};

// Class methods
User.createUser = async function(userData) {
  return await User.create(userData);
};

User.findByEmail = async function(email) {
  return await User.findOne({ where: { email, is_active: true } });
};

User.findByRole = async function(role) {
  return await User.findAll({ where: { role, is_active: true } });
};

module.exports = User; 