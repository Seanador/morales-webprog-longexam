const router = require("express").Router();
const controller = require("../controllers/productController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
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
  .post(createProductValidation, authenticate, authorize("admin", "supplier"), controller.createProduct);
router.get("/admin", adminProductListValidation, authenticate, authorize("admin", "supplier"), controller.getAdminProducts);
router.route("/:id")
  .get(productIdentifierValidation, controller.getProduct)
  .put(idValidation, updateProductValidation, authenticate, authorize("admin", "supplier"), controller.updateProduct)
  .delete(idValidation, authenticate, authorize("admin", "supplier"), controller.deleteProduct);
module.exports = router;
