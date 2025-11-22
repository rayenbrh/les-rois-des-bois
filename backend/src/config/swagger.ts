export default {
  openapi: '3.0.0',
  info: {
    title: 'Les Rois des Bois API',
    version: '1.0.0',
    description: 'Production-ready MERN backend for Les Rois des Bois - Furniture e-commerce platform with Arabic support',
    contact: {
      name: 'API Support',
      email: 'support@lesroisdebois.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
    {
      url: 'https://api.lesroisdebois.com',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Products',
      description: 'Product management endpoints',
    },
    {
      name: 'Orders',
      description: 'Order management endpoints',
    },
    {
      name: 'Invoices',
      description: 'Invoice management endpoints',
    },
    {
      name: 'Analytics',
      description: 'Analytics and reporting endpoints',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          role: {
            type: 'string',
            enum: ['admin', 'client', 'store', 'commercial'],
          },
          phone: {
            type: 'string',
          },
          address: {
            type: 'string',
          },
          locale: {
            type: 'string',
            default: 'ar',
          },
          isActive: {
            type: 'boolean',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Product: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },
          title: {
            type: 'object',
            properties: {
              ar: { type: 'string' },
              en: { type: 'string' },
              fr: { type: 'string' },
            },
          },
          description: {
            type: 'object',
            properties: {
              ar: { type: 'string' },
              en: { type: 'string' },
              fr: { type: 'string' },
            },
          },
          sku: {
            type: 'string',
          },
          price: {
            type: 'object',
            properties: {
              retail: { type: 'number' },
            },
          },
          bulkPrices: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                minQty: { type: 'number' },
                price: { type: 'number' },
              },
            },
          },
          isSpecial: {
            type: 'boolean',
          },
        },
      },
      Order: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },
          orderNumber: {
            type: 'string',
          },
          clientId: {
            type: 'string',
          },
          lines: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
          total: {
            type: 'number',
          },
          status: {
            type: 'string',
            enum: ['new', 'processing', 'ready', 'shipped', 'delivered', 'cancelled'],
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
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
};
