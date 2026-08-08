import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId, normalizeParam } from "../../lib/utils.js";
import { sendSuccess, sendError } from "../../lib/apiResponse.js";
import { getSocketIO } from "../socketInstance.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Insert an in-app notification and emit it over Socket.IO. */
async function dispatchNotification(payload: {
  userId: string;
  type: string;
  title: string;
  message: string;
  targetId?: string;
}) {
  if (!dbCommand) return;
  try {
    const doc = {
      ...payload,
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };
    const result = await dbCommand.collection("notifications").insertOne(doc);
    const io = getSocketIO();
    if (io) {
      io.to(payload.userId).emit("notification", {
        ...doc,
        id: result.insertedId?.toString(),
      });
    }
  } catch (err) {
    console.error("[EventController] dispatchNotification error:", err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/v1/events  – list all events
// ---------------------------------------------------------------------------
export const getEvents = async (req: Request, res: Response) => {
  try {
    const userId: string = req.user?.uid ?? "";

    const MOCK_EVENTS = [
      {
        _id: "evt_1",
        id: "evt_1",
        title: "Generative AI & Agentic Workflows Summit",
        chapter: "IIT Bombay Open Source Club",
        date: "2026-08-10",
        time: "5:00 PM IST",
        location: "Online / Auditorium 1",
        rsvpCount: 340,
        maxCapacity: 500,
        waitlistCount: 0,
      },
      {
        _id: "evt_2",
        id: "evt_2",
        title: "Rust & WebAssembly Systems Workshop",
        chapter: "BITS Pilani Developer Guild",
        date: "2026-08-18",
        time: "6:30 PM IST",
        location: "Tech Block 3",
        rsvpCount: 200,
        maxCapacity: 200,
        waitlistCount: 5,
      },
    ];

    if (!dbQuery) {
      return sendSuccess(res, MOCK_EVENTS);
    }

    const events = await dbQuery
      .collection("events")
      .find({})
      .sort({ date: 1 })
      .toArray();

    if (!events.length) {
      return sendSuccess(res, MOCK_EVENTS);
    }

    // Attach the calling user's status to each event
    let enriched: any[] = events;
    if (userId) {
      const eventIds = events.map((e: any) => e._id?.toString() ?? e.id);
      const userRsvps = await dbQuery
        .collection("event_rsvps")
        .find({ userId, eventId: { $in: eventIds } })
        .toArray();

      const rsvpMap: Record<string, string> = {};
      for (const r of userRsvps) {
        rsvpMap[r.eventId] = r.status; // "confirmed" | "waitlisted" | "cancelled"
      }

      enriched = events.map((e: any) => {
        const eid = e._id?.toString() ?? e.id;
        return { ...e, id: eid, userStatus: rsvpMap[eid] ?? null };
      });
    }

    return sendSuccess(res, enriched);
  } catch (err: any) {
    console.error("[EventController] getEvents error:", err);
    return sendError(res, "Internal Server Error", 500);
  }
};

// ---------------------------------------------------------------------------
// POST /api/v1/events  – create a new event (authenticated)
// ---------------------------------------------------------------------------
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, chapter, date, time, location, maxCapacity } = req.body;

    if (!title || !date || !maxCapacity) {
      return sendError(res, "title, date and maxCapacity are required", 400);
    }

    const capacity = parseInt(maxCapacity, 10);
    if (isNaN(capacity) || capacity < 1) {
      return sendError(res, "maxCapacity must be a positive integer", 400);
    }

    const event = {
      title: String(title).trim(),
      chapter: String(chapter ?? "Campus Chapter").trim(),
      date: String(date).trim(),
      time: String(time ?? "TBD").trim(),
      location: String(location ?? "TBD").trim(),
      maxCapacity: capacity,
      rsvpCount: 1,
      waitlistCount: 0,
      createdBy: req.user.uid,
      createdAt: new Date(),
    };

    if (!dbCommand) {
      return sendSuccess(res, { ...event, id: `evt_${Date.now()}` }, 201);
    }

    const result = await dbCommand.collection("events").insertOne(event);
    const eventId = result.insertedId.toString();

    // Creator gets a confirmed RSVP automatically
    await dbCommand.collection("event_rsvps").insertOne({
      eventId,
      userId: req.user.uid,
      status: "confirmed",
      position: 1,
      createdAt: new Date(),
    });

    return sendSuccess(res, { ...event, id: eventId }, 201);
  } catch (err: any) {
    console.error("[EventController] createEvent error:", err);
    return sendError(res, "Internal Server Error", 500);
  }
};

