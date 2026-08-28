const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { SALT } = require("../config/config");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: { type: String, required: true, select: false },
    userRole: {
      type: String,
      enum: ["customer", "admin", "supplier"],
      default: "customer",
    },
    affiliation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required() {
        return this.userRole === "supplier";
      },
      validate: {
        validator(value) {
          return this.userRole === "supplier" || value == null;
        },
        message: "Only supplier users can have an affiliation.",
      },
    },
  },
  { timestamps: true, collection: "users" },
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, SALT);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
