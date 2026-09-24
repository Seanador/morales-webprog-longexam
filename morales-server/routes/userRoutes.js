const router = require("express").Router();
const controller = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiterMiddleware");
const {
  idValidation,
  loginValidation,
  registerValidation,
  updateUserValidation,
} = require("../middleware/validationMiddleware");

router.post("/register", registerLimiter, registerValidation, controller.registerUser);
router.post("/login", loginLimiter, loginValidation, controller.loginUser);
router.get("/me", authenticate, controller.getCurrentUser);
router.route("/").get(authenticate, authorize("admin"), controller.getUsers);
router.route("/:id")
  .get(idValidation, authenticate, authorize("admin"), controller.getUser)
  .put(idValidation, updateUserValidation, authenticate, controller.updateUser)
  .delete(idValidation, authenticate, authorize("admin"), controller.deleteUser);
module.exports = router;
