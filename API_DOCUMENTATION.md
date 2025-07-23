# PourUp API Documentation

Comprehensive API documentation with request/response examples for the PourUp Winery Management System.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <jwt-token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "status": "success|error",
  "message": "Human readable message",
  "data": {
    // Response data
  },
  "errors": [
    // Array of error details (only for validation errors)
  ]
}
```

---

## Authentication Endpoints

### POST /auth/login

User login endpoint.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "first_name": "John",
      "last_name": "Doe",
      "email": "admin@example.com",
      "role": "super_admin",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/register

Register new user (Super Admin only).

**Request:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "password": "password123",
  "confirm_password": "password123",
  "role": "winery_admin",
  "phone_number": "+1234567890"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@example.com",
      "role": "winery_admin",
      "is_active": true,
      "email_verified": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### GET /auth/me

Get current user profile.

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid-here",
      "first_name": "John",
      "last_name": "Doe",
      "email": "admin@example.com",
      "role": "super_admin",
      "phone_number": "+1234567890",
      "is_active": true,
      "last_login": "2024-01-01T12:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## Business Management Endpoints

### POST /businesses

Create a new business (Winery Admin only).

**Request:**
```json
{
  "business_name": "Sunset Valley Winery",
  "legal_business_name": "Sunset Valley Winery LLC",
  "phone_number": "+1234567890",
  "business_email": "info@sunsetvalley.com",
  "website_url": "https://sunsetvalley.com",
  "description": "Premium winery specializing in organic wines",
  "primary_title": "Owner",
  "job_title": "Head Winemaker",
  "instagram_url": "https://instagram.com/sunsetvalley",
  "facebook_url": "https://facebook.com/sunsetvalley",
  "linkedin_url": "https://linkedin.com/company/sunsetvalley",
  "yelp_url": "https://yelp.com/biz/sunsetvalley",
  "logo_images": ["logo1.jpg", "logo2.jpg"]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Business created successfully and submitted for approval",
  "data": {
    "business": {
      "id": "uuid-here",
      "business_name": "Sunset Valley Winery",
      "legal_business_name": "Sunset Valley Winery LLC",
      "approval_status": "pending",
      "phone_number": "+1234567890",
      "business_email": "info@sunsetvalley.com",
      "website_url": "https://sunsetvalley.com",
      "description": "Premium winery specializing in organic wines",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "creator": {
        "id": "uuid-here",
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane@example.com"
      }
    }
  }
}
```

### GET /businesses

Get all businesses with filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by approval status (pending/approved/rejected)
- `search`: Search in business name and description
- `created_by`: Filter by creator ID

**Response:**
```json
{
  "status": "success",
  "data": {
    "businesses": [
      {
        "id": "uuid-here",
        "business_name": "Sunset Valley Winery",
        "approval_status": "approved",
        "description": "Premium winery specializing in organic wines",
        "created_at": "2024-01-01T00:00:00.000Z",
        "creator": {
          "id": "uuid-here",
          "first_name": "Jane",
          "last_name": "Smith",
          "email": "jane@example.com"
        },
        "outlets": [
          {
            "id": "uuid-here",
            "outlet_name": "Main Tasting Room",
            "location": "123 Wine Street, Napa, CA",
            "business_types": ["winery", "tasting_room"]
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### PUT /businesses/:id/approve

Approve a business (Super Admin only).

**Response:**
```json
{
  "status": "success",
  "message": "Business approved successfully",
  "data": {
    "business": {
      "id": "uuid-here",
      "business_name": "Sunset Valley Winery",
      "approval_status": "approved",
      "approved_at": "2024-01-01T12:00:00.000Z",
      "creator": {
        "id": "uuid-here",
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane@example.com"
      },
      "approver": {
        "id": "uuid-here",
        "first_name": "John",
        "last_name": "Doe",
        "email": "admin@example.com"
      }
    }
  }
}
```

---

## Outlet Management Endpoints

### POST /outlets

Create a new outlet (Winery Admin only).

**Request:**
```json
{
  "business_id": "uuid-here",
  "outlet_name": "Main Tasting Room",
  "location": "123 Wine Street, Napa, CA 94558",
  "ava_location": "Napa Valley AVA",
  "instagram_url": "https://instagram.com/sunsetvalley_tasting",
  "facebook_url": "https://facebook.com/sunsetvalley_tasting",
  "business_types": ["winery", "tasting_room"],
  "operation_hours": {
    "monday": {
      "start_time": "10:00",
      "end_time": "18:00",
      "is_closed": false
    },
    "tuesday": {
      "start_time": "10:00",
      "end_time": "18:00",
      "is_closed": false
    },
    "wednesday": {
      "start_time": null,
      "end_time": null,
      "is_closed": true
    },
    "thursday": {
      "start_time": "10:00",
      "end_time": "18:00",
      "is_closed": false
    },
    "friday": {
      "start_time": "10:00",
      "end_time": "20:00",
      "is_closed": false
    },
    "saturday": {
      "start_time": "09:00",
      "end_time": "20:00",
      "is_closed": false
    },
    "sunday": {
      "start_time": "11:00",
      "end_time": "17:00",
      "is_closed": false
    }
  },
  "amenities": ["parking", "wheelchair_accessible", "restrooms"],
  "atmosphere": ["casual", "family_friendly"],
  "soil_type": ["clay", "limestone"],
  "ownership": ["family_owned"],
  "wine_production": ["organic", "sustainable"],
  "images": ["outlet1.jpg", "outlet2.jpg"]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Outlet created successfully",
  "data": {
    "outlet": {
      "id": "uuid-here",
      "outlet_name": "Main Tasting Room",
      "location": "123 Wine Street, Napa, CA 94558",
      "business_types": ["winery", "tasting_room"],
      "operation_hours": {
        "monday": {
          "start_time": "10:00",
          "end_time": "18:00",
          "is_closed": false
        }
      },
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "business": {
        "id": "uuid-here",
        "business_name": "Sunset Valley Winery",
        "approval_status": "approved"
      },
      "creator": {
        "id": "uuid-here",
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane@example.com"
      }
    }
  }
}
```

### GET /outlets

Get all outlets with filtering.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `business_id`: Filter by business ID
- `business_types`: Filter by business type
- `search`: Search in outlet name and location
- `location`: Filter by location

**Response:**
```json
{
  "status": "success",
  "data": {
    "outlets": [
      {
        "id": "uuid-here",
        "outlet_name": "Main Tasting Room",
        "location": "123 Wine Street, Napa, CA",
        "business_types": ["winery", "tasting_room"],
        "operation_hours": {},
        "created_at": "2024-01-01T00:00:00.000Z",
        "business": {
          "id": "uuid-here",
          "business_name": "Sunset Valley Winery",
          "approval_status": "approved"
        },
        "experiences": [
          {
            "id": "uuid-here",
            "title": "Premium Wine Tasting",
            "business_types": "tasting_room",
            "price_per_person": 25.00
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "pages": 2
    }
  }
}
```

---

## User Management Endpoints

### POST /users/outlet-manager

Create outlet manager (Winery Admin only).

**Request:**
```json
{
  "outlet_id": "uuid-here",
  "first_name": "Mike",
  "last_name": "Johnson",
  "email": "mike@sunsetvalley.com",
  "password": "password123",
  "confirm_password": "password123",
  "date_of_birth": "1985-05-15"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Outlet manager created successfully",
  "data": {
    "manager": {
      "id": "uuid-here",
      "first_name": "Mike",
      "last_name": "Johnson",
      "email": "mike@sunsetvalley.com",
      "role": "outlet_manager",
      "date_of_birth": "1985-05-15",
      "is_active": true,
      "email_verified": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "outlet": {
      "id": "uuid-here",
      "outlet_name": "Main Tasting Room",
      "location": "123 Wine Street, Napa, CA"
    }
  }
}
```

---

## Experience Management Endpoints

### POST /experiences

Create new experience (Outlet Manager only).

**Request:**
```json
{
  "outlet_id": "uuid-here",
  "title": "Premium Wine Tasting Experience",
  "business_types": "tasting_room",
  "price_per_person": 45.00,
  "description": "Enjoy a guided tasting of our premium wines with cheese pairings",
  "images": ["experience1.jpg", "experience2.jpg"],
  "menu_item_title": "Artisan Cheese Board",
  "menu_item_description": "Selection of local artisan cheeses paired with our wines",
  "time_slots": [
    {
      "start_time": "10:00",
      "end_time": "11:30",
      "max_party_size": 8,
      "is_available": true
    },
    {
      "start_time": "14:00",
      "end_time": "15:30",
      "max_party_size": 12,
      "is_available": true
    },
    {
      "start_time": "16:00",
      "end_time": "17:30",
      "max_party_size": 6,
      "is_available": false
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Experience created successfully",
  "data": {
    "experience": {
      "id": "uuid-here",
      "title": "Premium Wine Tasting Experience",
      "business_types": "tasting_room",
      "price_per_person": 45.00,
      "description": "Enjoy a guided tasting of our premium wines with cheese pairings",
      "menu_item_title": "Artisan Cheese Board",
      "time_slots": [
        {
          "start_time": "10:00",
          "end_time": "11:30",
          "max_party_size": 8,
          "is_available": true
        }
      ],
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "outlet": {
        "id": "uuid-here",
        "outlet_name": "Main Tasting Room",
        "location": "123 Wine Street, Napa, CA",
        "business_types": ["winery", "tasting_room"],
        "business": {
          "id": "uuid-here",
          "business_name": "Sunset Valley Winery"
        }
      },
      "creator": {
        "id": "uuid-here",
        "first_name": "Mike",
        "last_name": "Johnson",
        "email": "mike@sunsetvalley.com"
      }
    }
  }
}
```

### GET /experiences

Get all experiences with filtering.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `outlet_id`: Filter by outlet ID
- `business_types`: Filter by business type
- `min_price`: Minimum price filter
- `max_price`: Maximum price filter
- `search`: Search in title and description

**Response:**
```json
{
  "status": "success",
  "data": {
    "experiences": [
      {
        "id": "uuid-here",
        "title": "Premium Wine Tasting Experience",
        "business_types": "tasting_room",
        "price_per_person": 45.00,
        "description": "Enjoy a guided tasting of our premium wines",
        "time_slots": [
          {
            "start_time": "10:00",
            "end_time": "11:30",
            "max_party_size": 8,
            "is_available": true
          }
        ],
        "created_at": "2024-01-01T00:00:00.000Z",
        "outlet": {
          "id": "uuid-here",
          "outlet_name": "Main Tasting Room",
          "location": "123 Wine Street, Napa, CA",
          "business_types": ["winery", "tasting_room"],
          "business": {
            "id": "uuid-here",
            "business_name": "Sunset Valley Winery",
            "approval_status": "approved"
          }
        },
        "creator": {
          "id": "uuid-here",
          "first_name": "Mike",
          "last_name": "Johnson",
          "email": "mike@sunsetvalley.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 20,
      "pages": 2
    }
  }
}
```

### PUT /experiences/:id/time-slots

Update time slots for an experience.

**Request:**
```json
{
  "time_slots": [
    {
      "start_time": "09:00",
      "end_time": "10:30",
      "max_party_size": 10,
      "is_available": true
    },
    {
      "start_time": "11:00",
      "end_time": "12:30",
      "max_party_size": 8,
      "is_available": true
    },
    {
      "start_time": "15:00",
      "end_time": "16:30",
      "max_party_size": 12,
      "is_available": false
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Time slots updated successfully",
  "data": {
    "experience": {
      "id": "uuid-here",
      "title": "Premium Wine Tasting Experience",
      "time_slots": [
        {
          "start_time": "09:00",
          "end_time": "10:30",
          "max_party_size": 10,
          "is_available": true
        }
      ],
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

---

## Error Responses

### Validation Error (400)

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email address is required",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long",
      "value": "123"
    }
  ]
}
```

### Authentication Error (401)

```json
{
  "status": "error",
  "message": "Access token is required"
}
```

### Authorization Error (403)

```json
{
  "status": "error",
  "message": "Insufficient permissions to access this resource"
}
```

### Not Found Error (404)

```json
{
  "status": "error",
  "message": "Business not found"
}
```

### Conflict Error (409)

```json
{
  "status": "error",
  "message": "User with this email already exists"
}
```

### Server Error (500)

```json
{
  "status": "error",
  "message": "Internal Server Error"
}
```

---

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address. When the limit is exceeded:

```json
{
  "status": "error",
  "message": "Too many requests from this IP, please try again later."
}
```

---

## File Uploads

File uploads are handled via multipart/form-data. Maximum file size is 5MB per file.

Supported image formats:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

Files are stored in the `/uploads` directory and referenced by filename in the database.

---

## Pagination

All list endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Pagination response format:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

---

## Search and Filtering

Most list endpoints support search and filtering:

### Search Parameters
- `search`: Text search across relevant fields
- `status`: Filter by status (where applicable)
- `created_by`: Filter by creator ID

### Business-specific Filters
- `approval_status`: pending, approved, rejected

### Outlet-specific Filters
- `business_id`: Filter by business
- `business_types`: winery, vineyard, tasting_room
- `location`: Location text search

### Experience-specific Filters
- `outlet_id`: Filter by outlet
- `business_types`: winery, vineyard, tasting_room
- `min_price`: Minimum price
- `max_price`: Maximum price

---

## Testing the API

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

**Get businesses (with token):**
```bash
curl -X GET http://localhost:3000/api/businesses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the provided Postman collection (if available)
2. Set up environment variables for base URL and token
3. Use the collection to test all endpoints

---

## SDK and Libraries

Consider using these libraries for easier API integration:

- **JavaScript/Node.js**: axios, fetch
- **Python**: requests, httpx
- **PHP**: Guzzle, cURL
- **Java**: OkHttp, Apache HttpClient
- **C#**: HttpClient, RestSharp

---

This documentation covers all major endpoints and use cases. For additional questions or clarifications, please refer to the main README.md file or contact the development team. 