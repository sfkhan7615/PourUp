# PourUp Frontend

A modern React.js frontend application for the PourUp Winery and Outlet Management System.

## 🚀 Features

### Role-Based Access Control
- **Super Admin**: Full system management, user creation, business approvals
- **Winery Admin**: Business and outlet management, outlet manager assignment
- **Outlet Manager**: Experience creation and management for assigned outlets
- **Public Users**: Browse businesses, outlets, and experiences

### Modern UI/UX
- **Material-UI Design System**: Consistent, professional interface
- **Responsive Design**: Mobile-friendly across all screen sizes
- **Dark Mode Support**: Wine-themed color palette
- **Intuitive Navigation**: Role-based menu system

### Key Components
- **Authentication System**: JWT-based login with role detection
- **Dashboard Views**: Customized for each user role
- **CRUD Operations**: Full create, read, update, delete functionality
- **Data Tables**: Sortable, filterable, paginated data views
- **Form Validation**: Client-side validation with error handling
- **Real-time Feedback**: Toast notifications for user actions

## 📋 Prerequisites

- Node.js 16+ and npm
- PourUp Backend API running (see backend README)

## 🛠️ Installation & Setup

### 1. Clone & Install

```bash
cd frontend
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
REACT_APP_API_URL=http://localhost:3000/api
NODE_ENV=development
```

### 3. Start Development Server

```bash
npm start
```

The frontend will be available at `http://localhost:3001`

## 📱 Application Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── Layout/       # Navigation and layout
│   │   ├── auth/         # Authentication components
│   │   └── common/       # Shared UI components
│   ├── contexts/         # React contexts
│   │   └── AuthContext.js
│   ├── pages/           # Page components
│   │   ├── auth/        # Login page
│   │   ├── Dashboard/   # Role-based dashboards
│   │   ├── Business/    # Business management
│   │   ├── Outlet/      # Outlet management
│   │   ├── Experience/  # Experience management
│   │   ├── User/        # User management
│   │   └── Public/      # Public browsing pages
│   ├── services/        # API services
│   │   └── api.js
│   ├── App.js          # Main app component
│   └── index.js        # App entry point
├── package.json
└── README.md
```

## 🔑 Default Login Credentials

- **Super Admin**: `admin@pourup.com` / `admin123`
- **Winery Admin**: `winery@pourup.com` / `winery123`

## 🎯 User Workflows

### Super Admin Workflow
1. **Login** → Dashboard with system overview
2. **User Management** → Create/manage users, assign roles
3. **Business Approval** → Review and approve/reject businesses
4. **System Monitoring** → View statistics and pending actions

### Winery Admin Workflow
1. **Login** → Dashboard with business overview
2. **Create Business** → Add new winery business
3. **Create Outlets** → Add tasting rooms, vineyards
4. **Assign Managers** → Create outlet manager accounts
5. **Manage Content** → Update business/outlet information

### Outlet Manager Workflow
1. **Login** → Dashboard with assigned outlets
2. **Create Experiences** → Add wine tastings, tours
3. **Manage Time Slots** → Set availability and capacity
4. **Update Pricing** → Adjust experience costs

### Public User Experience
1. **Browse Businesses** → Discover wineries and vineyards
2. **Find Outlets** → Locate tasting rooms and facilities
3. **Book Experiences** → View and book wine experiences
4. **Get Information** → Access contact details and hours

## 🔧 Available Scripts

```bash
# Development
npm start          # Start dev server (localhost:3001)
npm run build      # Build for production
npm test           # Run test suite
npm run eject      # Eject from Create React App

# Linting & Formatting
npm run lint       # Run ESLint
npm run format     # Format with Prettier
```

## 🎨 Design System

### Color Palette
- **Primary**: Wine Red (#722F37)
- **Secondary**: Gold (#C7B377)
- **Background**: Light Gray (#FAFAFA)
- **Text**: Dark Gray (#333)

### Typography
- **Headers**: Roboto Bold
- **Body**: Roboto Regular
- **UI Elements**: Roboto Medium

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: No text transform, 8px border radius
- **Forms**: Consistent spacing and validation
- **Tables**: Alternating row colors, hover effects

## 🔐 Authentication & Security

### JWT Token Management
- Automatic token storage in localStorage
- Token expiration handling with redirect
- Refresh token support
- Secure logout with token cleanup

### Role-Based Routing
- Protected routes based on user roles
- Automatic redirects for unauthorized access
- Role-specific menu items
- Access denied pages with clear messaging

### Input Validation
- Client-side form validation
- API error handling and display
- XSS protection through React
- CSRF protection via API

## 📊 State Management

### Context API
- **AuthContext**: User authentication and role management
- Global state for user data and permissions
- Centralized authentication methods

### Local State
- Component-level state for forms and UI
- React hooks for data fetching
- Loading and error states

## 🌐 API Integration

### Axios Configuration
- Base URL configuration
- Request/response interceptors
- Error handling and retry logic
- Loading state management

### API Services
- Modular API service files
- Type-safe request methods
- Error handling utilities
- Response data normalization

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 600px
- **Tablet**: 600px - 960px
- **Desktop**: > 960px

### Mobile Features
- Collapsible navigation drawer
- Touch-friendly buttons and forms
- Optimized table layouts
- Swipe gestures support

## 🧪 Testing

### Test Coverage
- Component rendering tests
- User interaction tests
- API integration tests
- Authentication flow tests

```bash
npm test                    # Run all tests
npm test -- --coverage     # Run with coverage
npm test -- --watch        # Watch mode
```

## 🚀 Production Build

### Build Optimization
- Code splitting and lazy loading
- Asset optimization and compression
- Bundle size analysis
- Performance optimizations

```bash
npm run build              # Create production build
npm run analyze           # Analyze bundle size
```

### Deployment
- Static file hosting (Netlify, Vercel)
- Docker containerization
- Environment-specific builds
- CI/CD pipeline integration

## 🔍 Development Tips

### Hot Reloading
- Automatic browser refresh on changes
- Preserved application state
- Fast rebuild times

### Developer Tools
- React Developer Tools
- Redux DevTools (if using Redux)
- Network tab for API debugging
- Console logging for development

### Best Practices
- Component composition over inheritance
- Custom hooks for reusable logic
- Prop validation with PropTypes
- Consistent file and folder naming

## 🐛 Troubleshooting

### Common Issues

**API Connection Errors**
```bash
# Check backend is running
curl http://localhost:3000/api/health

# Verify CORS settings
# Check network tab in browser dev tools
```

**Authentication Issues**
```bash
# Clear browser storage
localStorage.clear()

# Check token expiration
# Verify backend JWT configuration
```

**Build Failures**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version compatibility
node --version
```

### Debug Mode
```bash
# Enable detailed logging
REACT_APP_DEBUG=true npm start

# Run with source maps
npm start --source-map
```

## 📖 Additional Resources

- [React Documentation](https://reactjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [Create React App Guide](https://create-react-app.dev/)
- [Backend API Documentation](../API_DOCUMENTATION.md)

## 🤝 Contributing

1. Follow React best practices
2. Use TypeScript for new components
3. Write tests for new features
4. Follow the established design system
5. Update documentation as needed

---

This React frontend provides a complete, modern interface for the PourUp system with role-based access control and comprehensive functionality for all user types. 