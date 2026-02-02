import { z } from "zod";

const MIN_DURATION_MINUTES = 60;
const MAX_DURATION_MINUTES = 180;

const parseDate = (value: string): Date | null => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const minutesOfDay = (value: Date): number =>
  value.getHours() * 60 + value.getMinutes();

const isHalfHourStep = (value: Date): boolean =>
  value.getMinutes() % 30 === 0 &&
  value.getSeconds() === 0 &&
  value.getMilliseconds() === 0;

export const createBookingSchema = z
  .object({
    courtId: z.string().uuid("CourtId khong hop le"),
    startTime: z.string(),
    endTime: z.string(),
  })
  .superRefine((data, ctx) => {
    const start = parseDate(data.startTime);
    const end = parseDate(data.endTime);

    if (!start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Thoi gian bat dau khong hop le",
      });
      return;
    }

    if (!end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "Thoi gian ket thuc khong hop le",
      });
      return;
    }

    if (start.getTime() >= end.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Thoi gian bat dau phai nho hon thoi gian ket thuc",
      });
      return;
    }

    if (!isHalfHourStep(start) || !isHalfHourStep(end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Thoi gian phai theo buoc 30 phut",
      });
      return;
    }

    const startMinutes = minutesOfDay(start);
    const endMinutes = minutesOfDay(end);
    const openMinutes = 6 * 60;
    const closeMinutes = 23 * 60;

    if (startMinutes < openMinutes || endMinutes > closeMinutes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Khung gio phai nam trong 06:00-23:00",
      });
      return;
    }

    const durationMinutes = Math.round(
      (end.getTime() - start.getTime()) / 60000,
    );

    if (durationMinutes <= 0 || durationMinutes % 30 !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Thoi luong phai la boi so cua 30 phut",
      });
      return;
    }

    if (
      MIN_DURATION_MINUTES !== null &&
      durationMinutes < MIN_DURATION_MINUTES
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: `Thoi luong toi thieu la ${MIN_DURATION_MINUTES} phut`,
      });
      return;
    }

    if (
      MAX_DURATION_MINUTES !== null &&
      durationMinutes > MAX_DURATION_MINUTES
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: `Thoi luong toi da la ${MAX_DURATION_MINUTES} phut`,
      });
    }
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const validateCreateBookingPayload = (
  payload: unknown,
): CreateBookingInput => createBookingSchema.parse(payload);

export const createBookingValidator = createBookingSchema;
