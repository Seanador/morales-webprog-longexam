const router = require("express").Router();
const controller = require("../controllers/reviewController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { reviewCreationLimiter } = require("../middleware/rateLimiterMiddleware");
const {
  createReviewValidation,
  idValidation,
  reviewListValidation,
  updateReviewValidation,
} = require("../middleware/validationMiddleware");

router.route("/")
  .get(reviewListValidation, controller.getReviews)
  .post(createReviewValidation, authenticate, authorize("customer"), reviewCreationLimiter, controller.createReview);
router.get("/mine", authenticate, authorize("customer"), controller.getMyReviews);
router.get("/manage", authenticate, authorize("admin", "supplier"), controller.getManagedReviews);
router.route("/:id")
  .put(idValidation, updateReviewValidation, authenticate, authorize("customer", "admin"), controller.updateReview)
  .delete(idValidation, authenticate, authorize("customer", "admin"), controller.deleteReview);
module.exports = router;
