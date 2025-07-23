const sequelize = require('../config/database');
const User = require('./User');
const Business = require('./Business');
const Outlet = require('./Outlet');
const OutletManager = require('./OutletManager');
const Experience = require('./Experience');
const Booking = require('./Booking');

// User relationships
User.hasMany(Business, { foreignKey: 'created_by', as: 'businesses' });
User.hasMany(Outlet, { foreignKey: 'created_by', as: 'outlets' });
User.hasMany(Experience, { foreignKey: 'created_by', as: 'experiences' });
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
User.hasMany(OutletManager, { foreignKey: 'manager_id', as: 'outletManagements' });
User.hasMany(OutletManager, { foreignKey: 'created_by', as: 'assignedManagers' });

// Business relationships
Business.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Business.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });
Business.hasMany(Outlet, { foreignKey: 'business_id', as: 'outlets' });

// Outlet relationships
Outlet.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Outlet.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
Outlet.hasMany(Experience, { foreignKey: 'outlet_id', as: 'experiences' });
Outlet.hasMany(Booking, { foreignKey: 'outlet_id', as: 'bookings' });
Outlet.hasMany(OutletManager, { foreignKey: 'outlet_id', as: 'outletManagements' });

// OutletManager relationships
OutletManager.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });
OutletManager.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
OutletManager.belongsTo(Outlet, { foreignKey: 'outlet_id', as: 'outlet' });

// Experience relationships
Experience.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Experience.belongsTo(Outlet, { foreignKey: 'outlet_id', as: 'outlet' });
Experience.hasMany(Booking, { foreignKey: 'experience_id', as: 'bookings' });

// Booking relationships
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Booking.belongsTo(Experience, { foreignKey: 'experience_id', as: 'experience' });
Booking.belongsTo(Outlet, { foreignKey: 'outlet_id', as: 'outlet' });

// Many-to-many relationships through OutletManager
User.belongsToMany(Outlet, {
  through: OutletManager,
  foreignKey: 'manager_id',
  otherKey: 'outlet_id',
  as: 'managedOutlets'
});

Outlet.belongsToMany(User, {
  through: OutletManager,
  foreignKey: 'outlet_id',
  otherKey: 'manager_id',
  as: 'outletManagers'
});

module.exports = {
  sequelize,
  User,
  Business,
  Outlet,
  OutletManager,
  Experience,
  Booking
}; 