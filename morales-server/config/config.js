require("dotenv").config();

const MONGO_DB_URL = process.env.MONGODB_URI;
const SALT = parseInt(process.env.SALT, 10) || 10;
const SECRET_KEY = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

module.exports = {
    MONGO_DB_URL,
    SALT,
    SECRET_KEY,
    PORT,
    CLIENT_ORIGIN,
}
