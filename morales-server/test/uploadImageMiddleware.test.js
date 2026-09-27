const assert = require("node:assert/strict");
const test = require("node:test");
const express = require("express");
const {
  upload,
  validateImageContent,
  imageUploadErrorHandler,
} = require("../middleware/uploadImageMiddleware");

const createServer = async () => {
  const app = express();
  app.post("/upload", upload.single("image"), validateImageContent, (_req, res) => {
    res.json({ success: true });
  });
  app.use(imageUploadErrorHandler);

  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  return server;
};

const sendFile = async (server, bytes, type, name) => {
  const form = new FormData();
  form.append("image", new Blob([bytes], { type }), name);
  return fetch(`http://127.0.0.1:${server.address().port}/upload`, {
    method: "POST",
    body: form,
  });
};

test("rejects unsupported image MIME types", async () => {
  const server = await createServer();
  try {
    const response = await sendFile(server, Buffer.from("plain text"), "text/plain", "fake.jpg");
    const body = await response.json();
    assert.equal(response.status, 415);
    assert.match(body.message, /JPEG, PNG, and WebP/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("rejects files whose bytes do not match their image MIME type", async () => {
  const server = await createServer();
  try {
    const response = await sendFile(server, Buffer.from("not really a png"), "image/png", "fake.png");
    const body = await response.json();
    assert.equal(response.status, 415);
    assert.match(body.message, /file content/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("rejects images larger than 5 MB with a specific error", async () => {
  const server = await createServer();
  try {
    const response = await sendFile(
      server,
      Buffer.alloc((5 * 1024 * 1024) + 1),
      "image/png",
      "large.png",
    );
    const body = await response.json();
    assert.equal(response.status, 413);
    assert.match(body.message, /5 MB/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
