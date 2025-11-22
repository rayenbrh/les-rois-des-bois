import { Request, Response, NextFunction } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import { UserRole, OrderStatus, SaleMode, StockPolicy, CompositeGenerationType } from '../types';

/**
 * Common validation schemas
 */
export const commonValidations = {
  objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  email: Joi.string().email().lowercase().trim(),
  password: Joi.string().min(8).max(128),
  phone: Joi.string().trim(),
  locale: Joi.string().valid('ar', 'en', 'fr'),
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  },
  localizedString: Joi.object({
    ar: Joi.string().required(),
    en: Joi.string(),
    fr: Joi.string(),
  }),
};

/**
 * Auth validations
 */
export const authValidations = {
  register: celebrate({
    [Segments.BODY]: Joi.object({
      email: commonValidations.email.required(),
      password: commonValidations.password.required(),
      name: Joi.string().required().trim(),
      role: Joi.string()
        .valid(...Object.values(UserRole))
        .required(),
      phone: commonValidations.phone,
      address: Joi.string().trim(),
      locale: commonValidations.locale,
      assignedCommercial: commonValidations.objectId,
      storeId: commonValidations.objectId,
    }),
  }),

  login: celebrate({
    [Segments.BODY]: Joi.object({
      email: commonValidations.email.required(),
      password: Joi.string().required(),
    }),
  }),

  refresh: celebrate({
    [Segments.BODY]: Joi.object({
      refreshToken: Joi.string().required(),
    }),
  }),
};

/**
 * User validations
 */
export const userValidations = {
  create: celebrate({
    [Segments.BODY]: Joi.object({
      email: commonValidations.email.required(),
      password: commonValidations.password.required(),
      name: Joi.string().required().trim(),
      role: Joi.string()
        .valid(...Object.values(UserRole))
        .required(),
      phone: commonValidations.phone,
      address: Joi.string().trim(),
      locale: commonValidations.locale,
      assignedCommercial: commonValidations.objectId,
      storeId: commonValidations.objectId,
      isActive: Joi.boolean(),
    }),
  }),

  update: celebrate({
    [Segments.PARAMS]: Joi.object({
      id: commonValidations.objectId.required(),
    }),
    [Segments.BODY]: Joi.object({
      name: Joi.string().trim(),
      phone: commonValidations.phone,
      address: Joi.string().trim(),
      locale: commonValidations.locale,
      isActive: Joi.boolean(),
      assignedCommercial: commonValidations.objectId,
    }),
  }),

  assignCommercial: celebrate({
    [Segments.PARAMS]: Joi.object({
      id: commonValidations.objectId.required(),
    }),
    [Segments.BODY]: Joi.object({
      commercialId: commonValidations.objectId.required(),
    }),
  }),
};

/**
 * Category validations
 */
export const categoryValidations = {
  create: celebrate({
    [Segments.BODY]: Joi.object({
      name: commonValidations.localizedString.required(),
      slug: Joi.string().lowercase().trim(),
      parentId: commonValidations.objectId,
    }),
  }),

  update: celebrate({
    [Segments.PARAMS]: Joi.object({
      id: commonValidations.objectId.required(),
    }),
    [Segments.BODY]: Joi.object({
      name: commonValidations.localizedString,
      slug: Joi.string().lowercase().trim(),
      parentId: commonValidations.objectId,
    }),
  }),
};

/**
 * SubProduct validations
 */
export const subProductValidations = {
  create: celebrate({
    [Segments.BODY]: Joi.object({
      title: commonValidations.localizedString.required(),
      sku: Joi.string().required().trim(),
      extraPrice: Joi.number().min(0),
      stock: Joi.number().integer().min(0).required(),
      metadata: Joi.object(),
    }),
  }),

  update: celebrate({
    [Segments.PARAMS]: Joi.object({
      id: commonValidations.objectId.required(),
    }),
    [Segments.BODY]: Joi.object({
      title: commonValidations.localizedString,
      sku: Joi.string().trim(),
      extraPrice: Joi.number().min(0),
      stock: Joi.number().integer().min(0),
      metadata: Joi.object(),
    }),
  }),
};

/**
 * Product validations
 */