// ---------------------------------------------------------------------------
// POST /api/v1/events/:eventId/rsvp  – RSVP or join waitlist
// ---------------------------------------------------------------------------
export const rsvpEvent = async (req: Request, res: Response) => {
  try {
    const eventIdStr = normalizeParam(req.params.eventId);
    if (!eventIdStr) return sendError(res, "Missing eventId", 400);

    if (!dbCommand || !dbQuery) {
      return sendError(res, "Database not available", 503);
    }

    const userId: string = req.user.uid;
    const oid = safeObjectId(eventIdStr);
    const eventFilter = oid
      ? { $or: [{ _id: oid }, { id: eventIdStr }] }
      : { id: eventIdStr };

    const event = await dbQuery.collection("events").findOne(eventFilter);
    if (!event) return sendError(res, "Event not found", 404);

    const realEventId = event._id?.toString() ?? event.id ?? eventIdStr;

    // Check if user already has an active RSVP/waitlist entry
    const existing = await dbQuery
      .collection("event_rsvps")
      .findOne({ eventId: realEventId, userId, status: { $ne: "cancelled" } });

    if (existing) {
      return sendError(
        res,
        existing.status === "confirmed"
          ? "You already have a confirmed RSVP for this event"
          : "You are already on the waitlist for this event",
        409,
      );
    }

    const isFull = (event.rsvpCount ?? 0) >= (event.maxCapacity ?? Infinity);

    if (!isFull) {
      // Confirm immediately
      await dbCommand.collection("event_rsvps").insertOne({
        eventId: realEventId,
        userId,
        status: "confirmed",
        position: null,
        createdAt: new Date(),
      });

      const eventOid = safeObjectId(realEventId);
      await dbCommand
        .collection("events")
        .updateOne(
          eventOid ? { _id: eventOid } : { id: realEventId },
          { $inc: { rsvpCount: 1 } },
        );

      await dispatchNotification({
        userId,
        type: "rsvp_confirmed",
        title: "✅ RSVP Confirmed",
        message: `You have a confirmed spot at "${event.title}" on ${event.date}.`,
        targetId: realEventId,
      });

      return sendSuccess(res, {
        status: "confirmed",
        message: "Your RSVP is confirmed!",
      });
    } else {
      // Event is full — join waitlist
      const waitlistCount = await dbQuery
        .collection("event_rsvps")
        .countDocuments({ eventId: realEventId, status: "waitlisted" });

      const position = waitlistCount + 1;

      await dbCommand.collection("event_rsvps").insertOne({
        eventId: realEventId,
        userId,
        status: "waitlisted",
        position,
        createdAt: new Date(),
      });

      const eventOid = safeObjectId(realEventId);
      await dbCommand
        .collection("events")
        .updateOne(
          eventOid ? { _id: eventOid } : { id: realEventId },
          { $inc: { waitlistCount: 1 } },
        );

      await dispatchNotification({
        userId,
        type: "waitlist_joined",
        title: "🕐 Added to Waitlist",
        message: `You are #${position} on the waitlist for "${event.title}". We'll notify you if a spot opens.`,
        targetId: realEventId,
      });

      return sendSuccess(res, {
        status: "waitlisted",
        position,
        message: `You are #${position} on the waitlist.`,
      });
    }
  } catch (err: any) {
    console.error("[EventController] rsvpEvent error:", err);
    return sendError(res, "Internal Server Error", 500);
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/v1/events/:eventId/rsvp  – cancel RSVP / leave waitlist
// ---------------------------------------------------------------------------
export const cancelRsvp = async (req: Request, res: Response) => {
  try {
    const eventIdStr = normalizeParam(req.params.eventId);
    if (!eventIdStr) return sendError(res, "Missing eventId", 400);

    if (!dbCommand || !dbQuery) {
      return sendError(res, "Database not available", 503);
    }

    const userId: string = req.user.uid;

    const existing = await dbQuery
      .collection("event_rsvps")
      .findOne({ eventId: eventIdStr, userId, status: { $ne: "cancelled" } });

    if (!existing) {
      return sendError(res, "No active RSVP found for this event", 404);
    }

    const wasConfirmed = existing.status === "confirmed";

    // Mark as cancelled
    const rsvpOid = safeObjectId(existing._id?.toString() ?? "");
    await dbCommand
      .collection("event_rsvps")
      .updateOne(
        rsvpOid ? { _id: rsvpOid } : { eventId: eventIdStr, userId },
        { $set: { status: "cancelled", cancelledAt: new Date() } },
      );

    const eventOid = safeObjectId(eventIdStr);
    const eventFilter = eventOid
      ? { $or: [{ _id: eventOid }, { id: eventIdStr }] }
      : { id: eventIdStr };

    if (wasConfirmed) {
      // Free up a confirmed seat
      await dbCommand
        .collection("events")
        .updateOne(eventFilter, { $inc: { rsvpCount: -1 } });

      // Promote next waitlisted user (FIFO by position then createdAt)
      const next = await dbQuery
        .collection("event_rsvps")
        .find({ eventId: eventIdStr, status: "waitlisted" })
        .sort({ position: 1, createdAt: 1 })
        .limit(1)
        .toArray();

      if (next.length > 0) {
        const promoted = next[0];
        const promotedOid = safeObjectId(promoted._id?.toString() ?? "");

        // Promote to confirmed
        await dbCommand
          .collection("event_rsvps")
          .updateOne(
            promotedOid ? { _id: promotedOid } : { _id: promoted._id },
            {
              $set: {
                status: "confirmed",
                position: null,
                promotedAt: new Date(),
              },
            },
          );

        // Decrement waitlistCount, keep rsvpCount balanced (was already decremented)
        await dbCommand
          .collection("events")
          .updateOne(eventFilter, {
            $inc: { waitlistCount: -1, rsvpCount: 1 },
          });

        // Reorder remaining waitlist positions
        const remaining = await dbQuery
          .collection("event_rsvps")
          .find({ eventId: eventIdStr, status: "waitlisted" })
          .sort({ position: 1, createdAt: 1 })
          .toArray();

        for (let i = 0; i < remaining.length; i++) {
          const entryOid = safeObjectId(remaining[i]._id?.toString() ?? "");
          await dbCommand
            .collection("event_rsvps")
            .updateOne(
              entryOid ? { _id: entryOid } : { _id: remaining[i]._id },
              { $set: { position: i + 1 } },
            );
        }

        // Fetch event title for the notification
        const event = await dbQuery
          .collection("events")
          .findOne(eventFilter);

        await dispatchNotification({
          userId: promoted.userId,
          type: "waitlist_promoted",
          title: "🎉 You're In! Waitlist → Confirmed",
          message: `A spot opened up at "${event?.title ?? "the event"}". Your RSVP is now confirmed!`,
          targetId: eventIdStr,
        });
      }
    } else {
      // Was on waitlist — just decrement waitlistCount
      await dbCommand
        .collection("events")
        .updateOne(eventFilter, { $inc: { waitlistCount: -1 } });
    }

    return sendSuccess(res, { message: "RSVP cancelled successfully." });
  } catch (err: any) {
    console.error("[EventController] cancelRsvp error:", err);
    return sendError(res, "Internal Server Error", 500);
  }
};

// ---------------------------------------------------------------------------
// GET /api/v1/events/:eventId/waitlist  – view waitlist (owner/admin)
// ---------------------------------------------------------------------------
export const getWaitlist = async (req: Request, res: Response) => {
  try {
    const eventIdStr = normalizeParam(req.params.eventId);
    if (!eventIdStr) return sendError(res, "Missing eventId", 400);

    if (!dbQuery) return sendError(res, "Database not available", 503);

    const waitlist = await dbQuery
      .collection("event_rsvps")
      .find({ eventId: eventIdStr, status: "waitlisted" })
      .sort({ position: 1, createdAt: 1 })
      .toArray();

    return sendSuccess(res, waitlist);
  } catch (err: any) {
    console.error("[EventController] getWaitlist error:", err);
    return sendError(res, "Internal Server Error", 500);
  }
};
