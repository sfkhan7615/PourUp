const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDatabase() {
  let connection;
  
  try {
    console.log('🔄 Starting Database Reset...\n');

    // Connect to MySQL server (not specific database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('📡 Connected to MySQL server');

    // Drop existing database
    const dbName = process.env.DB_NAME || 'pourup_db';
    console.log(`🗑️  Dropping database: ${dbName}`);
    await connection.execute(`DROP DATABASE IF EXISTS \`${dbName}\``);
    
    // Create fresh database
    console.log(`🆕 Creating fresh database: ${dbName}`);
    await connection.execute(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    console.log('✅ Database reset completed successfully!\n');
    
    console.log('📋 Next Steps:');
    console.log('1. Run setup: node setup.js');
    console.log('2. Start server: npm run dev');
    console.log('3. Test frontend: http://localhost:3001\n');

  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    console.error('\n🔧 Common Issues:');
    console.error('1. MySQL server not running');
    console.error('2. Wrong database credentials');
    console.error('3. Insufficient permissions');
    console.error('\n💡 Manual Alternative:');
    console.error('Open your MySQL client and run:');
    console.error(`DROP DATABASE IF EXISTS ${process.env.DB_NAME || 'pourup_db'};`);
    console.error(`CREATE DATABASE ${process.env.DB_NAME || 'pourup_db'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  resetDatabase().then(() => {
    console.log('🎉 Database reset script completed!');
    process.exit(0);
  });
}

module.exports = { resetDatabase }; 