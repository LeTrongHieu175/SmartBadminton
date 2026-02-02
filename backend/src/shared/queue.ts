import { Queue, QueueOptions } from "bullmq";
import config from "../config/env";

const buildConnection = (): QueueOptions["connection"] => {
  const url = new URL(config.redisUrl);
  const port = url.port ? Number(url.port) : 6379;
  if (Number.isNaN(port)) {
    throw new Error(`Invalid REDIS_URL port: ${url.port}`);
  }

  return {
    host: url.hostname,
    port,
    username: url.username || undefined,
    password: url.password || undefined,
  };
};

export const bookingExpireQueue = new Queue("booking-expire", {
  connection: buildConnection(),
});
