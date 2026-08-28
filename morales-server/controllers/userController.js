const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { SECRET_KEY } = require("../config/config");
const { HttpStatus } = require("../config/constants");

const createToken = (user) => {
  if (!SECRET_KEY)
    throw new Error("JWT_SECRET is missing from the server .env file.");
  return jwt.sign({ userId: user._id, userRole: user.userRole }, SECRET_KEY, {
    expiresIn: "7d",
  });
};

const serializeUser = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  userRole: user.userRole,
  affiliation: user.affiliation,
});

const registerUser = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "Request body is required." });
    }
    const { firstName, lastName, email, password } = req.body;
    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash: password,
    });
    res
      .status(201)
      .json({
        user: serializeUser(user),
        token: createToken(user),
      });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email?.toLowerCase(),
    }).select("+passwordHash");
    if (!user || !(await user.comparePassword(req.body.password)))
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Invalid email or password." });
    res.json({
      user: serializeUser(user),
      token: createToken(user),
    });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user: serializeUser(user) });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
const getUsers = async (_req, res) => {
  try {
    res.json(await User.find());
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(HttpStatus.NOT_FOUND).json({ message: "User not found." });
    res.json(user);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
const updateUser = async (req, res) => {
  try {
    if (req.user.userRole !== "admin" && req.user.id !== req.params.id) {
      return res.status(HttpStatus.FORBIDDEN).json({ message: "You can only update your own account." });
    }
    const updates = req.user.userRole === "admin"
      ? (({ firstName, lastName, email, userRole, affiliation }) => ({ firstName, lastName, email, userRole, affiliation: affiliation || undefined }))(req.body)
      : (({ firstName, lastName, email }) => ({ firstName, lastName, email }))(req.body);
    if (req.user.userRole === "admin" && !Object.hasOwn(req.body, "affiliation")) delete updates.affiliation;
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) return res.status(HttpStatus.NOT_FOUND).json({ message: "User not found." });
    const nextRole = updates.userRole ?? existingUser.userRole;
    if (nextRole !== "supplier") updates.affiliation = null;
    if (nextRole === "supplier" && !(updates.affiliation ?? existingUser.affiliation)) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "Supplier users must be affiliated with a supplier." });
    }
    Object.assign(existingUser, updates);
    const user = await existingUser.save();
    if (!user) return res.status(HttpStatus.NOT_FOUND).json({ message: "User not found." });
    res.json(user);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
const deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) return res.status(HttpStatus.BAD_REQUEST).json({ message: "You cannot delete your own account." });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(HttpStatus.NOT_FOUND).json({ message: "User not found." });
    res.json({ message: "User deleted." });
  } catch (error) { res.status(HttpStatus.BAD_REQUEST).json({ message: error.message }); }
};
module.exports = { registerUser, loginUser, getCurrentUser, getUsers, getUser, updateUser, deleteUser };
