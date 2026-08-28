const router = require("express").Router();
const controller = require("../controllers/reviewController");
const { authenticate } = require("../middleware/authMiddleware");
router.route("/").get(controller.getReviews).post(authenticate, controller.createReview);
router.get("/mine", authenticate, controller.getMyReviews);
router.get("/manage", authenticate, require("../middleware/authMiddleware").authorize("admin", "supplier"), controller.getManagedReviews);
router.route("/:id").put(authenticate, controller.updateReview).delete(authenticate, controller.deleteReview);
module.exports = router;
