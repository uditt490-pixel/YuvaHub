import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";
import { sendSuccess, sendError, sendBadRequest, sendNotFound } from "../../lib/apiResponse.js";
import { CourseCatalog } from "../../models/courseCatalogSchema.js";
import { AcademicRoadmap, AcademicRoadmapSchema } from "../../models/academicRoadmapSchema.js";

const MOCK_COURSE_CATALOG: CourseCatalog[] = [
  { id: "cs101", code: "CS 101", title: "Introduction to Computer Science", credits: 4, description: "Basic programming.", prerequisites: [], corequisites: [], termsOffered: ["Fall", "Spring"] },
  { id: "cs102", code: "CS 102", title: "Data Structures", credits: 4, description: "Lists, trees, graphs.", prerequisites: ["cs101"], corequisites: [], termsOffered: ["Fall", "Spring"] },
  { id: "cs201", code: "CS 201", title: "Algorithms", credits: 4, description: "Algorithm design.", prerequisites: ["cs102"], corequisites: [], termsOffered: ["Fall", "Spring"] },
  { id: "math101", code: "MATH 101", title: "Calculus I", credits: 4, description: "Limits and derivatives.", prerequisites: [], corequisites: [], termsOffered: ["Fall", "Spring"] },
  { id: "math102", code: "MATH 102", title: "Calculus II", credits: 4, description: "Integrals.", prerequisites: ["math101"], corequisites: [], termsOffered: ["Fall", "Spring"] },
  { id: "cs301", code: "CS 301", title: "Operating Systems", credits: 4, description: "OS principles.", prerequisites: ["cs201"], corequisites: [], termsOffered: ["Fall"] },
  { id: "cs401", code: "CS 401", title: "Artificial Intelligence", credits: 4, description: "Intro to AI.", prerequisites: ["cs201"], corequisites: [], termsOffered: ["Spring"] },
];

export const getCourseCatalog = async (req: Request, res: Response) => {
  try {
    return sendSuccess(res, { courses: MOCK_COURSE_CATALOG });
  } catch (err) {
    return sendError(res, "Failed to retrieve course catalog", 500);
  }
};

export const getUserRoadmap = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || req.user?._id?.toString();
    if (!userId) return sendBadRequest(res, "User not authenticated");

    if (!dbQuery) {
      return sendSuccess(res, { roadmap: { userId, semesters: [], totalCreditsPlanned: 0, graduationRequirementCredits: 120 } });
    }

    const doc = await dbQuery.collection("academic_roadmaps").findOne({ userId });
    
    if (!doc) {
      return sendSuccess(res, { roadmap: { userId, semesters: [], totalCreditsPlanned: 0, graduationRequirementCredits: 120 } });
    }

    return sendSuccess(res, { roadmap: doc });
  } catch (err) {
    return sendError(res, "Failed to retrieve roadmap", 500);
  }
};

export const saveUserRoadmap = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || req.user?._id?.toString();
    if (!userId) return sendBadRequest(res, "User not authenticated");

    const parsed = AcademicRoadmapSchema.safeParse({ ...req.body, userId });
    if (!parsed.success) {
      return sendBadRequest(res, "Invalid roadmap data");
    }

    const data = parsed.data;
    
    // Server-side validation logic for prerequisites
    const courseToSemesterIndex = new Map<string, number>();
    data.semesters.forEach((semester, index) => {
      semester.courseIds.forEach(courseId => {
        courseToSemesterIndex.set(courseId, index);
      });
    });

    for (const semester of data.semesters) {
      const currentSemIndex = data.semesters.indexOf(semester);
      for (const courseId of semester.courseIds) {
        const course = MOCK_COURSE_CATALOG.find(c => c.id === courseId);
        if (course) {
          for (const prereqId of course.prerequisites) {
            const prereqSemIndex = courseToSemesterIndex.get(prereqId);
            if (prereqSemIndex !== undefined && prereqSemIndex >= currentSemIndex) {
              return sendBadRequest(res, `Prerequisite violation: ${course.code} requires ${prereqId} to be taken before it.`);
            }
          }
        }
      }
    }

    if (!dbCommand) {
      return sendSuccess(res, { message: "Roadmap saved successfully (mock)", roadmap: data });
    }

    await dbCommand.collection("academic_roadmaps").updateOne(
      { userId },
      { $set: data },
      { upsert: true }
    );

    return sendSuccess(res, { message: "Roadmap saved successfully", roadmap: data });
  } catch (err) {
    return sendError(res, "Failed to save roadmap", 500);
  }
};
