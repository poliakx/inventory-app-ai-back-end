import {env} from "./config/env.js";
import app from "./app.js";
import {logger} from "./config/logger.js";
import { pool } from "./db/pool.js";
import { testDB } from "./db/testDB.js";
import { initRedis } from "./infrastructure/redis/redis.client.js";
import { setupGracefulShutdown } from "./infrastructure/gracefulShutdown.js";

try {
  await testDB();
  const redis = await initRedis();

  const server = app.listen(env.APP_PORT, () => {
    logger.info(`Server is running on port ${env.APP_PORT}`);
  });

  setupGracefulShutdown({ pool, server, redis });
} catch (err) {
  logger.error("Failed to start application", { message: err?.message, stack: err?.stack });
}
