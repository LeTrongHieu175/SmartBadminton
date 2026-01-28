import prisma from "../../../shared/prisma";

export const findAvailableCourts = async (params: {
  start: Date;
  end: Date;
}) => {
  const { start, end } = params;
  return prisma.court.findMany({
    where: {
      isActive: true,
      bookings: {
        none: {
          status: { in: ["PENDING_PAYMENT", "PAID"] },
          startTime: { lt: end },
          endTime: { gt: start },
        },
      },
    },
    select: {
      id: true,
      name: true,
      type: true,
      basePrice: true,
    },
  });
};
