import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";

export const searchHandler = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || "";
    const typesStr = req.query.types as string;
    const locationTypesStr = req.query.locationTypes as string;
    const stipend = req.query.stipend as string;
    const minSalaryVal = req.query.minSalary ? parseInt(req.query.minSalary as string, 10) : undefined;
    const deadlineType = req.query.deadlineType as string;
    const startDateStr = req.query.startDate as string;
    const endDateStr = req.query.endDate as string;

    if (!dbCommand || !dbQuery) return res.json({ results: [], meta: { total_found: 0 } });
    const andConditions: any[] = [];

    // 1. Opportunity Type Filter (multiple types supported)
    if (typesStr) {
      const types = typesStr.split(",").map(t => t.trim());
      const typeRegexes = types.map(t => new RegExp(`^${t.replace(/s$/, "")}$`, "i"));
      andConditions.push({ type: { $in: typeRegexes } });
    }

    // 2. Location Type Filter (Remote, Onsite, Hybrid)
    if (locationTypesStr) {
      const locationTypes = locationTypesStr.split(",").map(l => l.trim().toLowerCase());
      const locFilters: any[] = [];
      if (locationTypes.includes('remote')) {
        locFilters.push({ location: { $regex: "remote|online|virtual", $options: "i" } });
      }
      if (locationTypes.includes('hybrid')) {
        locFilters.push({ location: { $regex: "hybrid", $options: "i" } });
      }
      if (locationTypes.includes('onsite')) {
        locFilters.push({
          $and: [
            { location: { $not: /remote|online|virtual/i } },
            { location: { $not: /hybrid/i } }
          ]
        });
      }
      if (locFilters.length > 0) {
        andConditions.push({ $or: locFilters });
      }
    }

    // 3. Stipend / Salary Filter
    if (stipend) {
      if (stipend.toLowerCase() === 'paid') {
        andConditions.push({
          $or: [
            { stipend: { $regex: "^paid$", $options: "i" } },
            { price: { $nin: ["free", "Free", 0, "0"] } },
            { stipendAmount: { $gt: 0 } },
            { salary: { $gt: 0 } }
          ]
        });
      } else if (stipend.toLowerCase() === 'unpaid') {
        andConditions.push({
          $or: [
            { stipend: { $in: ["unpaid", "free", "Free"] } },
            { price: { $in: ["free", "Free", 0, "0", null] } },
            { stipendAmount: { $in: [0, null] } },
            { salary: { $in: [0, null] } }
          ]
        });
      }
    }

    // 4. Min Salary / Stipend Filter
    if (minSalaryVal !== undefined && !isNaN(minSalaryVal) && minSalaryVal > 0) {
      andConditions.push({
        $or: [
          { stipendAmount: { $gte: minSalaryVal } },
          { salary: { $gte: minSalaryVal } }
        ]
      });
    }

    // 5. Deadline Filter
    if (deadlineType && deadlineType !== 'All') {
      const now = new Date();
      if (deadlineType === 'Soon') {
        const fortyEightHoursLater = new Date(Date.now() + 48 * 60 * 60 * 1000);
        andConditions.push({
          $or: [
            { deadlineDate: { $gte: now, $lte: fortyEightHoursLater } },
            { deadline: { $regex: "([0-1]|2)\\s*days?(\\s*left)?|24\\s*hours?", $options: "i" } }
          ]
        });
      } else if (deadlineType === 'Active') {
        andConditions.push({
          $or: [
            { deadlineDate: { $gte: now } },
            { deadline: { $regex: "days left|weeks left|rolling|active|open", $options: "i" } },
            { deadline: { $not: /closed|expired/i } }
          ]
        });
      } else if (deadlineType === 'Custom' && startDateStr && endDateStr) {
        andConditions.push({
          $or: [
            { deadlineDate: { $gte: new Date(startDateStr), $lte: new Date(endDateStr) } },
            { deadline: { $gte: startDateStr, $lte: endDateStr } }
          ]
        });
      }
    }

    let items: any[] = [];
    if (q) {
      const pipeline: any[] = [
        {
          $search: {
            index: "default",
            compound: {
              should: [
                {
                  text: {
                    query: q,
                    path: ["title", "tags"],
                    fuzzy: { maxEdits: 2 }
                  }
                },
                {
                  text: {
                    query: q,
                    path: ["company", "description"]
                  }
                }
              ]
            },
            highlight: {
              path: ["title", "tags", "company", "description"]
            }
          }
        }
      ];

      if (andConditions.length > 0) {
        pipeline.push({ $match: { $and: andConditions } });
      }

      pipeline.push({
        $project: {
          title: 1,
          description: 1,
          company: 1,
          tags: 1,
          type: 1,
          location: 1,
          stipend: 1,
          price: 1,
          stipendAmount: 1,
          salary: 1,
          deadline: 1,
          deadlineDate: 1,
          apply_link: 1,
          source_quality_score: 1,
          created_at: 1,
          highlights: { $meta: "searchHighlights" },
          score: { $meta: "searchScore" }
        }
      });

      pipeline.push({ $limit: 50 });
      items = await dbQuery.collection("opportunities").aggregate(pipeline).toArray();
    } else {
      const filter: any = {};
      if (andConditions.length > 0) {
        filter.$and = andConditions;
      }
      items = await dbQuery.collection("opportunities").find(filter).limit(50).toArray();
    }

    let mapped = items.map((doc: any) => {
      const docId = doc._id ? doc._id.toString() : (doc.id ? doc.id.toString() : "");
      const d = { ...doc, id: docId };
      delete d._id;
      return d;
    });

    res.json({
      results: mapped.slice(0, 20),
      meta: { query: q, total_found: mapped.length }
    });
  } catch (err) {
    console.error("Search endpoint error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
