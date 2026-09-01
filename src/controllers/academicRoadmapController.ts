import { Request, Response } from 'express';
import { AcademicRoadmap, Course } from '../../shared/schemas/academicRoadmap';

interface PrerequisiteViolation {
  courseId: string;
  courseCode: string;
  missingPrereqCode: string;
  currentSemester: string;
  prereqSemester?: string;
}

/**
 * Validates prerequisite rules using topological ordering across semesters.
 */
export const validateRoadmapPrerequisites = (roadmap: AcademicRoadmap): PrerequisiteViolation[] => {
  const courseSemesterMap = new Map<string, { semesterOrder: number; semesterName: string }>();
  const courseLookup = new Map<string, Course>();

  // Map each course to its designated semester order
  roadmap.semesters.forEach((sem) => {
    sem.courses.forEach((course) => {
      courseSemesterMap.set(course.id, { semesterOrder: sem.order, semesterName: sem.name });
      courseLookup.set(course.id, course);
    });
  });

  const violations: PrerequisiteViolation[] = [];

  roadmap.semesters.forEach((sem) => {
    sem.courses.forEach((course) => {
      course.prerequisites.forEach((prereqId) => {
        const prereqLocation = courseSemesterMap.get(prereqId);
        const prereqCourse = courseLookup.get(prereqId);

        // Violation if prerequisite is missing or placed in the same/later semester
        if (!prereqLocation || prereqLocation.semesterOrder >= sem.order) {
          violations.push({
            courseId: course.id,
            courseCode: course.code,
            missingPrereqCode: prereqCourse ? prereqCourse.code : prereqId,
            currentSemester: sem.name,
            prereqSemester: prereqLocation ? prereqLocation.semesterName : undefined,
          });
        }
      });
    });
  });

  return violations;
};

export const handleValidateRoadmap = async (req: Request, res: Response) => {
  try {
    const roadmap: AcademicRoadmap = req.body;
    const violations = validateRoadmapPrerequisites(roadmap);

    return res.status(200).json({
      isValid: violations.length === 0,
      violations,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to validate academic roadmap', details: err.message });
  }
};
