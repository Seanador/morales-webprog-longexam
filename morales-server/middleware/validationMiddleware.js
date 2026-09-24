const { body, param, query, validationResult } = require("express-validator");

const USER_ROLES = ["customer", "admin", "supplier"];
const STOCK_STATUSES = ["In stock", "Low stock", "Out of stock", "Preorder"];
const ORDER_STATUSES = ["pending", "confirmed", "ready for pickup", "cancelled", "completed"];

const handleValidationErrors = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  return res.status(400).json({
    message: "Validation failed.",
    errors: result.array().map((error) => ({ field: error.path, message: error.msg })),
  });
};

const requireAtLeastOne = (fields) =>
  body().custom((_value, { req }) => {
    if (!fields.some((field) => Object.hasOwn(req.body || {}, field))) {
      throw new Error(`At least one of these fields is required: ${fields.join(", ")}.`);
    }
    return true;
  });

const idValidation = [
  param("id").isMongoId().withMessage("id must be a valid MongoDB ID."),
  handleValidationErrors,
];

const productIdentifierValidation = [
  param("id")
    .custom((value) => /^[a-f\d]{24}$/i.test(value) || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
    .withMessage("id must be a MongoDB ID or a valid product slug."),
  handleValidationErrors,
];

const registerValidation = [
  body("firstName").trim().notEmpty().withMessage("firstName is required.").isString().withMessage("firstName must be a string."),
  body("lastName").trim().notEmpty().withMessage("lastName is required.").isString().withMessage("lastName must be a string."),
  body("email").trim().notEmpty().withMessage("email is required.").isEmail().withMessage("email must be valid.").normalizeEmail(),
  body("password").isString().withMessage("password must be a string.").isLength({ min: 8 }).withMessage("password must contain at least 8 characters."),
  handleValidationErrors,
];

const loginValidation = [
  body("email").trim().notEmpty().withMessage("email is required.").isEmail().withMessage("email must be valid.").normalizeEmail(),
  body("password").notEmpty().withMessage("password is required.").isString().withMessage("password must be a string."),
  handleValidationErrors,
];

const updateUserValidation = [
  body("firstName").optional().trim().notEmpty().withMessage("firstName cannot be empty.").isString().withMessage("firstName must be a string."),
  body("lastName").optional().trim().notEmpty().withMessage("lastName cannot be empty.").isString().withMessage("lastName must be a string."),
  body("email").optional().trim().isEmail().withMessage("email must be valid.").normalizeEmail(),
  body("userRole").optional().isIn(USER_ROLES).withMessage(`userRole must be one of: ${USER_ROLES.join(", ")}.`),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean."),
  body("affiliation").optional({ nullable: true }).isMongoId().withMessage("affiliation must be a valid MongoDB ID or null."),
  requireAtLeastOne(["firstName", "lastName", "email", "userRole", "isActive", "affiliation"]),
  handleValidationErrors,
];

const productListValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer."),
  query("limit").optional().isInt({ min: 1, max: 10 }).withMessage("limit must be between 1 and 10."),
  query("sort").optional().isIn(["price", "-price", "name", "-name", "createdAt", "-createdAt"]).withMessage("sort contains an unsupported value."),
  query("category").optional().trim().notEmpty().withMessage("category cannot be empty."),
  query("supplier").optional().trim().notEmpty().withMessage("supplier cannot be empty."),
  query("search").optional().trim().notEmpty().withMessage("search cannot be empty."),
  handleValidationErrors,
];

const adminProductListValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer."),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit must be between 1 and 50."),
  query("search").optional().trim().notEmpty().withMessage("search cannot be empty."),
  query("categoryId").optional().isMongoId().withMessage("categoryId must be a valid MongoDB ID."),
  query("supplierId").optional().isMongoId().withMessage("supplierId must be a valid MongoDB ID."),
  query("active").optional().isBoolean().withMessage("active must be true or false."),
  handleValidationErrors,
];

const createProductValidation = [
  body("productName").trim().notEmpty().withMessage("productName is required."),
  body("productSlug").trim().notEmpty().withMessage("productSlug is required.").matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage("productSlug must contain lowercase letters, numbers, and hyphens only."),
  body("productDescription").trim().notEmpty().withMessage("productDescription is required."),
  body("productPrice").isFloat({ min: 0 }).withMessage("productPrice must be zero or greater."),
  body("categoryId").isMongoId().withMessage("categoryId must be a valid MongoDB ID."),
  body("supplierId").optional({ nullable: true }).isMongoId().withMessage("supplierId must be a valid MongoDB ID."),
  body("productImage").optional().isString().withMessage("productImage must be a string."),
  body("stockQuantity").isInt({ min: 0 }).withMessage("stockQuantity must be a non-negative integer."),
  body("stockStatus").optional().isIn(STOCK_STATUSES).withMessage(`stockStatus must be one of: ${STOCK_STATUSES.join(", ")}.`),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean."),
  handleValidationErrors,
];

