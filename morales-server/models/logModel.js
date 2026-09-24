const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["info", "warn", "error"],
      required: true,
    },
    message: { type: String, required: true, trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "auditLogs" },
);

logSchema.index({ createdAt: -1 });
logSchema.index({ "metadata.userId": 1, createdAt: -1 });

module.exports = mongoose.model("Log", logSchema);
