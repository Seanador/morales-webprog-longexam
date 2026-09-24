const Log = require("../models/logModel");

const logger = {
  info: async (message, metadata = {}) => {
    try {
      await Log.create({ level: "info", message, metadata });
    } catch (error) {
      console.error("Failed to write info log:", error);
    }
  },
  
  warn: async (message, metadata = {}) => {
    try {
      await Log.create({ level: "warn", message, metadata });
    } catch (error) {
      console.error("Failed to write warn log:", error);
    }
  },
  
  error: async (message, metadata = {}) => {
    try {
      await Log.create({ level: "error", message, metadata });
    } catch (error) {
      console.error("Failed to write error log:", error);
    }
  }
};

// Register the listeners before the request reaches a route. Authentication can
// still populate request.user before the response finishes and the log is built.
const auditLoggerMiddleware = (request, response, next) => {
  const startTime = Date.now();
  let hasLogged = false;

  const writeAuditLog = () => {
    if (hasLogged) return;
    hasLogged = true;

    const logData = {
      method: request.method,
      path: request.originalUrl || request.url,
      ip: request.ip || request.socket?.remoteAddress || null,
      userId: request.user?.id || null,
      userRole: request.user?.userRole || null,
      statusCode: response.statusCode,
      durationMs: Date.now() - startTime,
      completed: response.writableFinished,
    };

    const message = `${logData.method} ${logData.path} - ${logData.statusCode}`;
    if (response.statusCode >= 500) {
      void logger.error(message, logData);
    } else if (response.statusCode >= 400) {
      void logger.warn(message, logData);
    } else {
      void logger.info(message, logData);
    }
  };

  response.once("finish", writeAuditLog);
  response.once("close", writeAuditLog);
  next();
};

module.exports = { logger, auditLoggerMiddleware };
