import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { sendSuccess, sendError } from "../../lib/apiResponse.js";
import { getSocketIO } from "../socketInstance.js";

/**
 * POST /api/v1/event-rsvps/:eventId
 * RSVP for an event. Handles capacity logic (registered vs waitlisted).
 */
export const rsvpForEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user?.uid;
    const { notes } = req.body;

    if (!eventId || !userId) {
      return sendError(res, "Event ID and User ID are required", 400);
    }

    if (!dbQuery || !dbCommand) {
      return sendError(res, "Database not available", 503);
    }

    // Check if already RSVP'd
    const existingRsvp = await dbQuery.collection("event_rsvps").findOne({ eventId, userId });
    if (existingRsvp && existingRsvp.status !== 'cancelled') {
      return sendError(res, "Already RSVP'd or waitlisted for this event", 400);
    }

    // Get event details to check capacity
    const event = await dbQuery.collection("events").findOne({ _id: eventId });
    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    const maxCapacity = event.maxCapacity || 0; // 0 means unlimited
    let status = 'registered';
    let waitlistPosition = undefined;

    if (maxCapacity > 0) {
      const registeredCount = await dbQuery.collection("event_rsvps").countDocuments({ eventId, status: 'registered' });
      if (registeredCount >= maxCapacity) {
        status = 'waitlisted';
        const waitlistedCount = await dbQuery.collection("event_rsvps").countDocuments({ eventId, status: 'waitlisted' });
        waitlistPosition = waitlistedCount + 1;
      }
    }

    const now = new Date();
    
    if (existingRsvp && existingRsvp.status === 'cancelled') {
        // Update existing record
        await dbCommand.collection("event_rsvps").updateOne(
            { eventId, userId },
            { $set: { status, waitlistPosition, notes, updatedAt: now } }
        );
    } else {
        // Insert new RSVP
        await dbCommand.collection("event_rsvps").insertOne({
            eventId,
            userId,
            status,
            waitlistPosition,
            notes,
            createdAt: now,
            updatedAt: now,
        });
    }

    // Emit socket update for real-time count
    const io = getSocketIO();
    if (io) {
        const newRegisteredCount = await dbQuery.collection("event_rsvps").countDocuments({ eventId, status: 'registered' });
        io.emit('event:rsvpUpdated', { eventId, registeredCount: newRegisteredCount });
    }

    return sendSuccess(res, { status, waitlistPosition });
  } catch (err: any) {
    console.error("[EventRsvpController] rsvpForEvent error:", err);
    return sendError(res, "Internal Server Error", 500);
  }
};

/**
 * DELETE /api/v1/event-rsvps/:eventId
 * Cancel RSVP. Promotes the next waitlisted user if applicable.
 */
export const cancelRsvp = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user?.uid;

    if (!eventId || !userId) {
      return sendError(res, "Event ID and User ID are required", 400);
    }

    if (!dbQuery || !dbCommand) {
      return sendError(res, "Database not available", 503);
    }

    const existingRsvp = await dbQuery.collection("event_rsvps").findOne({ eventId, userId });
    if (!existingRsvp || existingRsvp.status === 'cancelled') {
      return sendError(res, "No active RSVP found", 404);
    }

    const previousStatus = existingRsvp.status;
    const now = new Date();

    // Cancel the RSVP
    await dbCommand.collection("event_rsvps").updateOne(
      { eventId, userId },
      { $set: { status: 'cancelled', waitlistPosition: null, updatedAt: now } }
    );

    // If a 'registered' or 'confirmed' user cancelled, promote the first waitlisted user
    if (previousStatus === 'registered' || previousStatus === 'confirmed') {
      const nextInLine = await dbQuery.collection("event_rsvps")
        .find({ eventId, status: 'waitlisted' })
        .sort({ waitlistPosition: 1, createdAt: 1 })
        .limit(1)
        .toArray();

      if (nextInLine && nextInLine.length > 0) {
        const promotedUserId = nextInLine[0].userId;
        await dbCommand.collection("event_rsvps").updateOne(
          { eventId, userId: promotedUserId },
          { $set: { status: 'registered', waitlistPosition: null, updatedAt: now } }
        );
        
        // TODO: Send notification to the promoted user (promotedUserId)
      }
    }

    // Emit socket update
    const io = getSocketIO();
    if (io) {
        const newRegisteredCount = await dbQuery.collection("event_rsvps").countDocuments({ eventId, status: 'registered' });
        io.emit('event:rsvpUpdated', { eventId, registeredCount: newRegisteredCount });
    }

    return sendSuccess(res, { message: "RSVP cancelled successfully" });
  } catch (err: any) {
    console.error("[EventRsvpController] cancelRsvp error:", err);
    return sendError(res, "Internal Server Error", 500);
  }
};

/**
 * GET /api/v1/event-rsvps
 * Fetch all RSVPs for the current user.
 */
export const getUserRsvps = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    if (!dbQuery) {
      return sendError(res, "Database not available", 503);
    }

    // Fetch user RSVPs
    const rsvps = await dbQuery.collection("event_rsvps").find({ userId }).toArray();
    
    // Enrich with event details
    const eventIds = rsvps.map((r: any) => r.eventId);
    const events = await dbQuery.collection("events").find({ _id: { $in: eventIds } }).toArray();
    const eventMap = new Map(events.map((e: any) => [e._id.toString(), e]));

    const enrichedRsvps = rsvps.map((rsvp: any) => ({
      ...rsvp,
      event: eventMap.get(rsvp.eventId) || null
    })).filter((r: any) => r.event !== null); // Filter out RSVPs for deleted events

    return sendSuccess(res, enrichedRsvps);
  } catch (err: any) {
    console.error("[EventRsvpController] getUserRsvps error:", err);
    return sendError(res, "Internal Server Error", 500);
  }
};
