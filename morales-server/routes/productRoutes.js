const router = require("express").Router();
const controller = require("../controllers/productController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { upload, validateImageContent } = require("../middleware/uploadImageMiddleware.js");
const {
  adminProductListValidation,
  createProductValidation,
  idValidation,
  productIdentifierValidation,
  productListValidation,
  updateProductValidation,
} = require("../middleware/validationMiddleware");

router.route("/")
  .get(productListValidation, controller.getProducts)
  .post(upload.single("image"), validateImageContent, createProductValidation, authenticate, authorize("admin", "supplier"), controller.createProduct);
router.get("/admin", adminProductListValidation, authenticate, authorize("admin", "supplier"), controller.getAdminProducts);
router.post(
  "/:id/upload-image",
  idValidation,
  authenticate,
  authorize("admin"),
  upload.single("image"),
  validateImageContent,
  controller.uploadProductImage,
);
router.route("/:id")
  .get(productIdentifierValidation, controller.getProduct)
  .put(idValidation, upload.single("image"), validateImageContent, updateProductValidation, authenticate, authorize("admin", "supplier"), controller.updateProduct)
  .delete(idValidation, authenticate, authorize("admin", "supplier"), controller.deleteProduct);
module.exports = router;
