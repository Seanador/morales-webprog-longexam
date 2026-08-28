const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { SECRET_KEY } = require("../config/config");
const { HttpStatus } = require("../config/constants");

const authenticate = async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Authentication is required." });
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Session is no longer valid." });
    if (user.userRole === "supplier" && !user.affiliation) {
      return res.status(HttpStatus.FORBIDDEN).json({ message: "This supplier account has no supplier affiliation." });
    }
    req.user = {
      id: user._id.toString(),
      userRole: user.userRole,
      affiliation: user.affiliation?.toString() || null,
    };
    return next();
  } catch (_error) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Your session has expired. Please log in again." });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.userRole)) {
    return res.status(HttpStatus.FORBIDDEN).json({ message: "You do not have permission to perform this action." });
  }
  return next();
};

module.exports = { authenticate, authorize };