export const productValidations = {
  create: celebrate({
    [Segments.BODY]: Joi.object({
      title: commonValidations.localizedString.required(),
      description: commonValidations.localizedString.required(),
      sku: Joi.string().required().trim(),
      price: Joi.object({
        retail: Joi.number().min(0).required(),
      }).required(),
      bulkPrices: Joi.array().items(
        Joi.object({
          minQty: Joi.number().integer().min(1).required(),
          price: Joi.number().min(0).required(),
        })
      ),
      cost: Joi.number().min(0).required(),
      categories: Joi.array().items(commonValidations.objectId),
      isSpecial: Joi.boolean(),
      stockPolicy: Joi.string().valid(...Object.values(StockPolicy)),
      specialConfig: Joi.object({
        components: Joi.array().items(
          Joi.object({
            name: Joi.string().required(),
            subProductIds: Joi.array().items(commonValidations.objectId).required(),
          })
        ),
        combinationImages: Joi.array().items(
          Joi.object({
            keys: Joi.object().pattern(Joi.string(), Joi.string()),
            imagePath: Joi.string().required(),
          })
        ),
        compositeGeneration: Joi.string().valid(...Object.values(CompositeGenerationType)),
      }),
    }),
  }),

  update: celebrate({
    [Segments.PARAMS]: Joi.object({
      id: commonValidations.objectId.required(),
    }),
    [Segments.BODY]: Joi.object({
      title: commonValidations.localizedString,
      description: commonValidations.localizedString,
      sku: Joi.string().trim(),
      price: Joi.object({
        retail: Joi.number().min(0),
      }),
      bulkPrices: Joi.array().items(
        Joi.object({
          minQty: Joi.number().integer().min(1).required(),
          price: Joi.number().min(0).required(),
        })
      ),
      cost: Joi.number().min(0),
      categories: Joi.array().items(commonValidations.objectId),
      isSpecial: Joi.boolean(),
      stockPolicy: Joi.string().valid(...Object.values(StockPolicy)),
      specialConfig: Joi.object({
        components: Joi.array().items(
          Joi.object({
            name: Joi.string().required(),
            subProductIds: Joi.array().items(commonValidations.objectId).required(),
          })
        ),
        combinationImages: Joi.array().items(
          Joi.object({
            keys: Joi.object().pattern(Joi.string(), Joi.string()),
            imagePath: Joi.string().required(),
          })
        ),
        compositeGeneration: Joi.string().valid(...Object.values(CompositeGenerationType)),
      }),
    }),
  }),

  query: celebrate({
    [Segments.QUERY]: Joi.object({
      ...commonValidations.pagination,
      category: commonValidations.objectId,
      search: Joi.string().trim(),
      isSpecial: Joi.boolean(),
      minPrice: Joi.number().min(0),
      maxPrice: Joi.number().min(0),
      inStock: Joi.boolean(),
    }),
  }),
};

/**
 * Order validations
 */
export const orderValidations = {
  create: celebrate({
    [Segments.BODY]: Joi.object({
      lines: Joi.array()
        .items(
          Joi.object({
            productId: commonValidations.objectId.required(),
            variantId: commonValidations.objectId,
            componentSelections: Joi.object().pattern(
              Joi.string(),
              commonValidations.objectId
            ),
            qty: Joi.number().integer().min(1).required(),
          })
        )
        .min(1)
        .required(),
      remise: Joi.number().min(0),
    }),
  }),

  updateStatus: celebrate({
    [Segments.PARAMS]: Joi.object({
      id: commonValidations.objectId.required(),
    }),
    [Segments.BODY]: Joi.object({
      status: Joi.string()
        .valid(...Object.values(OrderStatus))
        .required(),
    }),
  }),
};

/**
 * POS Sale validations
 */
export const posSaleValidations = {
  create: celebrate({
    [Segments.BODY]: Joi.object({
      storeId: commonValidations.objectId.required(),
      saleMode: Joi.string()
        .valid(...Object.values(SaleMode))
        .required(),
      lines: Joi.array()
        .items(
          Joi.object({
            productId: commonValidations.objectId.required(),
            variantId: commonValidations.objectId,
            componentSelections: Joi.object().pattern(
              Joi.string(),
              commonValidations.objectId
            ),
            qty: Joi.number().integer().min(1).required(),
          })
        )
        .min(1)
        .required(),
      remise: Joi.number().min(0),
    }),
  }),
};

/**
 * Invoice validations
 */
export const invoiceValidations = {
  markPaid: celebrate({
    [Segments.PARAMS]: Joi.object({
      id: commonValidations.objectId.required(),
    }),
    [Segments.BODY]: Joi.object({
      amount: Joi.number().min(0).required(),
      note: Joi.string().trim(),
    }),
  }),
};

/**
 * Analytics validations
 */
export const analyticsValidations = {
  sales: celebrate({
    [Segments.QUERY]: Joi.object({
      from: Joi.date(),
      to: Joi.date(),
      groupBy: Joi.string().valid('day', 'month', 'year'),
    }),
  }),
};
