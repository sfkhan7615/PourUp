# PourUp - Winery and Outlet Management System API

A comprehensive Node.js API for managing wineries, outlets, and experiences with role-based access control (RBAC).

## 🚀 Features

- **Role-Based Access Control (RBAC)** with 4 user roles:
  - Super Admin: Full system access
  - Winery Admin: Business and outlet management
  - Outlet Manager: Experience management for assigned outlets
  - User: Read-only access to approved content

- **Business Management**: Create and manage winery businesses with approval workflow
- **Outlet Management**: Add outlets to businesses with detailed information
- **Experience Management**: Create experiences with time slots and pricing
- **File Upload Support**: Handle multiple images for businesses, outlets, and experiences
- **Comprehensive Validation**: Input validation with detailed error messages
- **Security Features**: JWT authentication, rate limiting, CORS protection

## 📋 Requirements

- **Node.js**: v16.0.0 or higher
- **MySQL**: v8.0 or higher
- **npm**: v8.0.0 or higher

## 🛠️ Installation & Setup

> 🚨 **Having setup issues?** Check our [Complete Setup Guide](./SETUP_GUIDE.md) for detailed troubleshooting.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pourup-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory (copy from `env.example`):

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pourup_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
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

### 4. Database Setup

1. **Create MySQL Database:**
```sql
CREATE DATABASE pourup_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Run Setup Script:**
```bash
npm run setup
```

This will:
- Create all database tables
- Set up initial Super Admin and sample Winery Admin accounts
- Create the uploads directory
- Verify database connection

### 5. Start the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

**Test Database Associations (if having issues):**
```bash
npm run test-associations
```

The API will be available at `http://localhost:3000`

## 🎯 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Super Admin |
| POST | `/login` | User login | Public |
| POST | `/logout` | User logout | Private |
| GET | `/me` | Get current user profile | Private |
| PUT | `/profile` | Update user profile | Private |
| POST | `/change-password` | Change password | Private |
| POST | `/refresh` | Refresh JWT token | Private |

### User Management Routes (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all users | Super Admin |
| GET | `/:id` | Get user by ID | Private |
| POST | `/outlet-manager` | Create outlet manager | Winery Admin |
| PUT | `/:id` | Update user | Private |
| DELETE | `/:id` | Deactivate user | Super Admin |

### Business Management Routes (`/api/businesses`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all businesses | Public/Private |
| GET | `/:id` | Get business by ID | Public/Private |
| POST | `/` | Create new business | Winery Admin |
| PUT | `/:id` | Update business | Private |
| PUT | `/:id/approve` | Approve business | Super Admin |
| PUT | `/:id/reject` | Reject business | Super Admin |
| DELETE | `/:id` | Delete business | Private |
| GET | `/pending/approval` | Get pending businesses | Super Admin |
| GET | `/my/businesses` | Get user's businesses | Winery Admin |

### Outlet Management Routes (`/api/outlets`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all outlets | Public/Private |
| GET | `/:id` | Get outlet by ID | Public |
| POST | `/` | Create new outlet | Winery Admin |
| PUT | `/:id` | Update outlet | Private |
| DELETE | `/:id` | Delete outlet | Private |
| GET | `/business/:businessId` | Get outlets by business | Public |
| GET | `/my/outlets` | Get user's outlets | Winery Admin |
| GET | `/manager/assigned` | Get assigned outlets | Outlet Manager |

### Experience Management Routes (`/api/experiences`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all experiences | Public/Private |
| GET | `/:id` | Get experience by ID | Public |
| POST | `/` | Create new experience | Outlet Manager |
| PUT | `/:id` | Update experience | Private |
| DELETE | `/:id` | Delete experience | Private |
| GET | `/outlet/:outletId` | Get experiences by outlet | Public |
| GET | `/my/experiences` | Get manager's experiences | Outlet Manager |
| PUT | `/:id/time-slots` | Update time slots | Private |

## 🔒 Authentication

### JWT Token Usage

Include the JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### User Roles

1. **Super Admin** (`super_admin`)
   - Full system access
   - User management
   - Business approval/rejection
   - All CRUD operations

2. **Winery Admin** (`winery_admin`)
   - Create and manage businesses
   - Create and manage outlets
   - Create outlet managers
   - View own resources

3. **Outlet Manager** (`outlet_manager`)
   - Manage experiences for assigned outlets
   - View assigned outlets only
   - Limited to outlet-specific operations

4. **User** (`user`)
   - Read-only access to approved content
   - Browse businesses, outlets, and experiences

## 📝 Data Models

### User
- Basic user information
- Role-based permissions
- Password encryption
- Email verification status

### Business
- Business details and contact information
- Social media links
- Logo images
- Approval workflow (pending/approved/rejected)

### Outlet
- Outlet information and location
- Business types (winery, vineyard, tasting_room)
- Operation hours (JSON format)
- Amenities, atmosphere, soil type, etc.
- Multiple images support

### Experience
- Experience details and pricing
- Menu items
- Time slots with availability
- Business type association
- Multiple images support

### OutletManager
- Junction table for outlet-manager relationships
- Assignment tracking
- Soft delete support

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API rate limiting per IP
- **CORS Protection**: Configurable CORS settings
- **Input Validation**: Comprehensive Joi validation
- **SQL Injection Protection**: Sequelize ORM parameterized queries
- **Error Handling**: Sanitized error responses

## 📊 Validation Rules

### Business Creation
- Business name: 2-255 characters
- Email: Valid email format
- Phone: Valid phone number format
- URLs: Valid URL format for social media links

### Outlet Creation
- At least one business type required
- Valid operation hours format (HH:MM)
- Location required (5-500 characters)

### Experience Creation
- Title: 2-255 characters
- Price: Non-negative decimal
- At least one time slot required
- Valid time slot format (start/end time, max party size)

## 🔧 Development

### Running Tests
```bash
npm test
```

### Code Structure
```
src/
├── config/          # Database configuration
├── middleware/      # Auth, validation, error handling
├── models/          # Sequelize models
├── routes/          # API route handlers
└── utils/           # JWT utilities
```

### Adding New Features

1. **Create Model**: Add new Sequelize model in `src/models/`
2. **Add Routes**: Create route file in `src/routes/`
3. **Add Validation**: Define Joi schemas in `src/middleware/validation.js`
4. **Update Relationships**: Modify `src/models/index.js`
5. **Test**: Add tests and update documentation

## 🚀 Production Deployment

### Environment Variables
- Set `NODE_ENV=production`
- Use strong JWT secret
- Configure proper database credentials
- Set appropriate CORS origins
- Configure file upload limits

### Security Checklist
- [ ] Strong JWT secret (minimum 32 characters)
- [ ] HTTPS enabled
- [ ] Database credentials secured
- [ ] Rate limiting configured
- [ ] File upload restrictions
- [ ] Error logging implemented
- [ ] Regular security updates

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL service is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **JWT Token Issues**
   - Check token expiration
   - Verify JWT_SECRET is set
   - Ensure proper Authorization header format

3. **File Upload Problems**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure proper content-type headers

4. **Validation Errors**
   - Check request body format
   - Verify required fields
   - Ensure proper data types

## 📚 API Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Detailed endpoint documentation with examples
- **[Postman Collection](./POSTMAN_GUIDE.md)** - Ready-to-use Postman collection for testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section

---

**Built with ❤️ for the wine industry** 