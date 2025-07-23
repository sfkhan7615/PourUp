# PourUp API - Postman Testing Guide

This guide explains how to use the provided Postman collection to test all PourUp API endpoints.

## 📥 Import Files

You'll need to import two files into Postman:

1. **`PourUp_API.postman_collection.json`** - The main collection with all API endpoints
2. **`PourUp_Environment.postman_environment.json`** - Environment variables and configuration

### How to Import

1. **Open Postman**
2. **Import Collection:**
   - Click "Import" button (top left)
   - Drag and drop `PourUp_API.postman_collection.json` or click "Upload Files"
   - Click "Import"

3. **Import Environment:**
   - Click "Import" button again
   - Drag and drop `PourUp_Environment.postman_environment.json`
   - Click "Import"

4. **Select Environment:**
   - In the top-right dropdown, select "PourUp API Environment"

## 🚀 Getting Started

### 1. Start Your API Server

Make sure your PourUp API is running:

```bash
npm run setup  # If first time
npm run dev    # Start development server
```

### 2. Test API Health

1. Navigate to **System → Health Check**
2. Click "Send"
3. You should get a 200 response with API status

### 3. Login as Super Admin

1. Navigate to **Authentication → Login**
2. The request body is pre-filled with Super Admin credentials
3. Click "Send"
4. ✅ The JWT token will be automatically saved to your environment

## 📋 Complete Workflow Example

Follow this sequence to test the full application workflow:

### Step 1: Authentication
```
Authentication → Login (Super Admin)
```

### Step 2: Create Business
```
Business Management → Create Business (as Winery Admin)
```
**Note:** Switch to winery admin credentials first or create a winery admin user

### Step 3: Approve Business
```
Business Management → Approve Business (as Super Admin)
```

### Step 4: Create Outlet
```
Outlet Management → Create Outlet (as Winery Admin)
```

### Step 5: Create Outlet Manager
```
User Management → Create Outlet Manager (as Winery Admin)
```

### Step 6: Create Experience
```
Experience Management → Create Experience (as Outlet Manager)
```

## 🔐 Authentication & Roles

### Default Accounts

The environment comes with these pre-configured accounts:

| Role | Email | Password | Use Case |
|------|-------|----------|----------|
| Super Admin | admin@pourup.com | admin123 | System administration |
| Winery Admin | winery@pourup.com | winery123 | Business management |

### Token Management

- **Automatic:** Login requests automatically save JWT tokens
- **Manual:** You can manually set tokens in Environment variables
- **Expiry:** Tokens expire in 7 days (configurable)

### Switching Users

To test different user roles:

1. **Change login credentials** in the request body
2. **Send login request** to get new token
3. **Token is auto-saved** for subsequent requests

## 📂 Collection Structure

### 🔒 Authentication (7 endpoints)
- Login / Logout
- Register users
- Profile management
- Password changes

### 👥 User Management (5 endpoints)
- List all users (Super Admin)
- Create outlet managers
- User CRUD operations

### 🏢 Business Management (8 endpoints)
- Create/update businesses
- Approval workflow
- Business listings

### 🏪 Outlet Management (7 endpoints)
- Create/update outlets
- Outlet-business relationships
- Manager assignments

### 🎯 Experience Management (8 endpoints)
- Create/update experiences
- Time slot management
- Outlet-experience relationships

### ⚙️ System (1 endpoint)
- Health check

## 🧪 Testing Features

### Auto-Generated Test Scripts

Each request includes automatic tests for:
- ✅ Response time validation
- ✅ Status code verification  
- ✅ Content-type checking
- ✅ Response structure validation

### Environment Variables

Variables are automatically populated:
- `jwt_token` - Authentication token
- `user_id` - Current user ID
- `business_id` - Created business ID
- `outlet_id` - Created outlet ID
- `experience_id` - Created experience ID

### Pre-Request Scripts

- Auto-sets base URL if not configured
- Handles token refresh if needed

## 📝 Request Examples

### Authentication Request
```json
POST /api/auth/login
{
  "email": "{{admin_email}}",
  "password": "{{admin_password}}"
}
```

### Business Creation Request
```json
POST /api/businesses
{
  "business_name": "Sunset Valley Winery",
  "legal_business_name": "Sunset Valley Winery LLC",
  "phone_number": "+1234567890",
  "business_email": "info@sunsetvalley.com",
  "website_url": "https://sunsetvalley.com",
  "description": "Premium winery specializing in organic wines",
  "instagram_url": "https://instagram.com/sunsetvalley"
}
```

### Experience Creation Request
```json
POST /api/experiences
{
  "outlet_id": "{{outlet_id}}",
  "title": "Premium Wine Tasting Experience",
  "business_types": "tasting_room",
  "price_per_person": 45.00,
  "time_slots": [
    {
      "start_time": "10:00",
      "end_time": "11:30",
      "max_party_size": 8,
      "is_available": true
    }
  ]
}
```

## 🔧 Customization

### Environment Variables

You can modify these in your environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API server URL | `http://localhost:3000` |
| `admin_email` | Super admin email | `admin@pourup.com` |
| `admin_password` | Super admin password | `admin123` |

### Adding Custom Requests

1. **Right-click** on any folder
2. **Select "Add Request"**
3. **Configure** method, URL, headers, body
4. **Add tests** if needed

### Bulk Testing

To run all requests in sequence:
1. **Select the collection** (top level)
2. **Click "Run"** button
3. **Configure** which requests to run
4. **Start test run**

## 🐛 Troubleshooting

### Common Issues

**❌ "Could not get response"**
- Check if API server is running
- Verify `base_url` in environment
- Check firewall/network settings

**❌ "401 Unauthorized"**
- Run login request first
- Check if token is saved in environment
- Verify token hasn't expired

**❌ "403 Forbidden"**
- Check user role permissions
- Switch to appropriate user account
- Verify endpoint access requirements

**❌ "Validation failed"**
- Check request body format
- Verify required fields
- Review API documentation

### Debug Tips

1. **Check Console** - View test results and logs
2. **Inspect Environment** - Verify variable values
3. **Review Headers** - Ensure proper Content-Type
4. **Test Manually** - Try with curl or browser

## 🔍 Advanced Usage

### Scripts

**Pre-request Script Example:**
```javascript
// Set dynamic timestamp
pm.environment.set('timestamp', Date.now());

// Generate random data
pm.environment.set('random_email', 
  'user' + Math.random().toString(36).substr(2, 9) + '@example.com'
);
```

**Test Script Example:**
```javascript
// Test response structure
pm.test('Business created successfully', function () {
    const response = pm.response.json();
    pm.expect(response.status).to.eql('success');
    pm.expect(response.data.business).to.have.property('id');
    
    // Save business ID for next request
    pm.environment.set('business_id', response.data.business.id);
});
```

### Newman (CLI Testing)

Run collection from command line:

```bash
# Install Newman
npm install -g newman

# Run collection
newman run PourUp_API.postman_collection.json \
  -e PourUp_Environment.postman_environment.json \
  --reporters cli,html
```

## 📊 Monitoring

You can set up Postman monitoring to:
- 🔄 Run tests automatically
- 📧 Get email alerts for failures  
- 📈 Track API performance
- 🔍 Monitor uptime

## 📖 Additional Resources

- **[API Documentation](./API_DOCUMENTATION.md)** - Detailed endpoint docs
- **[Setup Guide](./SETUP_GUIDE.md)** - Installation instructions
- **[README](./README.md)** - Project overview

---

This Postman collection provides a complete testing environment for the PourUp API. Follow the workflow above to test all functionality systematically. 