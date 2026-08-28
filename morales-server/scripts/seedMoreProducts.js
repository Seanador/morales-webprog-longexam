require("dotenv").config();

const mongoose = require("mongoose");
const Category = require("../models/categoryModel");
const Supplier = require("../models/supplierModel");
const Product = require("../models/productModel");

const connect = () =>
  mongoose.connect(process.env.MONGODB_URI, { dbName: "bulldogsExchange_DB" });

const seed = async () => {
  await connect();

  const categories = await Category.find({
    categoryName: { $in: ["Apparel", "Accessories", "Stationery"] },
  });
  const categoryByName = new Map(
    categories.map((category) => [category.categoryName, category]),
  );
  const suppliers = await Supplier.find({
    supplierName: { $in: ["Nike", "Adidas", "Puma"] },
  });
  const supplierByName = new Map(
    suppliers.map((supplier) => [supplier.supplierName, supplier]),
  );

  for (const supplierName of ["Nike", "Adidas", "Puma"]) {
    if (!supplierByName.has(supplierName)) {
      throw new Error(
        `The ${supplierName} supplier is missing. Run the main seed first.`,
      );
    }
  }

  for (const categoryName of ["Apparel", "Accessories", "Stationery"]) {
    if (!categoryByName.has(categoryName)) {
      throw new Error(
        `The ${categoryName} category is missing. Run the main seed first.`,
      );
    }
  }

  const products = [
    {
      productName: "NU Baseball Tee",
      productSlug: "nu-baseball-tee",
      productDescription:
        "Classic baseball tee featuring official NU Bulldog colors for relaxed campus wear.",
      productPrice: 449,
      categoryId: categoryByName.get("Apparel")._id,
      supplierId: supplierByName.get("Nike")._id,
      productImage: "/images/NU_baseballTee.webp",
      stockQuantity: 18,
      stockStatus: "In stock",
    },
    {
      productName: "NU Basketball Tee",
      productSlug: "nu-basketball-tee",
      productDescription:
        "Comfortable basketball-inspired tee made for game days and everyday university life.",
      productPrice: 449,
      categoryId: categoryByName.get("Apparel")._id,
      supplierId: supplierByName.get("Adidas")._id,
      productImage: "/images/NU_basketballTee_V2.webp",
      stockQuantity: 16,
      stockStatus: "In stock",
    },
    {
      productName: "NU Football Shirt",
      productSlug: "nu-football-shirt",
      productDescription:
        "Support the Bulldogs with a lightweight football shirt designed for campus events.",
      productPrice: 499,
      categoryId: categoryByName.get("Apparel")._id,
      supplierId: supplierByName.get("Puma")._id,
      productImage: "/images/NU_footballAdults.webp",
      stockQuantity: 12,
      stockStatus: "In stock",
    },
    {
      productName: "NU Lady Bulldogs Shirt",
      productSlug: "nu-lady-bulldogs-shirt",
      productDescription:
        "Official Lady Bulldogs shirt celebrating university athletics and team spirit.",
      productPrice: 399,
      categoryId: categoryByName.get("Apparel")._id,
      supplierId: supplierByName.get("Nike")._id,
      productImage: "/images/NU_ladyBulldogsVolleyball.webp",
      stockQuantity: 9,
      stockStatus: "Low stock",
    },
    {
      productName: "NU Champions Shirt",
      productSlug: "nu-champions-shirt",
      productDescription:
        "Commemorative NU shirt made for celebrating memorable Bulldog championship seasons.",
      productPrice: 499,
      categoryId: categoryByName.get("Apparel")._id,
      supplierId: supplierByName.get("Adidas")._id,
      productImage: "/images/NU_backToBackChamps.webp",
      stockQuantity: 6,
      stockStatus: "Low stock",
    },
    {
      productName: "NU Bulldog Cap",
      productSlug: "nu-bulldog-cap",
      productDescription:
        "Adjustable Bulldog cap that adds university pride to any casual outfit.",
      productPrice: 349,
      categoryId: categoryByName.get("Accessories")._id,
      supplierId: supplierByName.get("Puma")._id,
      productImage: "/images/NU_athletics_V1.webp",
      stockQuantity: 20,
      stockStatus: "In stock",
    },
    {
      productName: "NU Campus Tote Bag",
      productSlug: "nu-campus-tote-bag",
      productDescription:
        "Reusable campus tote for carrying books, essentials, and everyday university supplies.",
      productPrice: 299,
      categoryId: categoryByName.get("Accessories")._id,
      supplierId: supplierByName.get("Nike")._id,
      productImage: "/images/nubdexchange_logo.png",
      stockQuantity: 14,
      stockStatus: "In stock",
    },
    {
      productName: "Bulldog Lanyard",
      productSlug: "bulldog-lanyard",
      productDescription:
        "Durable university lanyard for IDs, keys, and everyday campus access cards.",
      productPrice: 149,
      categoryId: categoryByName.get("Accessories")._id,
      supplierId: supplierByName.get("Adidas")._id,
      productImage: "/images/NU_stickerPack.webp",
      stockQuantity: 24,
      stockStatus: "In stock",
    },
    {
      productName: "NU Water Bottle",
      productSlug: "nu-water-bottle",
      productDescription:
        "Reusable water bottle for staying hydrated through classes, training, and campus activities.",
      productPrice: 399,
      categoryId: categoryByName.get("Accessories")._id,
      supplierId: supplierByName.get("Puma")._id,
      productImage: "/images/NU_bulldogsHoodie.webp",
      stockQuantity: 8,
      stockStatus: "Low stock",
    },
    {
      productName: "NU Campus Notebook",
      productSlug: "nu-campus-notebook",
      productDescription:
        "Hardcover notebook for lectures, study plans, project notes, and campus ideas.",
      productPrice: 199,
      categoryId: categoryByName.get("Stationery")._id,
      supplierId: supplierByName.get("Nike")._id,
      productImage: "/images/NU_stickerPack.webp",
      stockQuantity: 30,
      stockStatus: "In stock",
    },
    {
      productName: "Bulldog Study Planner",
      productSlug: "bulldog-study-planner",
      productDescription:
        "Practical academic planner for organizing classes, deadlines, and university activities.",
      productPrice: 249,
      categoryId: categoryByName.get("Stationery")._id,
      supplierId: supplierByName.get("Adidas")._id,
      productImage: "/images/NU_stickerPack.webp",
      stockQuantity: 11,
      stockStatus: "In stock",
    },
    {
      productName: "NU Desk Sticker Set",
      productSlug: "nu-desk-sticker-set",
      productDescription:
        "University-themed sticker set for decorating notebooks, laptops, and study spaces.",
      productPrice: 99,
      categoryId: categoryByName.get("Stationery")._id,
      supplierId: supplierByName.get("Puma")._id,
      productImage: "/images/NU_stickerPack.webp",
      stockQuantity: 0,
      stockStatus: "Out of stock",
    },
  ];

  const existingProduct = await Product.findOne({
    productSlug: { $in: products.map((product) => product.productSlug) },
  });
  if (existingProduct) {
    throw new Error(
      `Additional products were not inserted because ${existingProduct.productSlug} already exists.`,
    );
  }

  await Product.create(products);
  console.log("Inserted 12 additional university merchandise products.");
};

seed()
  .catch((error) => {
    console.error(`Additional product seeding failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
