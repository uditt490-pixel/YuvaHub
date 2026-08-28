import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";

/**
 * Calculates HackerNews Time-Decay Hot Score:
 * Score / (AgeHours + 2)^1.8
 */
export const calculateHotScore = (
  upvotesCount: number,
  downvotesCount: number,
  createdAt: Date | string | number
): number => {
  const score = upvotesCount - downvotesCount;
  const createdTime = new Date(createdAt).getTime();
  const hoursElapsed = Math.max(0, (Date.now() - createdTime) / (1000 * 60 * 60));
  return score / Math.pow(hoursElapsed + 2, 1.8);
};

// In-memory mock store for test/offline environment
const mockVoteStore = new Map<string, { upvotes: string[]; downvotes: string[]; createdAt: string }>();

/**
 * Atomically manages user ID sets in upvotes/downvotes arrays to prevent double-voting.
 * Calculates HackerNews time-decay hot score upon voting.
 */
export const toggleVote = async (req: Request, res: Response) => {
  const { targetId, targetType, voteType } = req.body; // targetType: 'thread', 'post', or 'comment'
  const userId = req.user?.uid || req.user?.id || (req.user as any)?._id || "user_anon";
  const collectionName =
    targetType === "thread" || targetType === "post" ? "posts" : "comments";

  if (!targetId || !voteType) {
    return res.status(400).json({ error: "Missing required fields: targetId and voteType are required." });
  }

  try {
    const oid = safeObjectId(targetId);
    const queryConds: any[] = [{ _id: targetId }, { id: targetId }];
    if (oid) queryConds.push({ _id: oid });

    let item: any = null;
    if (dbQuery) {
      item = await dbQuery.collection(collectionName).findOne({ $or: queryConds });
    }

    if (!item) {
      if (!mockVoteStore.has(targetId)) {
        mockVoteStore.set(targetId, {
          upvotes: [],
          downvotes: [],
          createdAt: new Date().toISOString(),
        });
      }
      item = { _id: targetId, id: targetId, ...mockVoteStore.get(targetId) };
    }

    const upvotesArr: string[] = Array.isArray(item.upvotes)
      ? item.upvotes
      : typeof item.upvotes === "number"
      ? []
      : [];
    const downvotesArr: string[] = Array.isArray(item.downvotes) ? item.downvotes : [];

    const hasUpvoted = upvotesArr.includes(userId);
    const hasDownvoted = downvotesArr.includes(userId);

    let updateQuery: any = {};

    if (voteType === "upvote") {
      if (hasUpvoted) {
        // Reverse upvote if clicked again
        updateQuery = { $pull: { upvotes: userId } };
      } else {
        // Add to upvotes and cleanly clear from downvotes array
        updateQuery = {
          $addToSet: { upvotes: userId },
          $pull: { downvotes: userId },
        };
      }
    } else if (voteType === "downvote") {
      if (hasDownvoted) {
        // Reverse downvote if clicked again
        updateQuery = { $pull: { downvotes: userId } };
      } else {
        // Add to downvotes and cleanly clear from upvotes array
        updateQuery = {
          $addToSet: { downvotes: userId },
          $pull: { upvotes: userId },
        };
      }
    }

    // Atomic database update operation protecting data write parity
    if (dbCommand) {
      await dbCommand
        .collection(collectionName)
        .updateOne({ $or: queryConds }, updateQuery);
    }

    // Fetch updated item or compute mock state
    let updatedItem: any = null;
    if (dbQuery) {
      updatedItem = await dbQuery.collection(collectionName).findOne({ $or: queryConds });
    }

    if (!updatedItem) {
      let newUpvotes = [...upvotesArr];
      let newDownvotes = [...downvotesArr];

      if (voteType === "upvote") {
        if (hasUpvoted) {
          newUpvotes = newUpvotes.filter((id) => id !== userId);
        } else {
          if (!newUpvotes.includes(userId)) newUpvotes.push(userId);
          newDownvotes = newDownvotes.filter((id) => id !== userId);
        }
      } else if (voteType === "downvote") {
        if (hasDownvoted) {
          newDownvotes = newDownvotes.filter((id) => id !== userId);
        } else {
          if (!newDownvotes.includes(userId)) newDownvotes.push(userId);
          newUpvotes = newUpvotes.filter((id) => id !== userId);
        }
      }

      const mockData = {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        createdAt: item.createdAt || new Date().toISOString(),
      };
      mockVoteStore.set(targetId, mockData);

      updatedItem = {
        ...item,
        ...mockData,
      };
    }

    const finalUpvotes: string[] = Array.isArray(updatedItem.upvotes)
      ? updatedItem.upvotes
      : [];
    const finalDownvotes: string[] = Array.isArray(updatedItem.downvotes)
      ? updatedItem.downvotes
      : [];

    // Recalculate Hot Score if it's a Thread/Post model
    let hotScore = 0;
    if (targetType === "thread" || targetType === "post") {
      hotScore = calculateHotScore(
        finalUpvotes.length,
        finalDownvotes.length,
        updatedItem.createdAt || Date.now()
      );

      if (dbCommand) {
        await dbCommand.collection(collectionName).updateOne(
          { $or: queryConds },
          {
            $set: {
              hotScore,
              upvoteScore: finalUpvotes.length - finalDownvotes.length,
            },
          }
        );
      }
    }

    const userVote = finalUpvotes.includes(userId)
      ? "upvote"
      : finalDownvotes.includes(userId)
      ? "downvote"
      : null;

    return res.status(200).json({
      upvotesCount: finalUpvotes.length,
      downvotesCount: finalDownvotes.length,
      hotScore,
      userVote,
    });
  } catch (error) {
    console.error("Database transaction mapping failure:", error);
    return res.status(500).json({ error: "Database transaction mapping failure." });
  }
};
