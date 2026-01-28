import { PrismaClient, BookingStatus, CourtType } from "@prisma/client";

const prisma = new PrismaClient();

const buildDateTime = (date: string, time: string): Date =>
  new Date(`${date}T${time}:00+07:00`);

const seed = async () => {
  const existing = await prisma.court.count();
  if (existing > 0) {
    // Avoid duplicating data on repeated seed runs.
    console.log("Seed skipped: courts already exist.");
    return;
  }

  const courts = await prisma.court.createMany({
    data: [
      { name: "Court A", type: CourtType.SINGLE, basePrice: 120000 },
      { name: "Court B", type: CourtType.DOUBLE, basePrice: 150000 },
      { name: "Court C", type: CourtType.SINGLE, basePrice: 110000 },
    ],
  });

  const createdCourts = await prisma.court.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (createdCourts.length === 0) {
    console.log("No courts created, skipping bookings.");
    return;
  }

  const today = new Date();
  const date = today.toISOString().slice(0, 10);

  const courtA = createdCourts[0];
  const courtB = createdCourts[1] ?? createdCourts[0];

  await prisma.booking.createMany({
    data: [
      {
        courtId: courtA.id,
        startTime: buildDateTime(date, "06:00"),
        endTime: buildDateTime(date, "08:00"),
        status: BookingStatus.PAID,
      },
      {
        courtId: courtB.id,
        startTime: buildDateTime(date, "09:00"),
        endTime: buildDateTime(date, "10:30"),
        status: BookingStatus.PENDING_PAYMENT,
      },
      {
        courtId: courtB.id,
        startTime: buildDateTime(date, "12:00"),
        endTime: buildDateTime(date, "13:00"),
        status: BookingStatus.CANCELLED,
      },
    ],
  });

  console.log(`Seed completed: ${courts.count} courts, 3 bookings.`);
};

seed()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
