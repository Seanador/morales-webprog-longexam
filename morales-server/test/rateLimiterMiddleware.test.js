const assert = require("node:assert/strict");
const test = require("node:test");
const express = require("express");
const {
  createProgressiveLoginLimiter,
  registerLimiter,
} = require("../middleware/rateLimiterMiddleware");

const startApp = async (configure) => {
  const app = express();
  app.use(express.json());
  configure(app);
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  return { port: server.address().port, server };
};

const closeServer = (server) =>
  new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));

const post = async (port, path, body) => {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const responseBody = await response.json();
  return { response, responseBody };
};

test("progressive login limiter applies 3, 5, and 30 minute penalties", async () => {
  let currentTime = 1_000_000;
  const limiter = createProgressiveLoginLimiter({ now: () => currentTime });
  const { port, server } = await startApp((app) => {
    app.post("/login", limiter, (req, res) => {
      if (req.body.password === "correct") return res.json({ token: "test" });
      return res.status(401).json({ message: "Invalid email or password." });
    });
  });
  const failedLogin = () => post(port, "/login", { email: "user@example.com", password: "wrong" });
  const advanceMinutes = (minutes) => { currentTime += minutes * 60 * 1000; };

  try {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      assert.equal((await failedLogin()).response.status, 401);
    }
    let blocked = await failedLogin();
    assert.equal(blocked.response.status, 429);
    assert.equal(blocked.responseBody.failedAttempts, 5);
    assert.equal(blocked.responseBody.retryAfterSeconds, 180);

    // Failures 6 and 7 each retain the three-minute per-attempt delay.
    for (let attempt = 6; attempt <= 7; attempt += 1) {
      advanceMinutes(3);
      assert.equal((await failedLogin()).response.status, 401);
      assert.equal((await failedLogin()).response.status, 429);
    }

    advanceMinutes(3);
    assert.equal((await failedLogin()).response.status, 401); // Failure 8.
    blocked = await failedLogin();
    assert.equal(blocked.responseBody.failedAttempts, 8);
    assert.equal(blocked.responseBody.retryAfterSeconds, 300);

    advanceMinutes(5);
    assert.equal((await failedLogin()).response.status, 401); // Failure 9.
    assert.equal((await failedLogin()).response.status, 429);
    advanceMinutes(5);
    assert.equal((await failedLogin()).response.status, 401); // Failure 10.
    blocked = await failedLogin();
    assert.equal(blocked.responseBody.failedAttempts, 10);
    assert.equal(blocked.responseBody.retryAfterSeconds, 1800);

    // A successful login after the penalty expires clears the failure history.
    advanceMinutes(30);
    assert.equal((await post(port, "/login", { email: "user@example.com", password: "correct" })).response.status, 200);
    assert.equal((await failedLogin()).response.status, 401);
    assert.equal((await failedLogin()).response.status, 401);
  } finally {
    await closeServer(server);
  }
});

test("registration limiter blocks the sixth request within one hour", async () => {
  const { port, server } = await startApp((app) => {
    app.post("/register", registerLimiter, (_req, res) => res.status(400).json({ message: "Invalid." }));
  });

  try {
    let result;
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      result = await post(port, "/register", { email: "invalid" });
    }
    assert.equal(result.response.status, 429);
    assert.equal(result.response.headers.get("ratelimit-limit"), "5");
  } finally {
    await closeServer(server);
  }
});
