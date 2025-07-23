const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('bookings', 'notes', {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      after: 'special_requests'
    });

    await queryInterface.addColumn('bookings', 'updated_by', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      after: 'notes'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('bookings', 'notes');
    await queryInterface.removeColumn('bookings', 'updated_by');
  }
}; 