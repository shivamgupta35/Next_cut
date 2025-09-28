import { Prisma } from "@prisma/client";
import prisma from "../db";

export interface UserDTO {
  id: number;
  name: string;
  phoneNumber: string;
}

// ✅ Utility: Calculate distance between two lat/long
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ✅ Create new user
export async function createUser(
  name: string,
  phoneNumber: string
): Promise<UserDTO> {
  try {
    const user = await prisma.user.create({
      data: { name, phoneNumber },
    });
    return { id: user.id, name: user.name, phoneNumber: user.phoneNumber };
  } catch (error) {
    console.error("❌ Error creating user:", error);
    throw error;
  }
}

// ✅ Authenticate user by phone
export async function authenticateUser(
  phoneNumber: string
): Promise<UserDTO | null> {
  try {
    const user = await prisma.user.findUnique({ where: { phoneNumber } });
    if (!user) return null;
    return { id: user.id, name: user.name, phoneNumber: user.phoneNumber };
  } catch (error) {
    console.error("❌ Error authenticating user:", error);
    throw new Error("Failed to authenticate user");
  }
}

// ✅ Join queue (used directly OR after Razorpay verify-payment)
export async function joinQueue(
  barberId: number,
  userId: number,
  service: string
) {
  try {
    console.log("🟢 Joining queue:", { barberId, userId, service });

    const barber = await prisma.barber.findUnique({ where: { id: barberId } });
    if (!barber) throw new Error("Barber not found");

    if (!service || typeof service !== "string") {
      throw new Error("Service must be a non-empty string");
    }

    const [, , entry] = await prisma.$transaction([
      // Remove old queue entries
      prisma.queue.deleteMany({ where: { userId } }),
      // Reset user state
      prisma.user.update({
        where: { id: userId },
        data: { inQueue: false, queuedBarberId: null },
      }),
      // Create new queue entry
      prisma.queue.create({
        data: { barberId, userId, service },
        include: {
          user: { select: { id: true, name: true, phoneNumber: true } },
          barber: { select: { id: true, name: true } },
        },
      }),
      // Mark user as in queue
      prisma.user.update({
        where: { id: userId },
        data: { inQueue: true, queuedBarberId: barberId },
      }),
    ]);

    console.log("✅ Queue entry created:", entry);
    return entry;
  } catch (error) {
    console.error("❌ Error joining queue:", error);
    throw new Error("Failed to join queue");
  }
}

// ✅ Remove user from queue
export async function removeFromQueue(userId: number) {
  try {
    const existingQueueEntry = await prisma.queue.findUnique({
      where: { userId },
      include: { barber: { select: { id: true, name: true } } },
    });

    if (!existingQueueEntry) {
      return { success: false, message: "User is not in any queue", data: null };
    }

    await prisma.$transaction([
      prisma.queue.delete({ where: { userId } }),
      prisma.user.update({
        where: { id: userId },
        data: { inQueue: false, queuedBarberId: null },
      }),
    ]);

    return {
      success: true,
      message: "Successfully removed from queue",
      data: {
        barberId: existingQueueEntry.barberId,
        barberName: existingQueueEntry.barber.name,
      },
    };
  } catch (error) {
    console.error("❌ Error removing from queue:", error);
    throw new Error("Failed to remove from queue");
  }
}

// ✅ Get user queue status
export async function getUserQueueStatus(userId: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Queue: {
          include: {
            barber: { select: { id: true, name: true, lat: true, long: true } },
          },
        },
      },
    });

    if (!user) throw new Error("User not found");

    if (!user.inQueue || !user.Queue) {
      return {
        inQueue: false,
        queuePosition: null,
        barber: null,
        enteredAt: null,
        service: null,
        estimatedWaitTime: null,
      };
    }

    const countWhere: Prisma.QueueWhereInput = {
      barberId: user.queuedBarberId!,
      ...(user.Queue.enteredAt
        ? { enteredAt: { lt: user.Queue.enteredAt } }
        : {}),
    };

    const queuePosition = await prisma.queue.count({ where: countWhere });
    const estimatedWaitMinutes = queuePosition * 15;

    return {
      inQueue: true,
      queuePosition: queuePosition + 1,
      barber: {
        id: user.Queue.barber.id,
        name: user.Queue.barber.name,
        lat: user.Queue.barber.lat,
        long: user.Queue.barber.long,
      },
      enteredAt: user.Queue.enteredAt?.toISOString() || null,
      service: user.Queue.service || null,
      estimatedWaitTime: estimatedWaitMinutes,
    };
  } catch (error) {
    console.error("❌ Error getting user queue status:", error);
    throw new Error("Failed to get queue status");
  }
}

// ✅ Get nearby barbers
export async function getBarbersNearby(
  userLat: number,
  userLong: number,
  radiusKm: number
) {
  try {
    const barbers = await prisma.barber.findMany({
      include: { queueEntries: { select: { id: true } } },
    });

    const barbersWithDistance = barbers.map((barber) => {
      const distance = calculateDistance(userLat, userLong, barber.lat, barber.long);
      return {
        id: barber.id,
        name: barber.name,
        lat: barber.lat,
        long: barber.long,
        distance: Math.round(distance * 10) / 10,
        queueLength: barber.queueEntries.length,
        estimatedWaitTime: barber.queueEntries.length * 15,
      };
    });

    return barbersWithDistance
      .filter((b) => b.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error("❌ Error getting nearby barbers:", error);
    throw new Error("Failed to get nearby barbers");
  }
}
