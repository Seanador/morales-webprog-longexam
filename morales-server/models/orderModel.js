const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true, trim: true },
    productPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: (items) => items.length > 0,
    },
    totalAmount: { type: Number, required: true, min: 0 },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "ready for pickup",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },
    pickupDetails: { type: String, trim: true, default: "" },
    orderedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "orders" },
);

orderSchema.index({ userId: 1, orderedAt: -1 });
orderSchema.index({ orderStatus: 1, orderedAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
