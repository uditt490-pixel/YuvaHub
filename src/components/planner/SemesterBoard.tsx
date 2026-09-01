import React, { useMemo } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { CourseCard } from "./CourseCard";

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  department?: string;
}

export interface Semester {
  id: string;
  term: string;
  year: number;
  courseIds: string[];
}

interface SemesterBoardProps {
  semester: Semester;
  courses: Course[];
}

export const SemesterBoard: React.FC<SemesterBoardProps> = ({ semester, courses }) => {
  // O(1) lookup map to avoid linear searches inside loops
  const courseMap = useMemo(() => {
    return new Map<string, Course>(courses.map((c) => [c.id, c]));
  }, [courses]);

  // Derive courses belonging to this semester
  const semesterCourses = useMemo(() => {
    return semester.courseIds
      .map((id) => courseMap.get(id))
      .filter((c): c is Course => Boolean(c));
  }, [semester.courseIds, courseMap]);

  // Aggregate total semester credits
  const totalCredits = useMemo(() => {
    return semesterCourses.reduce((sum, c) => sum + c.credits, 0);
  }, [semesterCourses]);

  return (
    <div className="flex flex-col bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden w-80 flex-shrink-0">
      <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-semibold text-slate-200">
          {semester.term} {semester.year}
        </h3>
        <span className="text-xs font-medium px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
          {totalCredits} Credits
        </span>
      </div>

      <Droppable droppableId={semester.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-4 flex flex-col gap-3 min-h-[150px] transition-colors ${
              snapshot.isDraggingOver ? "bg-white/[0.03]" : ""
            }`}
          >
            {semesterCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}

            {provided.placeholder}

            {semesterCourses.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex-1 min-h-[100px] flex items-center justify-center text-sm text-slate-500 border-2 border-dashed border-white/5 rounded-xl">
                Drag courses here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
