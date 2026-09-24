const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const { CLIENT_ORIGIN, PORT } = require("./config/config");
const { HttpStatus } = require("./config/constants");
const { auditLoggerMiddleware } = require("./middleware/auditLoggerMiddleware");
const { apiLimiter } = require("./middleware/rateLimiterMiddleware");

const app = express();
const corsOptions = {
  origin: CLIENT_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Accept",
    "Content-Type",
    "Authorization",
  ],
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  frameguard: { action: "sameorigin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(auditLoggerMiddleware);
app.use("/api", apiLimiter);

app.get("/", (_req, res) => res.json({ message: "BulldogEx API is running." }));
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/v1/product", require("./routes/productRoutes"));
app.use("/api/v1/products", require("./routes/productRoutes"));
app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/v1/category", require("./routes/categoryRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/v1/cart", require("./routes/cartRoutes"));
app.use("/api/order", require("./routes/orderRoutes"));
app.use("/api/v1/order", require("./routes/orderRoutes"));
app.use("/api/review", require("./routes/reviewRoutes"));
app.use("/api/v1/review", require("./routes/reviewRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/supplier", require("./routes/supplierRoutes"));
app.use("/api/v1/supplier", require("./routes/supplierRoutes"));
app.use("/api/v1/suppliers", require("./routes/supplierRoutes"));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
});

connectDB()
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`)),
  )
  .catch((error) => {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  });
