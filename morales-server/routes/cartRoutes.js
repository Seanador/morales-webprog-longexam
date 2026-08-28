const router = require("express").Router();
const controller = require("../controllers/cartController");
const { authenticate } = require("../middleware/authMiddleware");
// The user id comes from the verified session, never from the browser URL.
router.route("/").get(authenticate, controller.getCart).put(authenticate, controller.saveCart).delete(authenticate, controller.deleteCart);
module.exports = router;
