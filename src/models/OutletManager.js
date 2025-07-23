const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OutletManager = sequelize.define('OutletManager', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  outlet_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'outlets',
      key: 'id'
    }
  },
  manager_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
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
  }
}, {
  tableName: 'outlet_managers',
  indexes: [
    {
      unique: true,
      fields: ['outlet_id', 'manager_id'],
      where: {
        is_active: true
      }
    },
    {
      fields: ['outlet_id']
    },
    {
      fields: ['manager_id']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Class methods
OutletManager.findByManager = async function(managerId) {
  return await OutletManager.findAll({
    where: { manager_id: managerId, is_active: true },
    include: [
      {
        model: require('./Outlet'),
        as: 'outlet'
      }
    ]
  });
};

OutletManager.findByOutlet = async function(outletId) {
  return await OutletManager.findAll({
    where: { outlet_id: outletId, is_active: true },
    include: [
      {
        model: require('./User'),
        as: 'manager'
      }
    ]
  });
};

OutletManager.assignManager = async function(outletId, managerId, assignedBy) {
  // First deactivate any existing assignments for this outlet
  await OutletManager.update(
    { is_active: false },
    { where: { outlet_id: outletId, is_active: true } }
  );

  // Create new assignment
  return await OutletManager.create({
    outlet_id: outletId,
    manager_id: managerId,
    created_by: assignedBy
  });
};

OutletManager.removeManager = async function(outletId, managerId) {
  return await OutletManager.update(
    { is_active: false },
    { where: { outlet_id: outletId, manager_id: managerId, is_active: true } }
  );
};

OutletManager.isManagerOfOutlet = async function(managerId, outletId) {
  const assignment = await OutletManager.findOne({
    where: {
      manager_id: managerId,
      outlet_id: outletId,
      is_active: true
    }
  });
  return !!assignment;
};

module.exports = OutletManager; 