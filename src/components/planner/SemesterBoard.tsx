import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { CourseCard } from "./CourseCard";

interface SemesterBoardProps {
  semester: {
    id: string;
    term: string;
    year: number;
    courseIds: string[];
  };
  courses: any[];
}

export const SemesterBoard: React.FC<SemesterBoardProps> = ({ semester, courses }) => {
  const semesterCourses = semester.courseIds
    .map(id => courses.find(c => c.id === id))
    .filter(Boolean);

  const totalCredits = semesterCourses.reduce((sum, c) => sum + (c?.credits || 0), 0);

  return (
    <div className="flex flex-col bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden w-80 flex-shrink-0">
      <div className="p-4 bg-surface/5 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-semibold text-slate-200">
          {semester.term} {semester.year}
        </h3>
        <span className="text-xs font-medium px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full">
          {totalCredits} Credits
        </span>
      </div>

      <Droppable droppableId={semester.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-4 flex flex-col gap-3 min-h-[150px] transition-colors ${
              snapshot.isDraggingOver ? "bg-surface/5" : ""
            }`}
          >
            {semesterCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
            {provided.placeholder}
            {semesterCourses.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-500 border-2 border-dashed border-white/5 rounded-xl">
                Drag courses here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
