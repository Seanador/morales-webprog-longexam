const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    supplierName: { type: String, required: true, trim: true, unique: true },
    supplierEmail: { type: String, required: true, trim: true, lowercase: true },
    supplierPhone: { type: String, required: true, trim: true },
    supplierAddress: { type: String, required: true, trim: true },
  },
  { timestamps: true, collection: "suppliers" },
);

module.exports = mongoose.model("Supplier", supplierSchema);