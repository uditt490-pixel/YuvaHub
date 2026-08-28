import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId, parsePagination } from "../../lib/utils.js";
import { sendPaginated, sendSuccess, sendError } from "../../lib/apiResponse.js";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { page, limit, skip } = parsePagination(req.query);
    const DEFAULT_NOTIFICATIONS = [
      {
        id: "welcome",
        title: "Welcome to YuvaHub! ✨",
        message: "Ready to find your next break? The real data pipeline is active.",
        type: "welcome",
        time: "Just now",
        read: false
      }
    ];

    if (!dbQuery) {
      const sliced = DEFAULT_NOTIFICATIONS.slice(skip, skip + limit);
      return sendPaginated(res, sliced, page, limit, DEFAULT_NOTIFICATIONS.length);
    }

    const collection = dbQuery.collection("notifications");
    let items;
    let total = 0;

    if ((dbQuery as any).isMock) {
      items = (collection as any).data ? (collection as any).data.filter((n: any) => n.userId === user.uid || n.userId === "global-subscribers") : [];
      total = items.length;
      items = items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(skip, skip + limit);
    } else {
      const filter = {
        $or: [
          { userId: user.uid },
          { userId: "global-subscribers" }
        ]
      };
      [items, total] = await Promise.all([
        collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
        collection.countDocuments(filter)
      ]);
    }

    const formatted = items.map((item: any) => {
      const copy = { ...item, id: item._id?.toString() || item.id || "welcome" };
      delete copy._id;

      const elapsedMs = Date.now() - new Date(copy.createdAt).getTime();
      const elapsedMins = Math.floor(elapsedMs / 60000);
      if (elapsedMins < 1) copy.time = "Just now";
      else if (elapsedMins < 60) copy.time = `${elapsedMins}m ago`;
      else {
        const elapsedHrs = Math.floor(elapsedMins / 60);
        if (elapsedHrs < 24) copy.time = `${elapsedHrs}h ago`;
        else copy.time = new Date(copy.createdAt).toLocaleDateString();
      }

      return copy;
    });

    return sendPaginated(res, formatted, page, limit, total);
  } catch (err: any) {
    console.error("GET /api/v1/notifications error:", err);
    const welcome = [{
      id: "welcome",
      title: "Welcome to YuvaHub! ✨",
      message: "Ready to find your next break? The real data pipeline is active.",
      type: "welcome",
      time: "Just now",
      read: false
    }];
    return sendPaginated(res, welcome, 1, 20, welcome.length);
  }
};

export const markRead = async (req: Request, res: Response) => {
  const user = req.user;
  const rawNotifId = req.params.id;
  const id = Array.isArray(rawNotifId) ? rawNotifId[0] : rawNotifId;
  if (!dbCommand) return sendSuccess(res, {});

  const collection = dbCommand.collection("notifications");
  const oid = safeObjectId(id);
  const queryId = oid || id;

  if ((dbCommand as any).isMock) {
    const notif = (collection as any).data ? (collection as any).data.find((n: any) => n.id === id || n._id?.toString() === id) : null;
    if (notif) notif.read = true;
  } else {
    await collection.updateOne(
      { _id: queryId, userId: user.uid },
      { $set: { read: true } }
    );
  }

  return sendSuccess(res, {});
};

export const markAllRead = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbCommand) return sendSuccess(res, {});

  const collection = dbCommand.collection("notifications");

  if ((dbCommand as any).isMock) {
    if ((collection as any).data) {
      (collection as any).data.forEach((n: any) => {
        if (n.userId === user.uid) n.read = true;
      });
    }
  } else {
    await collection.updateMany(
      { userId: user.uid },
      { $set: { read: true } }
    );
  }

  return sendSuccess(res, {});
};

export const markBulkRead = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { notificationIds, all } = req.body;
    if (!dbCommand) return sendSuccess(res, { updatedCount: 0 });

    const collection = dbCommand.collection("notifications");

    if (!Array.isArray(notificationIds) && !all) {
      return sendError(res, "Invalid payload: notificationIds must be an array or all must be true", 400);
    }

    let filter: any = { userId: user.uid, read: { $ne: true } };

    if (!all && Array.isArray(notificationIds) && notificationIds.length > 0) {
      const oids = notificationIds.map((id: string) => safeObjectId(id) || id);
      filter._id = { $in: oids };
    }

    if ((dbCommand as any).isMock) {
      let updatedCount = 0;
      if ((collection as any).data) {
        (collection as any).data.forEach((n: any) => {
          if (n.userId === user.uid && n.read !== true) {
            let match = false;
            if (all || !notificationIds || notificationIds.length === 0) {
              match = true;
            } else {
              match = notificationIds.includes(n.id) || notificationIds.includes(n._id?.toString());
            }
            if (match) {
              n.read = true;
              n.isRead = true;
              updatedCount++;
            }
          }
        });
      }
      return sendSuccess(res, { updatedCount });
    } else {
      const result = await collection.updateMany(
        filter,
        { $set: { read: true, isRead: true } }
      );
      sendSuccess(res, { updatedCount: result.modifiedCount });
    }
  } catch (err: any) {
    console.error("PUT /api/v1/notifications/read-bulk error:", err);
    sendError(res, "Internal Server Error", 500);
  }
};

/**
 * Saves notifications to the database and dispatches them over active WebSocket pipelines
 */
export const triggerNotification = async (
  io: any,
  params: { userId: string; type: string; content: string; link?: string }
) => {
  const { userId, type, content, link } = params;
  try {
    const notificationRecord = {
      userId: userId ? userId.toString() : "user_anon",
      type: type || "system",
      content: content || "",
      link: link || "/",
      isRead: false,
      read: false,
      createdAt: new Date(),
    };

    let notification: any = notificationRecord;
    if (dbCommand) {
      const res = await dbCommand.collection("notifications").insertOne(notificationRecord);
      notification = {
        _id: res.insertedId,
        id: res.insertedId.toString(),
        ...notificationRecord,
      };
    }

    if (io && typeof io.to === "function") {
      io.to(userId.toString()).emit("NEW_IN_APP_NOTIFICATION", notification);
    }

    return notification;
  } catch (error) {
    console.error("Failed to execute real-time notification broadcast:", error);
    return null;
  }
};

/**
 * Handles navigation reads, turning off unread counters immediately
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const userId = req.user?.uid || req.user?.id || (req.user as any)?._id;

    const oid = safeObjectId(id);
    const queryId = oid || id;

    if (dbCommand) {
      await dbCommand.collection("notifications").updateOne(
        { $or: [{ _id: queryId }, { id: id }] },
        { $set: { isRead: true, read: true } }
      );
    }

    let updatedNotification: any = null;
    if (dbQuery) {
      updatedNotification = await dbQuery
        .collection("notifications")
        .findOne({ $or: [{ _id: queryId }, { id: id }] });
    }

    if (!updatedNotification) {
      updatedNotification = {
        _id: id,
        id: id,
        userId: userId || "user_anon",
        isRead: true,
        read: true,
        content: "Notification marked as read",
        link: "/",
        createdAt: new Date().toISOString(),
      };
    }

    return res.status(200).json(updatedNotification);
  } catch (error) {
    console.error("Failed to update notification state:", error);
    return res.status(500).json({ error: "Failed to update notification state." });
  }
};


