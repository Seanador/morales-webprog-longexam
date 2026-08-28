const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const { HttpStatus } = require("../config/constants");

const populateOrder = (query) => query
  .populate("userId", "firstName lastName email")
  .populate({ path: "orderItems.productId", select: "productName categoryId supplierId", populate: [{ path: "categoryId", select: "categoryName" }, { path: "supplierId", select: "supplierName" }] });

const getOrders = async (req, res) => {
  try {
    let filter;
    if (req.user.userRole === "admin") {
      filter = req.query.userId ? { userId: req.query.userId } : {};
    } else if (req.user.userRole === "supplier") {
      const supplierProducts = await Product.find({ supplierId: req.user.affiliation }).select("_id");
      filter = { "orderItems.productId": { $in: supplierProducts.map((product) => product._id) } };
    } else {
      filter = { userId: req.user.id };
    }
    res.json(await populateOrder(Order.find(filter)).sort({ orderedAt: -1 }));
  } catch (error) { res.status(HttpStatus.BAD_REQUEST).json({ message: error.message }); }
};

const getOrder = async (req, res) => {
  try {
    const order = await populateOrder(Order.findById(req.params.id));
    if (!order) return res.status(HttpStatus.NOT_FOUND).json({ message: "Order not found." });
    if (req.user.userRole === "supplier") {
      const productIds = order.orderItems.map((item) => item.productId?._id || item.productId);
      const hasSupplierProduct = await Product.exists({ _id: { $in: productIds }, supplierId: req.user.affiliation });
      if (!hasSupplierProduct) return res.status(HttpStatus.FORBIDDEN).json({ message: "You can only access orders containing your products." });
    } else if (req.user.userRole !== "admin" && order.userId._id.toString() !== req.user.id) return res.status(HttpStatus.FORBIDDEN).json({ message: "You can only access your own orders." });
    res.json(order);
  } catch (error) { res.status(HttpStatus.BAD_REQUEST).json({ message: error.message }); }
};

// Checkout takes the saved cart and current product records, never prices or names supplied by the browser.
const createOrder = async (req, res) => {
  try {
    if (req.user.userRole !== "customer") return res.status(HttpStatus.FORBIDDEN).json({ message: "Only customers can place orders." });
    const cart = await Cart.findOne({ userId: req.user.id }).populate("cartItems.productId");
    if (!cart?.cartItems.length) return res.status(HttpStatus.BAD_REQUEST).json({ message: "Your cart is empty." });
    const productIds = req.body?.productIds;
    if (!Array.isArray(productIds) || !productIds.length) return res.status(HttpStatus.BAD_REQUEST).json({ message: "Select at least one cart item to check out." });
    const selectedProductIdSet = new Set(productIds.map(String));
    if (selectedProductIdSet.size !== productIds.length) return res.status(HttpStatus.BAD_REQUEST).json({ message: "Each item can only be selected once." });
    const selectedItems = cart.cartItems.filter((item) => selectedProductIdSet.has(String(item.productId?._id || item.productId)));
    if (selectedItems.length !== productIds.length) return res.status(HttpStatus.BAD_REQUEST).json({ message: "One or more selected items are not in your cart." });

    const reservedItems = [];
    for (const item of selectedItems) {
      const product = item.productId;
      if (!product) throw new Error("A product in your cart no longer exists.");
      // Atomic conditional decrement prevents concurrent checkouts from overselling stock.
      const reserved = await Product.findOneAndUpdate({ _id: product._id, stockQuantity: { $gte: item.quantity } }, { $inc: { stockQuantity: -item.quantity } }, { new: true });
      if (!reserved) {
        for (const previous of reservedItems) await Product.findByIdAndUpdate(previous.productId, { $inc: { stockQuantity: previous.quantity } });
        return res.status(HttpStatus.BAD_REQUEST).json({ message: `${product.productName} no longer has enough stock.` });
      }
      reservedItems.push({ productId: product._id, quantity: item.quantity, productName: product.productName, productPrice: product.productPrice });
    }

    try {
      const orderItems = reservedItems.map(({ productId, quantity, productName, productPrice }) => ({ productId, quantity, productName, productPrice }));
      const order = await Order.create({ userId: req.user.id, orderItems, totalAmount: orderItems.reduce((total, item) => total + item.productPrice * item.quantity, 0), orderStatus: "pending" });
      await Cart.findOneAndUpdate({ userId: req.user.id }, { cartItems: cart.cartItems.filter((item) => !selectedProductIdSet.has(String(item.productId?._id || item.productId))) });
      res.status(HttpStatus.CREATED).json(order);
    } catch (error) {
      for (const item of reservedItems) await Product.findByIdAndUpdate(item.productId, { $inc: { stockQuantity: item.quantity } });
      throw error;
    }
  } catch (error) { res.status(HttpStatus.BAD_REQUEST).json({ message: error.message }); }
};

const updateOrder = async (req, res) => {
  try {
    if (!["admin", "supplier"].includes(req.user.userRole)) return res.status(HttpStatus.FORBIDDEN).json({ message: "Only administrators and suppliers can update orders." });
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) return res.status(HttpStatus.NOT_FOUND).json({ message: "Order not found." });
    if (req.user.userRole === "supplier") {
      const hasSupplierProduct = await Product.exists({ _id: { $in: existingOrder.orderItems.map((item) => item.productId) }, supplierId: req.user.affiliation });
      if (!hasSupplierProduct) return res.status(HttpStatus.FORBIDDEN).json({ message: "You can only update orders containing your products." });
    }
    if (existingOrder.orderStatus === "cancelled" && req.body.orderStatus !== "cancelled") {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "Cancelled orders cannot be reopened." });
    }
    const isNewCancellation = req.body.orderStatus === "cancelled" && existingOrder.orderStatus !== "cancelled";
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { new: true, runValidators: true });
    if (!order) return res.status(HttpStatus.NOT_FOUND).json({ message: "Order not found." });
    if (isNewCancellation) {
      for (const item of order.orderItems) await Product.findByIdAndUpdate(item.productId, { $inc: { stockQuantity: item.quantity } });
    }
    res.json(order);
  } catch (error) { res.status(HttpStatus.BAD_REQUEST).json({ message: error.message }); }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate({ _id: req.params.id, userId: req.user.id, orderStatus: "pending" }, { orderStatus: "cancelled" }, { new: true });
    if (!order) return res.status(HttpStatus.BAD_REQUEST).json({ message: "Only pending orders can be cancelled." });
    for (const item of order.orderItems) await Product.findByIdAndUpdate(item.productId, { $inc: { stockQuantity: item.quantity } });
    res.json(order);
  } catch (error) { res.status(HttpStatus.BAD_REQUEST).json({ message: error.message }); }
};

const collectOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, orderStatus: "ready for pickup" },
      { orderStatus: "completed" },
      { new: true },
    );
    if (!order) return res.status(HttpStatus.BAD_REQUEST).json({ message: "Only orders ready for pickup can be collected." });
    res.json(order);
  } catch (error) { res.status(HttpStatus.BAD_REQUEST).json({ message: error.message }); }
};

module.exports = { getOrders, getOrder, createOrder, updateOrder, cancelOrder, collectOrder };
