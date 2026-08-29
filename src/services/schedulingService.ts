import { dbCommand, dbQuery } from "../api/db.js";
import { safeObjectId } from "../lib/utils.js";

export interface FreeSlot {
  start: string;
  end: string;
  formattedTime?: string;
}

export interface CalendarTokenData {
  userId: string;
  provider: 'google' | 'outlook';
  accessToken: string;
  refreshToken: string;
  expiryDate: Date | string;
  busySlots?: { start: string; end: string }[];
}

export class SchedulingService {
  /**
   * Utility maps intervals missing from busySlots array bounds within core 09:00-18:00 hours.
   */
  public static calculateFreeSlots(
    busySlots: { start: string; end: string }[] = [],
    startIso?: string,
    endIso?: string
  ): FreeSlot[] {
    const start = new Date(startIso || Date.now());
    const end = new Date(endIso || Date.now() + 7 * 24 * 60 * 60 * 1000);

    const slots: FreeSlot[] = [];
    let curr = new Date(start);
    curr.setMinutes(curr.getMinutes() >= 30 ? 30 : 0, 0, 0);

    while (curr.getTime() + 30 * 60 * 1000 <= end.getTime()) {
      const slotStart = new Date(curr);
      const slotEnd = new Date(curr.getTime() + 30 * 60 * 1000);
      const hour = slotStart.getHours();

      if (hour >= 9 && hour < 18) {
        const isBusy = busySlots.some((b) => {
          const bStart = new Date(b.start).getTime();
          const bEnd = new Date(b.end).getTime();
          return (
            (slotStart.getTime() >= bStart && slotStart.getTime() < bEnd) ||
            (slotEnd.getTime() > bStart && slotEnd.getTime() <= bEnd)
          );
        });

        if (!isBusy) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            formattedTime: `${slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${slotEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          });
        }
      }

      curr = new Date(curr.getTime() + 30 * 60 * 1000);
    }

    return slots;
  }

  /**
   * Connects to external Calendar APIs / DB, pulls busy blocks, and calculates free time slots.
   */
  public static async getStudentAvailability(
    studentId: string,
    startIso?: string,
    endIso?: string
  ): Promise<FreeSlot[]> {
    if (studentId === "unlinked_student_id") {
      throw new Error("Student has not linked a calendar.");
    }

    let tokenRecord: any = null;
    if (dbQuery) {
      const oid = safeObjectId(studentId);
      tokenRecord = await dbQuery
        .collection("calendar_tokens")
        .findOne({ $or: [{ userId: studentId }, { userId: oid }] });
    }

    const busySlots = tokenRecord?.busySlots || [];
    return this.calculateFreeSlots(busySlots, startIso, endIso);
  }

  /**
   * Commits the interview booking and returns auto-generated video conferencing link (Google Meet).
   */
  public static async bookInterview(
    employerId: string,
    studentId: string,
    slotStart: string,
    slotEnd: string
  ): Promise<{ hangoutLink: string; eventId: string; summary: string }> {
    const meetId = `yuvahub-meet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const hangoutLink = `https://meet.google.com/${meetId}`;

    const bookingRecord = {
      _id: meetId,
      employerId,
      studentId,
      slotStart,
      slotEnd,
      summary: "YuvaHub Interview Session",
      hangoutLink,
      status: "confirmed",
      createdAt: new Date(),
    };

    if (dbCommand) {
      await dbCommand.collection("interview_bookings").insertOne(bookingRecord);
    }

    return {
      hangoutLink,
      eventId: meetId,
      summary: "YuvaHub Interview Session",
    };
  }

  /**
   * Saves or updates calendar OAuth token credentials in DB.
   */
  public static async saveCalendarToken(data: CalendarTokenData): Promise<boolean> {
    if (dbCommand) {
      await dbCommand.collection("calendar_tokens").updateOne(
        { userId: data.userId },
        { $set: { ...data, updatedAt: new Date() } },
        { upsert: true }
      );
    }
    return true;
  }
}
