import pino from "pino";
import config from "../config/env";

const isDev = config.nodeEnv !== "production";

const logger = pino({
  level: config.logLevel,
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "yyyy-mm-dd HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});

export default logger;
