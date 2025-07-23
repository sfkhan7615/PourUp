# PourUp API - Complete Setup Guide

This guide will walk you through setting up the PourUp API from scratch, avoiding common issues.

## Prerequisites

Before starting, ensure you have:

- **Node.js** v16.0.0 or higher ([Download here](https://nodejs.org/))
- **MySQL** v8.0 or higher ([Download here](https://dev.mysql.com/downloads/))
- **npm** v8.0.0 or higher (comes with Node.js)
- A MySQL client (MySQL Workbench, phpMyAdmin, or command line)

## Step-by-Step Setup

### 1. Verify Prerequisites

Check your installations:

```bash
node --version    # Should be v16.0.0+
npm --version     # Should be v8.0.0+
mysql --version   # Should be v8.0+
```

### 2. Clone and Navigate to Project

```bash
# If you have the project files
cd PourUp

# If you're starting fresh, create the directory
mkdir PourUp
cd PourUp
```

### 3. Install Dependencies

```bash
npm install
```

If you encounter any errors:
```bash
# Clear npm cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 4. MySQL Database Setup

#### Option A: Using MySQL Command Line
```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE pourup_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;  -- Verify database was created
EXIT;
```

#### Option B: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Click "Create a new schema" button
4. Name it `pourup_db`
5. Set Character Set to `utf8mb4`
6. Set Collation to `utf8mb4_unicode_ci`
7. Click Apply

### 5. Environment Configuration

Create environment file:
```bash
cp env.example .env
```

Edit the `.env` file with your settings:
```env
# Database Configuration (REQUIRED)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pourup_db
DB_USER=root
DB_PASSWORD=your_mysql_password_here

# JWT Configuration (REQUIRED - change in production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_minimum_32_chars
JWT_EXPIRE=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
```

**Important:** Replace `your_mysql_password_here` with your actual MySQL password!

### 6. Run Setup Script

This is the crucial step that creates all database tables and initial users:

```bash
npm run setup
```

You should see output like:
```
🚀 Starting PourUp API Setup...

📡 Testing database connection...
✅ Database connection successful

🗄️  Creating database tables...
✅ Database tables created/updated

👑 Checking for Super Admin...
👤 Creating default Super Admin...
✅ Super Admin created successfully!
📧 Email: admin@pourup.com
🔑 Password: admin123

🍷 Checking for sample Winery Admin...
👤 Creating sample Winery Admin...
✅ Sample Winery Admin created!
📧 Email: winery@pourup.com
🔑 Password: winery123

📁 Creating uploads directory...
✅ Uploads directory created

🎉 Setup completed successfully!
```

### 7. Start the Application

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

You should see:
```
PourUp API server is running on port 3000
Environment: development
Database connection established successfully.
Database models synchronized.
```

### 8. Test the API

Open a new terminal and test:

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Should return:
# {"status":"OK","message":"PourUp API is running","timestamp":"..."}
```

Test login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pourup.com","password":"admin123"}'
```

## Troubleshooting Common Issues

### Issue: "Cannot find config/config.json"

**Solution:** This error appears if you try to run Sequelize CLI commands. Our application doesn't use Sequelize CLI. Instead:
- Use `npm run setup` (not `npm run migrate`)
- All database setup is handled automatically

### Issue: "Database connection failed"

**Solutions:**
1. Verify MySQL is running:
   ```bash
   # On Windows
   net start mysql80
   
   # On macOS/Linux
   sudo systemctl start mysql
   # or
   brew services start mysql
   ```

2. Check database credentials in `.env` file
3. Test MySQL connection manually:
   ```bash
   mysql -u root -p
   ```

4. Ensure database exists:
   ```sql
   SHOW DATABASES;
   ```

### Issue: "Port 3000 already in use"

**Solutions:**
1. Change port in `.env` file:
   ```env
   PORT=3001
   ```

2. Or find and kill the process using port 3000:
   ```bash
   # Find process using port 3000
   lsof -i :3000
   # Kill the process
   kill -9 <PID>
   ```

### Issue: "Permission denied" for uploads directory

**Solution:**
```bash
chmod 755 uploads/
```

### Issue: JWT token errors

**Solution:** Ensure `JWT_SECRET` in `.env` is at least 32 characters long:
```env
JWT_SECRET=your_super_long_secret_key_at_least_32_characters_long_for_security
```

### Issue: Sequelize Association Error

**Error Message:**
```
AssociationError [SequelizeAssociationError]: You have used the alias managedOutlets in two separate associations. Aliased associations must have unique aliases.
```

**Solution:** This error has been fixed in the codebase. If you encounter it:
1. Make sure you have the latest version of all files
2. Run the test script to verify associations:
   ```bash
   node test-associations.js
   ```

### Issue: npm install fails

**Solutions:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Use Node Version Manager if you have version conflicts:
   ```bash
   nvm install 18
   nvm use 18
   npm install
   ```

## Next Steps After Setup

1. **Change Default Passwords:**
   - Login as Super Admin: `admin@pourup.com` / `admin123`
   - Go to profile settings and change password

2. **Explore the API:**
   - Check `API_DOCUMENTATION.md` for detailed endpoint documentation
   - Use Postman or similar tool to test endpoints

3. **Create Your First Business:**
   - Login as Winery Admin: `winery@pourup.com` / `winery123`
   - Create a business via POST `/api/businesses`
   - Login as Super Admin to approve it

4. **Production Deployment:**
   - Set `NODE_ENV=production`
   - Use strong JWT secret
   - Set up HTTPS
   - Configure proper database credentials

## Getting Help

If you're still having issues:

1. Check the main `README.md` for additional information
2. Verify all prerequisites are properly installed
3. Make sure you followed each step exactly
4. Check the error messages carefully - they usually indicate what's wrong

## Default Accounts

After setup, you'll have these accounts:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Super Admin | admin@pourup.com | admin123 | System administration |
| Winery Admin | winery@pourup.com | winery123 | Business management |

**Remember to change these passwords in production!**

## File Structure Reference

```
PourUp/
├── .env                        # Your environment configuration
├── package.json               # Project dependencies
├── server.js                  # Main application entry point
├── setup.js                   # Database setup script
├── uploads/                   # File upload directory (created by setup)
└── src/
    ├── config/database.js     # Database configuration
    ├── models/                # Database models
    ├── routes/                # API endpoints
    ├── middleware/            # Authentication & validation
    └── utils/                 # Utility functions
```

This setup guide should help you get the PourUp API running smoothly. If you encounter any issues not covered here, please refer to the troubleshooting section or the main documentation. 