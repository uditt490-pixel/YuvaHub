import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { DirectMessageSchema } from "../../models/directMessageSchema.js";
import { isToxic } from "../../services/toxicity.js";
import { getSocketIO } from "../socketInstance.js";

// Helper for generating deterministic conversation ID from two user IDs
const getConversationId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join("_");
};

export const listConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const conversations = await dbQuery
      .collection("conversations")
      .find({ participants: userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json({ conversations });
  } catch (error) {
    console.error("[listConversations] error:", error);
    res.status(500).json({ error: "Failed to list conversations" });
  }
};

export const getConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const recipientId = req.params.recipientId;
    
    if (!userId || !recipientId) {
      res.status(400).json({ error: "Missing user or recipient ID" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const conversationId = getConversationId(userId, recipientId as string);

    // Fetch messages
    const messages = await dbQuery
      .collection("direct_messages")
      .find({
        $or: [
          { senderId: userId, recipientId: recipientId },
          { senderId: recipientId, recipientId: userId }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // If fetching the first page, mark as read
    if (page === 1) {
      await dbCommand.collection("direct_messages").updateMany(
        { senderId: recipientId, recipientId: userId, readAt: null },
        { $set: { readAt: new Date() } }
      );

      // Reset unread counts for this user in the conversation
      await dbCommand.collection("conversations").updateOne(
        { _id: conversationId },
        { $set: { [`unreadCounts.${userId}`]: 0 } }
      );
    }

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("[getConversation] error:", error);
    res.status(500).json({ error: "Failed to get conversation messages" });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const recipientId = req.params.recipientId;
    const { content } = req.body;

    if (!userId || !recipientId) {
      res.status(400).json({ error: "Missing user or recipient ID" });
      return;
    }

    // Toxicity check
    const toxic = await isToxic(content);
    if (toxic) {
      res.status(400).json({ error: "Message contains inappropriate content and cannot be sent." });
      return;
    }

    // Validate payload
    const parsed = DirectMessageSchema.safeParse({
      senderId: userId,
      recipientId: recipientId,
      content
    });

    if (!parsed.success) {
      res.status(400).json({ error: "Invalid message data", details: parsed.error.issues });
      return;
    }

    const message = parsed.data;

    // Insert message
    const insertResult = await dbCommand.collection("direct_messages").insertOne(message);
    const messageId = insertResult.insertedId || (message as any)._id;

    // Update conversation
    const conversationId = getConversationId(userId, recipientId as string);
    await dbCommand.collection("conversations").updateOne(
      { _id: conversationId },
      {
        $set: {
          participants: [userId, recipientId],
          lastMessage: message,
          updatedAt: new Date()
        },
        $inc: {
          [`unreadCounts.${recipientId}`]: 1
        }
      },
      { upsert: true }
    );

    // Emit socket event to the recipient
    const io = getSocketIO();
    if (io) {
      io.to(`dm_${recipientId}`).emit("dm:newMessage", message);
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error("[sendMessage] error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const recipientId = req.params.recipientId; // Recipient is the person we are marking as read for (who sent it to us)

    if (!userId || !recipientId) {
      res.status(400).json({ error: "Missing user or recipient ID" });
      return;
    }

    // Update messages
    await dbCommand.collection("direct_messages").updateMany(
      { senderId: recipientId, recipientId: userId, readAt: null },
      { $set: { readAt: new Date() } }
    );

    // Update conversation
    const conversationId = getConversationId(userId, recipientId as string);
    await dbCommand.collection("conversations").updateOne(
      { _id: conversationId },
      { $set: { [`unreadCounts.${userId}`]: 0 } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("[markAsRead] error:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
};
