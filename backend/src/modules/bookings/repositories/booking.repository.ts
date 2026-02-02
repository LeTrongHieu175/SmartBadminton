import { Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";

type PrismaClientLike = Prisma.TransactionClient | typeof prisma;

export const checkOverlap = async (
  courtId: string,
  startTime: Date,
  endTime: Date,
  client: PrismaClientLike = prisma,
): Promise<boolean> => {
  const overlap = await client.booking.findFirst({
    where: {
      courtId,
      status: { in: ["PENDING_PAYMENT", "PAID"] },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
    select: { id: true },
  });

  return Boolean(overlap);
};

export const createBooking = (
  data: Prisma.BookingUncheckedCreateInput,
  client: PrismaClientLike = prisma,
) => client.booking.create({ data });