const updateProductValidation = [
  body("productName").optional().trim().notEmpty().withMessage("productName cannot be empty."),
  body("productSlug").optional().trim().matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage("productSlug must contain lowercase letters, numbers, and hyphens only."),
  body("productDescription").optional().trim().notEmpty().withMessage("productDescription cannot be empty."),
  body("productPrice").optional().isFloat({ min: 0 }).withMessage("productPrice must be zero or greater."),
  body("categoryId").optional().isMongoId().withMessage("categoryId must be a valid MongoDB ID."),
  body("supplierId").optional({ nullable: true }).isMongoId().withMessage("supplierId must be a valid MongoDB ID."),
  body("productImage").optional().isString().withMessage("productImage must be a string."),
  body("stockQuantity").optional().isInt({ min: 0 }).withMessage("stockQuantity must be a non-negative integer."),
  body("stockStatus").optional().isIn(STOCK_STATUSES).withMessage(`stockStatus must be one of: ${STOCK_STATUSES.join(", ")}.`),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean."),
  requireAtLeastOne(["productName", "productSlug", "productDescription", "productPrice", "categoryId", "supplierId", "productImage", "stockQuantity", "stockStatus", "isActive"]),
  handleValidationErrors,
];

const createCategoryValidation = [
  body("categoryName").trim().notEmpty().withMessage("categoryName is required."),
  body("categoryDescription").optional().isString().withMessage("categoryDescription must be a string."),
  handleValidationErrors,
];

const updateCategoryValidation = [
  body("categoryName").optional().trim().notEmpty().withMessage("categoryName cannot be empty."),
  body("categoryDescription").optional().isString().withMessage("categoryDescription must be a string."),
  requireAtLeastOne(["categoryName", "categoryDescription"]),
  handleValidationErrors,
];

const saveCartValidation = [
  body("cartItems").isArray().withMessage("cartItems must be an array."),
  body("cartItems.*.productId").isMongoId().withMessage("Every productId must be a valid MongoDB ID."),
  body("cartItems.*.quantity").isInt({ min: 1 }).withMessage("Every quantity must be a positive integer."),
  handleValidationErrors,
];

const orderListValidation = [
  query("userId").optional().isMongoId().withMessage("userId must be a valid MongoDB ID."),
  handleValidationErrors,
];

const createOrderValidation = [
  body("productIds").isArray({ min: 1 }).withMessage("productIds must be a non-empty array."),
  body("productIds.*").isMongoId().withMessage("Every productId must be a valid MongoDB ID."),
  handleValidationErrors,
];

const updateOrderValidation = [
  body("orderStatus").isIn(ORDER_STATUSES).withMessage(`orderStatus must be one of: ${ORDER_STATUSES.join(", ")}.`),
  handleValidationErrors,
];

const reviewListValidation = [
  query("productId").optional().isMongoId().withMessage("productId must be a valid MongoDB ID."),
  handleValidationErrors,
];

const createReviewValidation = [
  body("orderId").isMongoId().withMessage("orderId must be a valid MongoDB ID."),
  body("productId").isMongoId().withMessage("productId must be a valid MongoDB ID."),
  body("reviewRating").isInt({ min: 1, max: 5 }).withMessage("reviewRating must be an integer from 1 to 5."),
  body("reviewComment").trim().notEmpty().withMessage("reviewComment is required."),
  handleValidationErrors,
];

const updateReviewValidation = [
  body("reviewRating").optional().isInt({ min: 1, max: 5 }).withMessage("reviewRating must be an integer from 1 to 5."),
  body("reviewComment").optional().trim().notEmpty().withMessage("reviewComment cannot be empty."),
  requireAtLeastOne(["reviewRating", "reviewComment"]),
  handleValidationErrors,
];

const createSupplierValidation = [
  body("supplierName").trim().notEmpty().withMessage("supplierName is required."),
  body("supplierEmail").trim().isEmail().withMessage("supplierEmail must be valid.").normalizeEmail(),
  body("supplierPhone").trim().notEmpty().withMessage("supplierPhone is required."),
  body("supplierAddress").trim().notEmpty().withMessage("supplierAddress is required."),
  handleValidationErrors,
];

const updateSupplierValidation = [
  body("supplierName").optional().trim().notEmpty().withMessage("supplierName cannot be empty."),
  body("supplierEmail").optional().trim().isEmail().withMessage("supplierEmail must be valid.").normalizeEmail(),
  body("supplierPhone").optional().trim().notEmpty().withMessage("supplierPhone cannot be empty."),
  body("supplierAddress").optional().trim().notEmpty().withMessage("supplierAddress cannot be empty."),
  requireAtLeastOne(["supplierName", "supplierEmail", "supplierPhone", "supplierAddress"]),
  handleValidationErrors,
];

module.exports = {
  adminProductListValidation,
  createCategoryValidation,
  createOrderValidation,
  createProductValidation,
  createReviewValidation,
  createSupplierValidation,
  idValidation,
  loginValidation,
  orderListValidation,
  productIdentifierValidation,
  productListValidation,
  registerValidation,
  reviewListValidation,
  saveCartValidation,
  updateCategoryValidation,
  updateOrderValidation,
  updateProductValidation,
  updateReviewValidation,
  updateSupplierValidation,
  updateUserValidation,
};
