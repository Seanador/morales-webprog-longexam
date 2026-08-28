const router = require("express").Router();
const controller = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);
router.get("/me", authenticate, controller.getCurrentUser);
router.route("/").get(authenticate, authorize("admin"), controller.getUsers);
router.route("/:id").get(authenticate, authorize("admin"), controller.getUser).put(authenticate, controller.updateUser).delete(authenticate, authorize("admin"), controller.deleteUser);
module.exports = router;
