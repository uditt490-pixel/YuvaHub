import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { parseCheckInToken } from "../../lib/qrCode.js";
import { sendSuccess, sendError } from "../../lib/apiResponse.js";

/**
 * POST /api/v1/events/:eventId/checkin
 *
 * Organizer-only: scan a QR code to check in an attendee.
 *
 * Body: { qrToken: string }
 * Returns: { checkedInAt: ISO timestamp, attendeeCount: number, totalRsvps: number }
 *
 * Issue #630: QR code check-in for event attendance
 */
export const checkInAttendee = async (req: Request, res: Response) => {
  try {
    const { qrToken } = req.body;
    const eventId = req.params.eventId;
    const organizerUserId = req.user?.uid;

    if (!qrToken) {
      return sendError(res, "qrToken is required", 400);
    }

    if (!eventId) {
      return sendError(res, "eventId is required", 400);
    }

    if (!organizerUserId) {
      return sendError(res, "Unauthorized", 401);
    }

    if (!dbQuery || !dbCommand) {
      return sendError(res, "Database not available", 503);
    }

    // Parse the QR token
    const parsed = parseCheckInToken(qrToken);
    if (!parsed) {
      return sendError(res, "Invalid QR code format", 400);
    }

    const { userId, eventId: tokenEventId } = parsed;

    // Verify the token is for this event
    if (tokenEventId !== eventId) {
      return sendError(res, "QR code is for a different event", 400);
    }

    // Verify organizer is authorized (check if they created the event or are admin)
    const event = await dbQuery.collection("events").findOne({ _id: eventId });
    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    // Only event creator or admins can check in attendees
    const isCreator = event.createdBy === organizerUserId;
    const isAdmin = req.user?.role === 'admin';
    
    if (!isCreator && !isAdmin) {
      return sendError(res, "Only event organizers can check in attendees", 403);
    }

    // Mark the checkin record
    const checkInResult = await dbCommand.collection("event_checkins").updateOne(
      { eventId, userId },
      {
        $set: {
          status: "checked_in",
          checkedInAt: new Date(),
          checkedInBy: organizerUserId,
        },
        $setOnInsert: {
          eventId,
          userId,
          status: "checked_in",
          checkedInAt: new Date(),
          checkedInBy: organizerUserId,
        },
      },
      { upsert: true }
    );

    // Also update the event_rsvps collection
    await dbCommand.collection("event_rsvps").updateOne(
      { eventId, userId },
      { $set: { status: "checked_in", updatedAt: new Date() } }
    );

    // Fetch current check-in stats for this event
    const checkedInCount = await dbQuery
      .collection("event_checkins")
      .countDocuments({ eventId, status: "checked_in" });

    const totalRsvps = await dbQuery
      .collection("event_rsvps")
      .countDocuments({ eventId, status: "confirmed" });

    // Fetch attendee details
    const attendee = await dbQuery.collection("users").findOne({ _id: userId });

    return sendSuccess(res, {
      checkedInAt: new Date().toISOString(),
      attendeeCount: checkedInCount,
      totalRsvps,
      attendeeName: attendee?.name || attendee?.email || userId,
    });
  } catch (err: any) {
    console.error("[CheckInController] checkInAttendee error:", err);
    return sendError(res, "Internal Server Error", 500);
  }
};

/**
 * GET /api/v1/events/:eventId/checkin-stats
 *
 * Get live check-in statistics for an event (organizer-only).
 *
 * Returns: { checkedIn: number, totalRsvps: number, checkedInList: Array }
 */
export const getCheckInStats = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;

    if (!eventId) {
      return sendError(res, "eventId is required", 400);
    }

    if (!dbQuery) {
      return sendError(res, "Database not available", 503);
    }

    const checkedInCount = await dbQuery
      .collection("event_checkins")
      .countDocuments({ eventId, status: "checked_in" });

    const totalRsvps = await dbQuery
      .collection("event_rsvps")
      .countDocuments({ eventId, status: "confirmed" });

    // Get list of checked-in users (for organizer display)
    const checkedInList = await dbQuery
      .collection("event_checkins")
      .find({ eventId, status: "checked_in" })
      .sort({ checkedInAt: -1 })
      .limit(50)
      .toArray();

    return sendSuccess(res, {
      checkedIn: checkedInCount,
      totalRsvps,
      checkedInList: checkedInList.map((doc: any) => ({
        userId: doc.userId,
        checkedInAt: doc.checkedInAt,
      })),
    });
  } catch (err: any) {
    console.error("[CheckInController] getCheckInStats error:", err);
    return sendError(res, "Internal Server Error", 500);
  }
};
