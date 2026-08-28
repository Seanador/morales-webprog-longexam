require("dotenv").config();

const mongoose = require("mongoose");
const Category = require("../models/categoryModel");
const Supplier = require("../models/supplierModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Review = require("../models/reviewModel");

const connect = () => mongoose.connect(process.env.MONGODB_URI, { dbName: "bulldogsExchange_DB" });

const seed = async () => {
  await connect();

  const collections = [Category, Supplier, Product, User, Cart, Order, Review];
  const documentCount = await Promise.all(collections.map((model) => model.countDocuments()));
  if (documentCount.some((count) => count > 0)) {
    throw new Error("Sample data was not inserted because one or more collections already contains data.");
  }

  const categories = await Category.create([
    { categoryName: "Apparel", categoryDescription: "Official University clothing and campus wear." },
    { categoryName: "Accessories", categoryDescription: "Useful University everyday accessories." },
    { categoryName: "Stationery", categoryDescription: "Study and classroom essentials." },
  ]);

  const suppliers = await Supplier.create([
    { supplierName: "Nike", supplierEmail: "nike@example.com", supplierPhone: "09171234567", supplierAddress: "Manila, Philippines" },
    { supplierName: "Adidas", supplierEmail: "adidas@example.com", supplierPhone: "09181234567", supplierAddress: "Quezon City, Philippines" },
    { supplierName: "Puma", supplierEmail: "puma@example.com", supplierPhone: "09191234567", supplierAddress: "Makati, Philippines" },
  ]);

  const products = await Product.create([
    {
      productName: "NU Athletics Shirt", productSlug: "nu-athletics-shirt",
      productDescription: "Comfortable official NU Athletics shirt for everyday campus wear.",
      productPrice: 399, categoryId: categories[0]._id, supplierId: suppliers[0]._id, productImage: "/images/NU_athletics_V1.webp",
      stockQuantity: 25, stockStatus: "In stock",
    },
    {
      productName: "Bulldog Hoodie", productSlug: "bulldog-hoodie",
      productDescription: "Soft and cozy hoodie with an NU Bulldog graphic.",
      productPrice: 749, categoryId: categories[1]._id, supplierId: suppliers[1]._id, productImage: "/images/NU_bulldogsHoodie.webp",
      stockQuantity: 7, stockStatus: "Low stock",
    },
    {
      productName: "NU Sticker Pack", productSlug: "nu-sticker-pack",
      productDescription: "A collection of official NU stickers for your laptop, water bottle, or notebook.",
      productPrice: 129, categoryId: categories[2]._id, supplierId: suppliers[2]._id, productImage: "/images/NU_stickerPack.webp",
      stockQuantity: 0, stockStatus: "Out of stock",
    },
    {
      productName: "NU Volleyball Shirt", productSlug: "nu-volleyball-shirt",
      productDescription: "Comfortable official NU Volleyball shirt for everyday campus wear.",
      productPrice: 399, categoryId: categories[0]._id, supplierId: suppliers[0]._id, productImage: "/images/NU_volleyballShirt.webp",
      stockQuantity: 25, stockStatus: "In stock",
    },
  ]);

  const users = await User.create([
    { firstName: "Sean", lastName: "Morales", email: "sean.morales@example.com", passwordHash: "SamplePass123!" },
    { firstName: "Mark", lastName: "Belicano", email: "mark.belicano@example.com", passwordHash: "SamplePass123!" },
    { firstName: "Will", lastName: "Cando", email: "will.cando@example.com", passwordHash: "SamplePass123!" },
    { firstName: "Page", lastName: "Aurellano", email: "page.aurellano@example.com", passwordHash: "SamplePass!123!" },
  ]);

  await Cart.create([
    { userId: users[0]._id, cartItems: [{ productId: products[0]._id, quantity: 2 }] },
    { userId: users[1]._id, cartItems: [{ productId: products[1]._id, quantity: 1 }] },
    { userId: users[2]._id, cartItems: [{ productId: products[2]._id, quantity: 1 }] },
    { userId: users[3]._id, cartItems: [{ productId: products[3]._id, quantity: 1 }] },
  ]);

  await Order.create([
    { userId: users[0]._id, orderItems: [{ productId: products[0]._id, productName: products[0].productName, productPrice: 399, quantity: 1 }], totalAmount: 399, orderStatus: "Completed", pickupDetails: "NU Manila Campus Store" },
    { userId: users[1]._id, orderItems: [{ productId: products[1]._id, productName: products[1].productName, productPrice: 249, quantity: 1 }], totalAmount: 249, orderStatus: "Ready for pickup", pickupDetails: "NU Manila Campus Store" },
    { userId: users[2]._id, orderItems: [{ productId: products[2]._id, productName: products[2].productName, productPrice: 129, quantity: 2 }], totalAmount: 258, orderStatus: "Pending", pickupDetails: "NU Manila Campus Store" },
    { userId: users[3]._id, orderItems: [{ productId: products[3]._id, productName: products[3].productName, productPrice: 199, quantity: 1 }], totalAmount: 199, orderStatus: "Pending", pickupDetails: "NU Manila Campus Store" },
  ]);

  await Review.create([
    { productId: products[0]._id, userId: users[0]._id, reviewRating: 5, reviewComment: "Comfortable and true to size." },
    { productId: products[1]._id, userId: users[1]._id, reviewRating: 4, reviewComment: "Good quality hoodie." },
    { productId: products[2]._id, userId: users[2]._id, reviewRating: 5, reviewComment: "Great stickers for my laptop!" },
    { productId: products[3]._id, userId: users[3]._id, reviewRating: 4, reviewComment: "Bang for my buck!" },
  ]);

  let validationEnforced = false;
  try {
    await Product.create({ productName: "Invalid sample" });
  } catch (error) {
    validationEnforced = error.name === "ValidationError";
  }
  if (!validationEnforced) throw new Error("Required-field validation check failed.");

  const [cart, order, review] = await Promise.all([
    Cart.findOne().populate("userId cartItems.productId"),
    Order.findOne().populate("userId orderItems.productId"),
    Review.findOne().populate("userId productId"),
  ]);
  if (!cart.userId || !cart.cartItems[0].productId || !order.userId || !order.orderItems[0].productId || !review.userId || !review.productId) {
    throw new Error("Reference validation check failed.");
  }

  console.log("Inserted 3 sample documents into every collection.");
  console.log("Required-field validation and ObjectId relationship checks passed.");
};

seed()
  .catch((error) => { console.error(`Seeding failed: ${error.message}`); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
