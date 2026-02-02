import { PrismaClient, BookingStatus, CourtType, Role } from "@prisma/client";
import { hashPassword } from "../src/shared/hash";

const prisma = new PrismaClient();

const buildDateTime = (date: string, time: string): Date =>
  new Date(`${date}T${time}:00+07:00`);

const toMinutes = (start: Date, end: Date): number =>
  Math.round((end.getTime() - start.getTime()) / 60000);

const addMinutes = (time: Date, minutes: number): Date =>
  new Date(time.getTime() + minutes * 60000);

const seed = async () => {
  const existingCourts = await prisma.court.count();
  if (existingCourts === 0) {
    await prisma.court.createMany({
      data: [
        { name: "Court A", type: CourtType.SINGLE, basePrice: 120000 },
        { name: "Court B", type: CourtType.DOUBLE, basePrice: 150000 },
        { name: "Court C", type: CourtType.SINGLE, basePrice: 110000 },
      ],
    });
  }

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

  const seedUsername = "customer.seed";
  const seedPassword = "Password123!";
  const seedPasswordHash = await hashPassword(seedPassword);

  const customer = await prisma.user.upsert({
    where: { username: seedUsername },
    update: {
      passwordHash: seedPasswordHash,
      fullName: "Seed Customer",
      phone: "+84900000000",
      email: "customer.seed@smartbadminton.local",
      role: Role.CUSTOMER,
    },
    create: {
      username: seedUsername,
      passwordHash: seedPasswordHash,
      fullName: "Seed Customer",
      phone: "+84900000000",
      email: "customer.seed@smartbadminton.local",
      role: Role.CUSTOMER,
    },
  });

  const bookingSlots = [
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
      status: BookingStatus.CANCELED,
    },
  ];

  const bookings = bookingSlots.map((slot) => {
    const durationMinutes = toMinutes(slot.startTime, slot.endTime);
    const court = slot.courtId === courtA.id ? courtA : courtB;
    const unitPrice = court.basePrice;
    const totalPrice = Math.round((unitPrice * durationMinutes) / 60);

    return {
      ...slot,
      userId: customer.id,
      durationMinutes,
      unitPrice,
      totalPrice,
      expiresAt: addMinutes(slot.startTime, 15),
    };
  });

  const existingBookings = await prisma.booking.count();
  if (existingBookings === 0) {
    await prisma.booking.createMany({
      data: bookings,
    });
  }

  console.log("Seed user credentials:");
  console.log(`- username: ${seedUsername}`);
  console.log(`- password: ${seedPassword}`);
  console.log(
    `Seed completed: ${createdCourts.length} courts, ${existingBookings === 0 ? 3 : 0} bookings.`,
  );
};

seed()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
