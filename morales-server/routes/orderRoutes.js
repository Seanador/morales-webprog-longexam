const router = require("express").Router();
const controller = require("../controllers/orderController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { orderCreationLimiter } = require("../middleware/rateLimiterMiddleware");
const {
  createOrderValidation,
  idValidation,
  orderListValidation,
  updateOrderValidation,
} = require("../middleware/validationMiddleware");

router.route("/")
  .get(orderListValidation, authenticate, controller.getOrders)
  .post(createOrderValidation, authenticate, authorize("customer"), orderCreationLimiter, controller.createOrder);
router.route("/:id")
  .get(idValidation, authenticate, controller.getOrder)
  .put(idValidation, updateOrderValidation, authenticate, authorize("admin", "supplier"), controller.updateOrder);
router.patch("/:id/cancel", idValidation, authenticate, authorize("customer"), controller.cancelOrder);
router.patch("/:id/collect", idValidation, authenticate, authorize("customer"), controller.collectOrder);
module.exports = router;
