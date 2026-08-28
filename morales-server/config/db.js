const mongoose = require("mongoose");
const { MONGO_DB_URL } = require("./config");

const connectDB = async () => {
  if (!MONGO_DB_URL) {
    throw new Error("MONGODB_URI is missing from the server .env file.");
  }

  const connection = await mongoose.connect(MONGO_DB_URL, {
    dbName: "bulldogsExchange_DB",
  });

  console.log(`MongoDB connected: ${connection.connection.host}/bulldogsExchange_DB`);
};

module.exports = connectDB;
