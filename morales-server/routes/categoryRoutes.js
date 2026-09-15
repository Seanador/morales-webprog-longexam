const router = require("express").Router();
const controller = require("../controllers/categoryController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.route("/").get(controller.getCategories).post(authenticate, authorize("admin"), controller.createCategory);
router.route("/:id").get(controller.getCategory).put(authenticate, authorize("admin"), controller.updateCategory).delete(authenticate, authorize("admin"), controller.deleteCategory);
module.exports = router;
