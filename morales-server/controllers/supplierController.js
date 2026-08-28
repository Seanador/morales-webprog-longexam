const Supplier = require("../models/supplierModel");
const { HttpStatus } = require("../config/constants");

const getSuppliers = async (_req, res) => {
  try {
    res.json(await Supplier.find());
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(HttpStatus.NOT_FOUND).json({ message: "Supplier not found." });
    res.json(supplier);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const createSupplier = async (req, res) => {
  try {
    res.status(HttpStatus.CREATED).json(await Supplier.create(req.body));
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!supplier) return res.status(HttpStatus.NOT_FOUND).json({ message: "Supplier not found." });
    res.json(supplier);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(HttpStatus.NOT_FOUND).json({ message: "Supplier not found." });
    res.json({ message: "Supplier deleted." });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

module.exports = { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier };