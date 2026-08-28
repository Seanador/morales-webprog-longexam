const router = require("express").Router();
const controller = require("../controllers/supplierController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.route("/").get(authenticate, authorize("admin"), controller.getSuppliers).post(authenticate, authorize("admin"), controller.createSupplier);
router.route("/:id").get(authenticate, authorize("admin"), controller.getSupplier).put(authenticate, authorize("admin"), controller.updateSupplier).delete(authenticate, authorize("admin"), controller.deleteSupplier);

module.exports = router;
