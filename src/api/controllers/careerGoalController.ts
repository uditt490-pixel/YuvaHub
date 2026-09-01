import { Request, Response } from "express";
import { getDbCommand as getDb } from "../db.js";
import { CareerGoalSchema } from "../../models/careerGoalSchema.js";
import { ObjectId } from "mongodb";
import { generateCareerMilestones } from "../../services/gemini.js";

export const createGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { goalTitle, targetRole, targetDate } = req.body;

    if (!goalTitle || !targetRole || !targetDate) {
      return res.status(400).json({ error: "goalTitle, targetRole, and targetDate are required" });
    }

    // Generate milestones using Gemini
    const milestones = await generateCareerMilestones(goalTitle, targetRole, targetDate);

    const goalData = {
      userId,
      goalTitle,
      targetRole,
      targetDate: new Date(targetDate),
      status: "active" as const,
      milestones: milestones.map((m: any) => ({
        id: new ObjectId().toString(),
        title: m.title,
        description: m.description,
        dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
        status: m.status || "not_started",
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validatedData = CareerGoalSchema.parse(goalData);

    const db = getDb();
    const result = await db.collection("career_goals").insertOne(validatedData);

    res.status(201).json({
      message: "Goal created successfully",
      goalId: result.insertedId,
      goal: { _id: result.insertedId, ...validatedData },
    });
  } catch (error: any) {
    console.error("Error creating career goal:", error);
    res.status(500).json({ error: "Failed to create career goal", details: error.message });
  }
};

export const getGoals = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = getDb();
    const goals = await db.collection("career_goals")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ goals });
  } catch (error: any) {
    console.error("Error fetching career goals:", error);
    res.status(500).json({ error: "Failed to fetch career goals" });
  }
};

export const updateMilestone = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { goalId, milestoneId } = req.params;
    const { status } = req.body;

    if (!goalId || !milestoneId || !status) {
      return res.status(400).json({ error: "goalId, milestoneId, and status are required" });
    }

    const db = getDb();
    const goal = await db.collection("career_goals").findOne({ 
      _id: new ObjectId(goalId as string), 
      userId 
    });

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const completedAt = status === "completed" ? new Date() : null;

    const result = await db.collection("career_goals").updateOne(
      { _id: new ObjectId(goalId as string), "milestones.id": milestoneId },
      {
        $set: {
          "milestones.$.status": status,
          "milestones.$.completedAt": completedAt,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    res.status(200).json({ message: "Milestone updated successfully" });
  } catch (error: any) {
    console.error("Error updating milestone:", error);
    res.status(500).json({ error: "Failed to update milestone" });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { goalId } = req.params;

    if (!goalId) {
      return res.status(400).json({ error: "goalId is required" });
    }

    const db = getDb();
    const result = await db.collection("career_goals").deleteOne({ 
      _id: new ObjectId(goalId as string), 
      userId 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting career goal:", error);
    res.status(500).json({ error: "Failed to delete career goal" });
  }
};
