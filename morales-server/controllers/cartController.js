const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const { HttpStatus } = require("../config/constants");

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "cartItems.productId",
    );
    // A newly registered user has an empty cart until their first add-to-cart action.
    res.json(cart || { userId: req.user.id, cartItems: [] });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
const saveCart = async (req, res) => {
  try {
    const cartItems = req.body.cartItems || [];
    if (!Array.isArray(cartItems)) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "cartItems must be an array." });
    }
    const productIds = cartItems.map((item) => item.productId);
    if (new Set(productIds.map(String)).size !== productIds.length) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "A product can only appear once in the cart." });
    }
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== new Set(productIds.map(String)).size) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "One or more products no longer exist." });
    }
    const invalidItem = cartItems.find((item) => !Number.isInteger(item.quantity) || item.quantity < 1);
    if (invalidItem) return res.status(HttpStatus.BAD_REQUEST).json({ message: "Each cart quantity must be at least 1." });
    const productById = new Map(products.map((product) => [String(product._id), product]));
    const overStockItem = cartItems.find((item) => item.quantity > productById.get(String(item.productId)).stockQuantity);
    if (overStockItem) {
      const product = productById.get(String(overStockItem.productId));
      return res.status(HttpStatus.BAD_REQUEST).json({ message: `Only ${product.stockQuantity} unit(s) of ${product.productName} are available.` });
    }
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { userId: req.user.id, cartItems },
      { new: true, upsert: true, runValidators: true },
    ).populate("cartItems.productId");
    res.json(cart);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
const deleteCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user.id });
    res.status(HttpStatus.NO_CONTENT).send();
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
module.exports = { getCart, saveCart, deleteCart };
