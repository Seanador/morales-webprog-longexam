const router = require("express").Router();
const controller = require("../controllers/categoryController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const {
  createCategoryValidation,
  idValidation,
  updateCategoryValidation,
} = require("../middleware/validationMiddleware");

router.route("/")
  .get(controller.getCategories)
  .post(createCategoryValidation, authenticate, authorize("admin"), controller.createCategory);
router.route("/:id")
  .get(idValidation, controller.getCategory)
  .put(idValidation, updateCategoryValidation, authenticate, authorize("admin"), controller.updateCategory)
  .delete(idValidation, authenticate, authorize("admin"), controller.deleteCategory);
module.exports = router;
