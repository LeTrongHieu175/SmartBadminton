import { BookingStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";
import logger from "../../../shared/logger";
import { bookingExpireQueue } from "../../../shared/queue";
import config from "../../../config/env";
import { checkOverlap, createBooking } from "../repositories/booking.repository";

export class ServiceError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export type CreateBookingPayload = {
  userId: string;
  courtId: string;
  startTime: string;
  endTime: string;
};

const toDate = (value: string): Date => new Date(value);

const minutesDiff = (start: Date, end: Date): number =>
  Math.round((end.getTime() - start.getTime()) / 60000);

const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * 60000);

export const createBookingService = async (
  payload: CreateBookingPayload,
) => {
  const startTime = toDate(payload.startTime);
  const endTime = toDate(payload.endTime);
  const durationMinutes = minutesDiff(startTime, endTime);
  const expireMinutes = config.booking.expireMinutes;
  const expiresAt = addMinutes(new Date(), expireMinutes);
  logger.info(
    {
      userId: payload.userId,
      courtId: payload.courtId,
      startTime,
      endTime,
      expireMinutes,
    },
    "booking create requested",
  );

  const booking = await prisma.$transaction(async (tx) => {
    const court = await tx.court.findUnique({
      where: { id: payload.courtId },
      select: { id: true, basePrice: true },
    });

    if (!court) {
      throw new ServiceError("COURT_NOT_FOUND", 404, "San khong ton tai");
    }

    const hasOverlap = await checkOverlap(
      payload.courtId,
      startTime,
      endTime,
      tx,
    );

    if (hasOverlap) {
      throw new ServiceError(
        "BOOKING_OVERLAP",
        409,
        "San da duoc dat trong khung gio nay",
      );
    }

    const unitPrice = court.basePrice;
    const totalPrice = Math.round((unitPrice * durationMinutes) / 60);

    const booking = await createBooking(
      {
        userId: payload.userId,
        courtId: payload.courtId,
        startTime,
        endTime,
        durationMinutes,
        unitPrice,
        totalPrice,
        status: BookingStatus.PENDING_PAYMENT,
        expiresAt,
      },
      tx,
    );

    logger.info(
      {
        bookingId: booking.id,
        userId: booking.userId,
        courtId: booking.courtId,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
      },
      "booking created",
    );

    return booking;
  });

  try {
    await bookingExpireQueue.add(
      "expire-booking",
      { bookingId: booking.id },
      {
        delay: expireMinutes * 60 * 1000,
        jobId: booking.id,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: 50,
      },
    );
    logger.info(
      {
        bookingId: booking.id,
        delayMs: expireMinutes * 60 * 1000,
      },
      "booking expire job enqueued",
    );
  } catch (error) {
    logger.error(
      { err: error, bookingId: booking.id },
      "enqueue booking expire failed",
    );
  }

  return booking;
};
