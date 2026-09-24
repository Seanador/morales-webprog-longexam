const router = require("express").Router();
const controller = require("../controllers/supplierController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const {
  createSupplierValidation,
  idValidation,
  updateSupplierValidation,
} = require("../middleware/validationMiddleware");

router.route("/")
  .get(authenticate, authorize("admin"), controller.getSuppliers)
  .post(createSupplierValidation, authenticate, authorize("admin"), controller.createSupplier);
router.route("/:id")
  .get(idValidation, authenticate, authorize("admin"), controller.getSupplier)
  .put(idValidation, updateSupplierValidation, authenticate, authorize("admin"), controller.updateSupplier)
  .delete(idValidation, authenticate, authorize("admin"), controller.deleteSupplier);

module.exports = router;
