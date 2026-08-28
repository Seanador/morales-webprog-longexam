require("dotenv").config();

const mongoose = require("mongoose");
const Supplier = require("../models/supplierModel");
const Product = require("../models/productModel");

const suppliers = [
  { supplierName: "Nike", supplierEmail: "nike@example.com", supplierPhone: "09171234567", supplierAddress: "Manila, Philippines" },
  { supplierName: "Adidas", supplierEmail: "adidas@example.com", supplierPhone: "09181234567", supplierAddress: "Quezon City, Philippines" },
  { supplierName: "Puma", supplierEmail: "puma@example.com", supplierPhone: "09191234567", supplierAddress: "Makati, Philippines" },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "bulldogsExchange_DB" });

  const supplierDocuments = await Promise.all(
    suppliers.map((supplier) =>
      Supplier.findOneAndUpdate(
        { supplierName: supplier.supplierName },
        supplier,
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
      ),
    ),
  );

  const products = await Product.find({ supplierId: { $exists: false } }).sort({ _id: 1 });
  for (let index = 0; index < products.length; index += 1) {
    products[index].supplierId = supplierDocuments[index % supplierDocuments.length]._id;
    await products[index].save();
  }

  console.log(`Upserted ${supplierDocuments.length} suppliers and assigned suppliers to ${products.length} existing products.`);
};

seed()
  .catch((error) => {
    console.error(`Supplier migration failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
