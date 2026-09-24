const assert = require("node:assert/strict");
const test = require("node:test");
const express = require("express");

const routeCases = [
  { method: "POST", path: "/api/v1/user/register", body: { email: "bad" } },
  { method: "POST", path: "/api/v1/user/login", body: { email: "bad", password: "" } },
  { method: "PUT", path: "/api/v1/user/not-an-id", body: { firstName: "Test" } },
  { method: "GET", path: "/api/v1/products?limit=11" },
  { method: "POST", path: "/api/v1/products", body: { productPrice: -1 } },
  { method: "GET", path: "/api/v1/products/not_a_valid_slug" },
  { method: "POST", path: "/api/v1/category", body: { categoryName: "" } },
  { method: "PUT", path: "/api/v1/cart", body: { cartItems: [{ productId: "bad", quantity: 0 }] } },
  { method: "GET", path: "/api/v1/order?userId=bad" },
  { method: "POST", path: "/api/v1/order", body: { productIds: ["bad"] } },
  { method: "GET", path: "/api/v1/review?productId=bad" },
  { method: "POST", path: "/api/v1/review", body: { reviewRating: 6 } },
  { method: "POST", path: "/api/v1/supplier", body: { supplierEmail: "bad" } },
];

test("all resource routes reject malformed input before reaching their controllers", async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/user", require("../routes/userRoutes"));
  app.use("/api/v1/products", require("../routes/productRoutes"));
  app.use("/api/v1/category", require("../routes/categoryRoutes"));
  app.use("/api/v1/cart", require("../routes/cartRoutes"));
  app.use("/api/v1/order", require("../routes/orderRoutes"));
  app.use("/api/v1/review", require("../routes/reviewRoutes"));
  app.use("/api/v1/supplier", require("../routes/supplierRoutes"));

  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();

  try {
    for (const routeCase of routeCases) {
      const response = await fetch(`http://127.0.0.1:${port}${routeCase.path}`, {
        method: routeCase.method,
        headers: routeCase.body ? { "Content-Type": "application/json" } : undefined,
        body: routeCase.body ? JSON.stringify(routeCase.body) : undefined,
      });
      const responseBody = await response.json();

      assert.equal(response.status, 400, `${routeCase.method} ${routeCase.path}`);
      assert.equal(responseBody.message, "Validation failed.");
      assert.ok(responseBody.errors.length > 0);
    }
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
