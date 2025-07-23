const { sequelize, User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
  try {
    console.log('🚀 Starting PourUp API Setup...\n');

    // Test database connection
    console.log('📡 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // Create/sync database tables
    console.log('🗄️  Creating database tables...');
    // Use force: true for clean setup, or just sync() for existing databases
    const isInitialSetup = process.argv.includes('--fresh');
    if (isInitialSetup) {
      console.log('⚠️  Running fresh setup - this will drop existing tables!');
      await sequelize.sync({ force: true });
    } else {
      // For existing databases, just sync without altering to avoid index conflicts
      await sequelize.sync({ force: false });
    }
    console.log('✅ Database tables created/updated\n');

    // Check if super admin exists
    console.log('👑 Checking for Super Admin...');
    const existingSuperAdmin = await User.findOne({
      where: { role: 'super_admin', is_active: true }
    });

    if (existingSuperAdmin) {
      console.log('✅ Super Admin already exists:', existingSuperAdmin.email);
    } else {
      // Create default super admin
      console.log('👤 Creating default Super Admin...');
      const superAdmin = await User.create({
        first_name: 'Super',
        last_name: 'Admin',
        email: 'admin@pourup.com',
        password: 'admin123', // This will be hashed automatically
        role: 'super_admin',
        email_verified: true,
        is_active: true
      });
      
      console.log('✅ Super Admin created successfully!');
      console.log('📧 Email: admin@pourup.com');
      console.log('🔑 Password: admin123');
      console.log('⚠️  Please change the password after first login!\n');
    }

    // Create sample winery admin (optional)
    console.log('🍷 Checking for sample Winery Admin...');
    const existingWineryAdmin = await User.findOne({
      where: { email: 'winery@pourup.com', is_active: true }
    });

    if (!existingWineryAdmin) {
      console.log('👤 Creating sample Winery Admin...');
      await User.create({
        first_name: 'Winery',
        last_name: 'Admin',
        email: 'winery@pourup.com',
        password: 'winery123',
        role: 'winery_admin',
        email_verified: true,
        is_active: true,
        created_by: (await User.findOne({ where: { role: 'super_admin' } })).id
      });
      
      console.log('✅ Sample Winery Admin created!');
      console.log('📧 Email: winery@pourup.com');
      console.log('🔑 Password: winery123\n');
    } else {
      console.log('✅ Sample Winery Admin already exists\n');
    }

    // Create uploads directory
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('📁 Creating uploads directory...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Uploads directory created\n');
    } else {
      console.log('✅ Uploads directory already exists\n');
    }

    console.log('🎉 Setup completed successfully!\n');
    
    console.log('📋 Next Steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Test the API: GET http://localhost:3000/api/health');
    console.log('3. Login as Super Admin: POST http://localhost:3000/api/auth/login');
    console.log('4. Check the API documentation: README.md and API_DOCUMENTATION.md\n');
    
    console.log('🔐 Default Credentials:');
    console.log('Super Admin - Email: admin@pourup.com, Password: admin123');
    console.log('Winery Admin - Email: winery@pourup.com, Password: winery123\n');
    
    console.log('⚠️  Remember to:');
    console.log('- Change default passwords');
    console.log('- Set strong JWT_SECRET in production');
    console.log('- Configure proper database credentials');
    console.log('- Set up HTTPS in production\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Make sure MySQL is running');
    console.error('2. Check database credentials in .env file');
    console.error('3. Ensure database exists: CREATE DATABASE pourup_db;');
    console.error('4. Check if all dependencies are installed: npm install');
    console.error('5. For fresh setup with clean tables: node setup.js --fresh\n');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase().then(() => {
    console.log('✨ Setup script completed!\n');
    process.exit(0);
  });
}

module.exports = { setupDatabase }; 