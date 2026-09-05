import swaggerJsdoc from 'swagger-jsdoc';
import { ENV } from '../config/env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Store Rating & Management Platform API',
      version: '1.0.0',
      description:
        'Comprehensive REST API for Store Ratings, Role-Based Access (Admin, Store Owner, Normal User), Analytics and Management.',
      contact: {
        name: 'Engineering Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${ENV.PORT}`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Jonathan Christopher Davis' },
            email: { type: 'string', example: 'user@roxilerratings.com' },
            address: { type: 'string', example: '123 Tech Boulevard, Innovation District, Suite 400' },
            role: { type: 'string', enum: ['ADMIN', 'USER', 'STORE_OWNER'], example: 'USER' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Store: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Apex Electronics & Gadget Hub' },
            email: { type: 'string', example: 'store@apextech.com' },
            address: { type: 'string', example: '742 Evergreen Terrace, Tech Park' },
            overallRating: { type: 'number', example: 4.67 },
            ratingCount: { type: 'number', example: 12 },
            userRating: { type: 'number', nullable: true, example: 5 },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      '/api/health': {
        get: {
          summary: 'Service health check',
          tags: ['Health'],
          responses: {
            200: { description: 'API is healthy' },
          },
        },
      },
      '/api/auth/signup': {
        post: {
          summary: 'Register a new Normal User',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password', 'address'],
                  properties: {
                    name: { type: 'string', minLength: 20, maxLength: 60, example: 'Alexander Hamilton Junior' },
                    email: { type: 'string', format: 'email', example: 'alexander.hamilton@example.com' },
                    password: { type: 'string', minLength: 8, maxLength: 16, example: 'SecureP@ss123' },
                    address: { type: 'string', maxLength: 400, example: '456 Innovation Parkway, Suite 101' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered successfully' },
            400: { description: 'Validation failed' },
            409: { description: 'Email already exists' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Unified Login for all user roles',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'admin@roxilerratings.com' },
                    password: { type: 'string', example: 'Admin@123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful with JWT token' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/auth/change-password': {
        post: {
          summary: 'Update password for logged in user',
          tags: ['Auth'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['currentPassword', 'newPassword'],
                  properties: {
                    currentPassword: { type: 'string', example: 'Admin@123' },
                    newPassword: { type: 'string', minLength: 8, maxLength: 16, example: 'Admin@2026New' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Password changed successfully' },
            400: { description: 'Incorrect current password or invalid new password' },
          },
        },
      },
      '/api/admin/dashboard': {
        get: {
          summary: 'System Admin Dashboard statistics and analytics',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Statistics: users, stores, ratings counts, average rating and distributions' },
          },
        },
      },
      '/api/admin/users': {
        get: {
          summary: 'List users with filtering, multi-column sorting, and store owner ratings',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'role', in: 'query', schema: { type: 'string', enum: ['ALL', 'ADMIN', 'USER', 'STORE_OWNER'] } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', example: 'name' } },
            { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          ],
          responses: {
            200: { description: 'List of users' },
          },
        },
        post: {
          summary: 'Admin adds a new user (Admin, Normal User, or Store Owner)',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password', 'address', 'role'],
                  properties: {
                    name: { type: 'string', minLength: 20, maxLength: 60 },
                    email: { type: 'string' },
                    password: { type: 'string', minLength: 8, maxLength: 16 },
                    address: { type: 'string', maxLength: 400 },
                    role: { type: 'string', enum: ['ADMIN', 'USER', 'STORE_OWNER'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User created' },
          },
        },
      },
      '/api/admin/stores': {
        get: {
          summary: 'Admin list all stores with overall ratings, search and sorting',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of stores' },
          },
        },
        post: {
          summary: 'Admin adds a new store',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'address'],
                  properties: {
                    name: { type: 'string', minLength: 3, maxLength: 60 },
                    email: { type: 'string' },
                    address: { type: 'string', maxLength: 400 },
                    ownerId: { type: 'string', format: 'uuid', nullable: true },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Store created' },
          },
        },
      },
      '/api/stores': {
        get: {
          summary: 'Get all stores with average rating & current user rating',
          tags: ['Stores'],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'sortBy', in: 'query', schema: { type: 'string' } },
            { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          ],
          responses: {
            200: { description: 'List of stores' },
          },
        },
      },
      '/api/stores/owner/dashboard': {
        get: {
          summary: 'Store Owner dashboard: average rating & list of users who rated the store',
          tags: ['Store Owner'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Store stats, score distribution, and list of reviewers' },
          },
        },
      },
      '/api/ratings': {
        post: {
          summary: 'Submit or modify a store rating (1 to 5 stars)',
          tags: ['Ratings'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['storeId', 'score'],
                  properties: {
                    storeId: { type: 'string', format: 'uuid' },
                    score: { type: 'integer', minimum: 1, maximum: 5 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Rating submitted/updated successfully' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
