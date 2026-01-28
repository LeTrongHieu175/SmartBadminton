import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const toMinutes = (value: string): number => {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
};

const withinOperatingHours = (start: number, end: number): boolean => {
  const open = 6 * 60;
  const close = 23 * 60;
  return start >= open && end <= close;
};

export const availableCourtsQuerySchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngay khong hop le'),
    startTime: z
      .string()
      .regex(timeRegex, 'Gio bat dau khong hop le'),
    endTime: z.string().regex(timeRegex, 'Gio ket thuc khong hop le'),
  })
  .superRefine((data, ctx) => {
    const start = toMinutes(data.startTime);
    const end = toMinutes(data.endTime);

    if (start >= end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startTime'],
        message: 'Gio bat dau phai nho hon gio ket thuc',
      });
      return;
    }

    if (!withinOperatingHours(start, end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startTime'],
        message: 'Khung gio phai nam trong 06:00-23:00',
      });
    }
  });

export type AvailableCourtsQuery = z.infer<typeof availableCourtsQuerySchema>;

export const validateAvailableCourtsQuery = (
  payload: unknown,
): AvailableCourtsQuery => availableCourtsQuerySchema.parse(payload);
