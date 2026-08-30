import { getDbCommand } from "../db.js";

function getDateFilter(dateRange: string) {
  const now = new Date();
  let startDate = new Date(0); // All time

  if (dateRange === "7d") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (dateRange === "30d") {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (dateRange === "90d") {
    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }
  return startDate;
}

export class AnalyticsAggregationService {
  static async getUserMetrics(userId: string, dateRange: string) {
    const db = getDbCommand();
    if (!db) throw new Error("Database not connected");

    const collection = db.collection("analytics");
    const startDate = getDateFilter(dateRange);

    const matchStage = {
      $match: {
        userId,
        timestamp: { $gte: startDate.toISOString() }
      }
    };

    // Category Breakdown
    const categoryBreakdown = await collection.aggregate([
      matchStage,
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { category: "$_id", count: 1, _id: 0 } }
    ]).toArray();

    // Heatmap Data (grouped by date)
    const heatmapData = await collection.aggregate([
      matchStage,
      { 
        $group: { 
          _id: { $substr: ["$timestamp", 0, 10] }, 
          count: { $sum: 1 } 
        } 
      },
      { $project: { date: "$_id", count: 1, _id: 0 } },
      { $sort: { date: 1 } }
    ]).toArray();

    // Conversion Funnel (Mocked/Inferred for now based on typical events)
    const actionCounts = await collection.aggregate([
      matchStage,
      { $group: { _id: "$action", count: { $sum: 1 } } }
    ]).toArray();

    const funnel = [
      { step: "Views", count: actionCounts.find((a: any) => a._id === "view")?.count || 0 },
      { step: "Clicks", count: actionCounts.find((a: any) => a._id === "click")?.count || 0 },
      { step: "Applications", count: actionCounts.find((a: any) => a._id === "apply")?.count || 0 }
    ];

    return {
      categoryBreakdown,
      heatmapData,
      funnel
    };
  }

  static async getPlatformMetrics(dateRange: string) {
    const db = getDbCommand();
    if (!db) throw new Error("Database not connected");

    const collection = db.collection("analytics");
    const startDate = getDateFilter(dateRange);

    const matchStage = {
      $match: {
        timestamp: { $gte: startDate.toISOString() }
      }
    };

    // DAU calculation (grouped by date and distinct userIds)
    const dauData = await collection.aggregate([
      matchStage,
      { 
        $group: { 
          _id: { date: { $substr: ["$timestamp", 0, 10] }, userId: "$userId" } 
        } 
      },
      {
        $group: {
          _id: "$_id.date",
          activeUsers: { $sum: 1 }
        }
      },
      { $project: { date: "$_id", activeUsers: 1, _id: 0 } },
      { $sort: { date: 1 } }
    ]).toArray();

    // Total Events
    const totalEvents = await collection.countDocuments(matchStage.$match);

    return {
      dauData,
      totalEvents
    };
  }
}
