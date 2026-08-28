const router = require("express").Router();
const controller = require("../controllers/orderController");
const { authenticate } = require("../middleware/authMiddleware");
router.route("/").get(authenticate, controller.getOrders).post(authenticate, controller.createOrder);
router.route("/:id").get(authenticate, controller.getOrder).put(authenticate, controller.updateOrder);
router.patch("/:id/cancel", authenticate, controller.cancelOrder);
router.patch("/:id/collect", authenticate, controller.collectOrder);
module.exports = router;
