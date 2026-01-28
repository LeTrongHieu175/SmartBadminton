import { findAvailableCourts } from "../repositories/court.repository";
import { AvailableCourtsQuery } from "../validators/available-courts.validator";
import logger from "../../../shared/logger";
import {
  availableCourtsDurationHistogram,
  availableCourtsEmptyCounter,
  availableCourtsSearchCounter,
} from "../../../shared/metrics";

export class ServiceError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

type AvailableCourtsResult = {
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  courts: Array<{
    id: string;
    name: string;
    type: string;
    basePrice: number;
  }>;
};

const toDateTime = (date: string, time: string): Date => {
  const value = `${date}T${time}:00+07:00`;
  return new Date(value);
};

const toMinutes = (value: string): number => {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};

export const getAvailableCourts = async (
  query: AvailableCourtsQuery,
): Promise<AvailableCourtsResult> => {
  const endTimer = availableCourtsDurationHistogram.startTimer();
  availableCourtsSearchCounter.inc();
  logger.info(
    {
      date: query.date,
      startTime: query.startTime,
      endTime: query.endTime,
    },
    "available courts search",
  );
  const start = toDateTime(query.date, query.startTime);
  const end = toDateTime(query.date, query.endTime);
  const durationMinutes = toMinutes(query.endTime) - toMinutes(query.startTime);

  const courts = await findAvailableCourts({ start, end });

  if (courts.length === 0) {
    availableCourtsEmptyCounter.inc();
    endTimer();
    logger.info(
      {
        date: query.date,
        startTime: query.startTime,
        endTime: query.endTime,
        resultCount: 0,
      },
      "available courts empty result",
    );
    throw new ServiceError(
      "NO_AVAILABLE_COURTS",
      404,
      "Khong co san phu hop trong khung gio da chon",
    );
  }

  logger.info(
    {
      date: query.date,
      startTime: query.startTime,
      endTime: query.endTime,
      resultCount: courts.length,
    },
    "available courts result",
  );
  endTimer();

  return {
    date: query.date,
    startTime: query.startTime,
    endTime: query.endTime,
    durationMinutes,
    courts,
  };
};
