// Test script to verify that associations are properly defined
require('dotenv').config();

console.log('🧪 Testing database associations...\n');

try {
  // Import the models to test associations
  const { sequelize, User, Business, Outlet, OutletManager, Experience } = require('./src/models');
  
  console.log('✅ Models imported successfully');
  console.log('✅ All associations defined without conflicts');
  
  // Print out association names for verification
  console.log('\n📋 Association Summary:');
  console.log('User associations:', Object.keys(User.associations));
  console.log('Business associations:', Object.keys(Business.associations));
  console.log('Outlet associations:', Object.keys(Outlet.associations));
  console.log('OutletManager associations:', Object.keys(OutletManager.associations));
  console.log('Experience associations:', Object.keys(Experience.associations));
  
  console.log('\n🎉 Association test completed successfully!');
  console.log('The application should now start without Sequelize association errors.');
  
} catch (error) {
  console.error('❌ Association test failed:', error.message);
  console.error('\nFull error:', error);
  process.exit(1);
} 