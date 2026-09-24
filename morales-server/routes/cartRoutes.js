const router = require("express").Router();
const controller = require("../controllers/cartController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { saveCartValidation } = require("../middleware/validationMiddleware");

router.route("/")
  .get(authenticate, authorize("customer"), controller.getCart)
  .put(saveCartValidation, authenticate, authorize("customer"), controller.saveCart)
  .delete(authenticate, authorize("customer"), controller.deleteCart);
module.exports = router;
