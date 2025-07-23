const Joi = require('joi');

/**
 * Request validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {String} source - Request property to validate ('body', 'params', 'query')
 * @returns {Function} Middleware function
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }

    // Replace request data with validated and sanitized data
    req[source] = value;
    next();
  };
};

// Common validation schemas
const commonSchemas = {
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid ID format',
    'any.required': 'ID is required'
  }),

  email: Joi.string().email().max(255).required().messages({
    'string.email': 'Valid email address is required',
    'string.max': 'Email address must not exceed 255 characters'
  }),

  password: Joi.string().min(8).max(255).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 255 characters'
  }),

  phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]{10,20}$/).messages({
    'string.pattern.base': 'Invalid phone number format'
  }),

  url: Joi.string().uri().max(500).messages({
    'string.uri': 'Invalid URL format',
    'string.max': 'URL must not exceed 500 characters'
  }),

  businessTypes: Joi.array().items(
    Joi.string().valid('winery', 'vineyard', 'tasting_room')
  ).min(1).required().messages({
    'array.min': 'At least one business type must be selected',
    'any.only': 'Invalid business type'
  }),

  timeSlot: Joi.object({
    start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
      'string.pattern.base': 'Start time must be in HH:MM format'
    }),
    end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
      'string.pattern.base': 'End time must be in HH:MM format'
    }),
    max_party_size: Joi.number().integer().min(1).max(100).required().messages({
      'number.min': 'Max party size must be at least 1',
      'number.max': 'Max party size cannot exceed 100'
    }),
    is_available: Joi.boolean().default(true)
  }),

  operationHours: Joi.object({
    monday: Joi.object({
      start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null),
      end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null),
      is_closed: Joi.boolean().default(true)
    }),
    tuesday: Joi.object({
      start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null),
      end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null),
      is_closed: Joi.boolean().default(true)
    }),
    wednesday: Joi.object({
      start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null),
      end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null),
      is_closed: Joi.boolean().default(true)
    }),
    thursday: Joi.object({
      start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null),
      end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null),
      is_closed: Joi.boolean().default(true)
    }),
    friday: Joi.object({
      start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null),
      end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null),
      is_closed: Joi.boolean().default(true)
    }),
    saturday: Joi.object({
      start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null),
      end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null),
      is_closed: Joi.boolean().default(true)
    }),
    sunday: Joi.object({
      start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null),
      end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null),
      is_closed: Joi.boolean().default(true)
    })
  })
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    first_name: Joi.string().min(2).max(100).required(),
    last_name: Joi.string().min(2).max(100).required(),
    email: commonSchemas.email,
    password: commonSchemas.password,
    confirm_password: Joi.any().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match'
    }),
    date_of_birth: Joi.date().iso().max('now').optional(),
    phone_number: commonSchemas.phone.optional()
  }),

  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required()
  }),

  createOutletManager: Joi.object({
    outlet_id: commonSchemas.id,
    first_name: Joi.string().min(2).max(100).required(),
    last_name: Joi.string().min(2).max(100).required(),
    email: commonSchemas.email,
    password: commonSchemas.password,
    confirm_password: Joi.any().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match'
    }),
    date_of_birth: Joi.date().iso().max('now').required()
  })
};

// Business validation schemas
const businessSchemas = {
  create: Joi.object({
    business_name: Joi.string().min(2).max(255).required(),
    legal_business_name: Joi.string().min(2).max(255).required(),
    phone_number: commonSchemas.phone.required(),
    business_email: commonSchemas.email,
    website_url: commonSchemas.url.optional(),
    description: Joi.string().max(2000).optional(),
    primary_title: Joi.string().max(100).optional(),
    job_title: Joi.string().max(100).optional(),
    instagram_url: commonSchemas.url.optional(),
    facebook_url: commonSchemas.url.optional(),
    linkedin_url: commonSchemas.url.optional(),
    yelp_url: commonSchemas.url.optional(),
    logo_images: Joi.array().items(Joi.string()).optional()
  }),

  update: Joi.object({
    business_name: Joi.string().min(2).max(255).optional(),
    legal_business_name: Joi.string().min(2).max(255).optional(),
    phone_number: commonSchemas.phone.optional(),
    business_email: commonSchemas.email.optional(),
    website_url: commonSchemas.url.optional(),
    description: Joi.string().max(2000).optional(),
    primary_title: Joi.string().max(100).optional(),
    job_title: Joi.string().max(100).optional(),
    instagram_url: commonSchemas.url.optional(),
    facebook_url: commonSchemas.url.optional(),
    linkedin_url: commonSchemas.url.optional(),
    yelp_url: commonSchemas.url.optional(),
    logo_images: Joi.array().items(Joi.string()).optional()
  }).min(1)
};

// Outlet validation schemas
const outletSchemas = {
  create: Joi.object({
    business_id: commonSchemas.id,
    outlet_name: Joi.string().min(2).max(255).required(),
    location: Joi.string().min(5).max(500).required(),
    ava_location: Joi.string().max(255).optional(),
    instagram_url: commonSchemas.url.optional(),
    facebook_url: commonSchemas.url.optional(),
    linkedin_url: commonSchemas.url.optional(),
    business_types: commonSchemas.businessTypes,
    operation_hours: commonSchemas.operationHours.optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    atmosphere: Joi.array().items(Joi.string()).optional(),
    soil_type: Joi.array().items(Joi.string()).optional(),
    ownership: Joi.array().items(Joi.string()).optional(),
    wine_production: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string()).optional()
  }),

  update: Joi.object({
    outlet_name: Joi.string().min(2).max(255).optional(),
    location: Joi.string().min(5).max(500).optional(),
    ava_location: Joi.string().max(255).optional(),
    instagram_url: commonSchemas.url.optional(),
    facebook_url: commonSchemas.url.optional(),
    linkedin_url: commonSchemas.url.optional(),
    business_types: commonSchemas.businessTypes.optional(),
    operation_hours: commonSchemas.operationHours.optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    atmosphere: Joi.array().items(Joi.string()).optional(),
    soil_type: Joi.array().items(Joi.string()).optional(),
    ownership: Joi.array().items(Joi.string()).optional(),
    wine_production: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string()).optional()
  }).min(1)
};

// Experience validation schemas
const experienceSchemas = {
  create: Joi.object({
    outlet_id: commonSchemas.id,
    title: Joi.string().min(2).max(255).required(),
    business_types: Joi.string().valid('winery', 'vineyard', 'tasting_room').required(),
    price_per_person: Joi.number().precision(2).min(0).required(),
    description: Joi.string().max(2000).optional(),
    images: Joi.array().items(Joi.string()).optional(),
    menu_item_title: Joi.string().max(255).optional(),
    menu_item_description: Joi.string().max(2000).optional(),
    time_slots: Joi.array().items(commonSchemas.timeSlot).min(1).required()
  }),

  update: Joi.object({
    title: Joi.string().min(2).max(255).optional(),
    business_types: Joi.string().valid('winery', 'vineyard', 'tasting_room').optional(),
    price_per_person: Joi.number().precision(2).min(0).optional(),
    description: Joi.string().max(2000).optional(),
    images: Joi.array().items(Joi.string()).optional(),
    menu_item_title: Joi.string().max(255).optional(),
    menu_item_description: Joi.string().max(2000).optional(),
    time_slots: Joi.array().items(commonSchemas.timeSlot).min(1).optional()
  }).min(1)
};

// Parameter validation schemas
const paramSchemas = {
  id: Joi.object({
    id: commonSchemas.id
  }),
  outletId: Joi.object({
    outletId: commonSchemas.id
  }),
  outletIdAndManagerId: Joi.object({
    outletId: commonSchemas.id,
    managerId: commonSchemas.id
  })
};

// Website validation schemas
const websiteSchemas = {
  signup: Joi.object({
    first_name: Joi.string().min(2).max(100).required(),
    last_name: Joi.string().min(2).max(100).required(),
    email: commonSchemas.email,
    password: commonSchemas.password,
    date_of_birth: Joi.date().iso().max('now').required()
  }),

  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required()
  }),

  updateLocation: Joi.object({
    location: Joi.string().min(2).max(255).required()
  }),

  createBooking: Joi.object({
    experience_id: commonSchemas.id,
    party_size: Joi.number().integer().min(1).max(50).required(),
    booking_date: Joi.date().iso().greater('now').required(),
    booking_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    special_requests: Joi.string().max(500).optional()
  }),

  outletId: Joi.object({
    id: commonSchemas.id
  }),

  experienceId: Joi.object({
    id: commonSchemas.id
  }),

  bookingId: Joi.object({
    id: commonSchemas.id
  })
};

// Booking schemas
const bookingSchemas = {
  updateStatus: Joi.object({
    status: Joi.string()
      .valid('confirmed', 'rejected', 'completed', 'cancelled')
      .required(),
    notes: Joi.string().allow('', null)
  }),
};

module.exports = {
  validate,
  commonSchemas,
  userSchemas,
  businessSchemas,
  outletSchemas,
  experienceSchemas,
  paramSchemas,
  websiteSchemas,
  bookingSchemas
}; 