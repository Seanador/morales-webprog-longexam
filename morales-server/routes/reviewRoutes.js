const router = require("express").Router();
const controller = require("../controllers/reviewController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
router.route("/").get(controller.getReviews).post(authenticate, authorize("customer"), controller.createReview);
router.get("/mine", authenticate, authorize("customer"), controller.getMyReviews);
router.get("/manage", authenticate, authorize("admin", "supplier"), controller.getManagedReviews);
router.route("/:id").put(authenticate, authorize("customer", "admin"), controller.updateReview).delete(authenticate, authorize("customer", "admin"), controller.deleteReview);
module.exports = router;
