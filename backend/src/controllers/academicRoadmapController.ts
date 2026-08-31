import { Request, Response } from 'express';
import { AcademicRoadmap, Course } from '../models/academicRoadmap';

export const validateAndSaveRoadmap = async (req: Request, res: Response) => {
  try {
    const { userId, semesters } = req.body;

    // 1. Fetch all course rules to build the prerequisite mapping graph
    const allCourses = await Course.find();
    const courseMap = new Map<string, string[]>(); // courseCode -> prerequisites[]
    allCourses.forEach(c => courseMap.set(c.courseCode, c.prerequisites));

    // 2. Track past course accumulation sequence chronologically
    const completedCourses = new Set<string>();
    const violations: { course: string; missing: string[]; semesterId: string }[] = [];

    for (const sem of semesters) {
      for (const courseCode of sem.courses) {
        const prereqs = courseMap.get(courseCode) || [];
        const missingPrereqs = prereqs.filter(p => !completedCourses.has(p));

        if (missingPrereqs.length > 0) {
          violations.push({
            course: courseCode,
            missing: missingPrereqs,
            semesterId: sem.semesterId,
          });
        }
      }
      // Add this semester's courses to the completed pool *after* validation 
      // to ensure co-requisite rules don't bypass timeline restrictions.
      sem.courses.forEach((c: string) => completedCourses.add(c));
    }

    // 3. Save roadmap state but notify the client if warning indicators trip
    let roadmap = await AcademicRoadmap.findOne({ userId });
    if (!roadmap) {
      roadmap = new AcademicRoadmap({ userId, semesters });
    } else {
      roadmap.semesters = semesters;
    }
    await roadmap.save();

    return res.status(200).json({
      success: true,
      isValid: violations.length === 0,
      violations,
      roadmap,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
