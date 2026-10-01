import { logger } from "../config/logger.js";

export const setupGracefulShutdown = ({ server, pool, redis }) => {
  let isShuttingDown = false;

  const signals = ["SIGTERM", "SIGINT"];

  const shutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}. Shutting down gracefully...`);

    server.close(async (err) => {
      if (err) {
        logger.error("Error while closing HTTP server", { message: err?.message, stack: err?.stack });
      } else {
        logger.info("HTTP server closed");
      }

      try {
        await pool?.end();
        logger.info("PostgreSQL pool closed");
      } catch (err) {
        logger.error("Error while closing PostgreSQL pool", { message: err?.message, stack: err?.stack });
      }

      try {
        await redis?.quit();
        logger.info("Redis connection closed");
      } catch (err) {
        logger.error("Error while closing Redis connection", { message: err?.message, stack: err?.stack });
      }
    });
  };

  signals.forEach((signal) => {
    process.on(signal, () => shutdown(signal));
  });
};
