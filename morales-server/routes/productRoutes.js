const router = require("express").Router();
const controller = require("../controllers/productController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
router.route("/").get(controller.getProducts).post(authenticate, authorize("admin", "supplier"), controller.createProduct);
router.get("/admin", authenticate, authorize("admin", "supplier"), controller.getAdminProducts);
router.route("/:id").get(controller.getProduct).put(authenticate, authorize("admin", "supplier"), controller.updateProduct).delete(authenticate, authorize("admin", "supplier"), controller.deleteProduct);
module.exports = router;
