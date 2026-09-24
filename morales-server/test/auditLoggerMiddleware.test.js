const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const test = require("node:test");

const Log = require("../models/logModel");
const { auditLoggerMiddleware } = require("../middleware/auditLoggerMiddleware");

test("writes exactly one audit log for each completed request", async () => {
  const createdLogs = [];
  const originalCreate = Log.create;
  Log.create = async (entry) => {
    createdLogs.push(entry);
    return entry;
  };

  try {
    const cases = [
      { statusCode: 200, expectedLevel: "info", user: { id: "user-1", userRole: "customer" } },
      { statusCode: 404, expectedLevel: "warn" },
      { statusCode: 500, expectedLevel: "error" },
    ];

    for (const [index, testCase] of cases.entries()) {
      const request = {
        method: "GET",
        originalUrl: `/test-${index}`,
        ip: "127.0.0.1",
        user: testCase.user,
      };
      const response = new EventEmitter();
      response.statusCode = testCase.statusCode;
      response.writableFinished = true;

      let nextCallCount = 0;
      auditLoggerMiddleware(request, response, () => { nextCallCount += 1; });
      response.emit("finish");
      response.emit("close");

      assert.equal(nextCallCount, 1);
      assert.equal(createdLogs[index].level, testCase.expectedLevel);
      assert.equal(createdLogs[index].metadata.statusCode, testCase.statusCode);
    }

    assert.equal(createdLogs.length, cases.length);
    assert.equal(createdLogs[0].metadata.userId, "user-1");
    assert.equal(createdLogs[0].metadata.userRole, "customer");
    assert.equal(createdLogs[1].metadata.userId, null);
  } finally {
    Log.create = originalCreate;
  }
});
