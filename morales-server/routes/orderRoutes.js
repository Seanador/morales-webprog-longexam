const router = require("express").Router();
const controller = require("../controllers/orderController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
router.route("/").get(authenticate, controller.getOrders).post(authenticate, authorize("customer"), controller.createOrder);
router.route("/:id").get(authenticate, controller.getOrder).put(authenticate, authorize("admin", "supplier"), controller.updateOrder);
router.patch("/:id/cancel", authenticate, authorize("customer"), controller.cancelOrder);
router.patch("/:id/collect", authenticate, authorize("customer"), controller.collectOrder);
module.exports = router;
