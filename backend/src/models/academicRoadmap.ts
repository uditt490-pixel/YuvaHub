import { Schema, model, Document } from 'mongoose';

export interface ICourse extends Document {
  courseCode: string; // e.g., "CS101"
  title: string;
  credits: number;
  prerequisites: string[]; // Array of course codes required before taking this course
}

export interface ISemester {
  semesterId: string; // e.g., "Fall_2026", "Spring_2027"
  courses: string[]; // Array of course codes
}

export interface IAcademicRoadmap extends Document {
  userId: string;
  semesters: ISemester[];
  totalCreditsRequired: number;
}

export const CourseCatalogSchema = new Schema<ICourse>({
  courseCode: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  credits: { type: Number, required: true },
  prerequisites: [{ type: String }],
});

export const AcademicRoadmapSchema = new Schema<IAcademicRoadmap>({
  userId: { type: String, required: true, unique: true },
  semesters: [
    {
      semesterId: { type: String, required: true },
      courses: [{ type: String }],
    },
  ],
  totalCreditsRequired: { type: Number, default: 120 },
});

export const Course = model<ICourse>('Course', CourseCatalogSchema);
export const AcademicRoadmap = model<IAcademicRoadmap>('AcademicRoadmap', AcademicRoadmapSchema);
