import { Worker } from "bullmq";
import { bookingExpireQueue } from "../shared/queue";
import prisma from "../shared/prisma";
import logger from "../shared/logger";

const worker = new Worker(
  bookingExpireQueue.name,
  async (job) => {
    const { bookingId } = job.data as { bookingId?: string };
    if (!bookingId) {
      logger.warn({ jobId: job.id }, "booking expire job missing bookingId");
      return;
    }
    logger.info({ jobId: job.id, bookingId }, "booking expire job received");

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true, expiresAt: true },
    });

    if (!booking) {
      logger.warn({ bookingId }, "booking not found for expire job");
      return;
    }

    const now = new Date();
    if (booking.status !== "PENDING_PAYMENT") {
      logger.info(
        { bookingId, status: booking.status },
        "booking not pending, skip expire",
      );
      return;
    }

    if (booking.expiresAt.getTime() > now.getTime()) {
      logger.info(
        { bookingId, expiresAt: booking.expiresAt },
        "booking not yet expired, skip expire",
      );
      return;
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "EXPIRED" },
    });

    logger.info({ bookingId }, "booking expired");
  },
  {
    connection: bookingExpireQueue.opts.connection,
  },
);

worker.on("failed", (job, error) => {
  logger.error(
    { err: error, jobId: job?.id },
    "booking expire worker failed",
  );
});
