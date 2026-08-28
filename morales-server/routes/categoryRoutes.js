const router = require("express").Router();
const controller = require("../controllers/categoryController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
router.route("/").get(controller.getCategories).post(authenticate, authorize("admin", "supplier"), controller.createCategory);
router.route("/:id").get(controller.getCategory).put(authenticate, authorize("admin", "supplier"), controller.updateCategory).delete(authenticate, authorize("admin", "supplier"), controller.deleteCategory);
module.exports = router;
