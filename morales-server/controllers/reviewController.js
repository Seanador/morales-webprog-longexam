const Review = require("../models/reviewModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const { HttpStatus } = require("../config/constants");

const getReviews = async (req, res) => {
  try {
    const filter = req.query.productId
      ? { productId: req.query.productId }
      : {};
    res.json(
      await Review.find(filter).populate("userId", "firstName lastName"),
    );
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
const getManagedReviews = async (req, res) => {
  try {
    const filter = req.user.userRole === "admin"
      ? {}
      : { productId: { $in: (await Product.find({ supplierId: req.user.affiliation }).select("_id")).map((product) => product._id) } };
    res.json(await Review.find(filter)
      .populate("userId", "firstName lastName")
      .populate("productId", "productName supplierId"));
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
const getMyReviews = async (req, res) => {
  try {
    res.json(await Review.find({ userId: req.user.id }).select("orderId productId reviewRating reviewComment createdAt"));
  } catch (error) { res.status(HttpStatus.BAD_REQUEST).json({ message: error.message }); }
};
const createReview = async (req, res) => {
  try {
    if (req.user.userRole !== "customer") return res.status(HttpStatus.FORBIDDEN).json({ message: "Only customers can create reviews." });
    const { orderId, productId, reviewRating, reviewComment } = req.body;
    const order = await Order.findOne({ _id: orderId, userId: req.user.id, orderStatus: "completed", "orderItems.productId": productId });
    if (!order) return res.status(HttpStatus.FORBIDDEN).json({ message: "Reviews are only available for products in your completed orders." });
    const existing = await Review.findOne({ orderId, productId, userId: req.user.id });
    if (existing) return res.status(HttpStatus.CONFLICT).json({ message: "You have already reviewed this product for this order." });
    res.status(HttpStatus.CREATED).json(await Review.create({ orderId, productId, reviewRating, reviewComment, userId: req.user.id }));
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
const updateReview = async (req, res) => {
  try {
    const existingReview = await Review.findById(req.params.id);
    if (!existingReview) return res.status(HttpStatus.NOT_FOUND).json({ message: "Review not found." });
    if (req.user.userRole !== "admin" && existingReview.userId.toString() !== req.user.id) {
      return res.status(HttpStatus.FORBIDDEN).json({ message: "You can only update your own review." });
    }
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!review) return res.status(HttpStatus.NOT_FOUND).json({ message: "Review not found." });
    res.json(review);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
const deleteReview = async (req, res) => {
  try {
    const existingReview = await Review.findById(req.params.id);
    if (!existingReview) return res.status(HttpStatus.NOT_FOUND).json({ message: "Review not found." });
    if (req.user.userRole !== "admin" && existingReview.userId.toString() !== req.user.id) {
      return res.status(HttpStatus.FORBIDDEN).json({ message: "You can only delete your own review." });
    }
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(HttpStatus.NOT_FOUND).json({ message: "Review not found." });
    res.json({ message: "Review deleted." });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
module.exports = { getReviews, getManagedReviews, getMyReviews, createReview, updateReview, deleteReview };
