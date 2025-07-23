const sequelize = require('./config/database');

async function addNotesToBookings() {
  try {
    // Add notes column
    await sequelize.query(`
      ALTER TABLE bookings 
      ADD COLUMN notes TEXT NULL DEFAULT NULL
    `).catch(err => {
      if (!err.message.includes('Duplicate column name')) throw err;
    });

    // Add updated_by column with matching type
    await sequelize.query(`
      ALTER TABLE bookings 
      ADD COLUMN updated_by VARCHAR(36) NULL DEFAULT NULL
    `).catch(err => {
      if (!err.message.includes('Duplicate column name')) throw err;
    });

    // Add foreign key
    await sequelize.query(`
      ALTER TABLE bookings 
      ADD CONSTRAINT fk_bookings_updated_by 
      FOREIGN KEY (updated_by) REFERENCES users(id)
    `).catch(err => {
      if (!err.message.includes('Duplicate key name')) throw err;
    });

    console.log('Successfully updated bookings table schema');
  } catch (error) {
    console.error('Error updating schema:', error);
    throw error;
  }
}

async function setup() {
  try {
    await addNotesToBookings();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setup(); 