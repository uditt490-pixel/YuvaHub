import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { BookOpen, AlertCircle } from "lucide-react";

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  prerequisites?: string[];
}

interface CourseCardProps {
  course: Course;
  index: number;
  hasPrereqViolation?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  index,
  hasPrereqViolation = false,
}) => {
  const prerequisites = course.prerequisites ?? [];

  return (
    <Draggable draggableId={course.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2 select-none ${
            hasPrereqViolation
              ? "bg-amber-950/20 border-amber-500/40 hover:border-amber-500/60"
              : snapshot.isDragging
              ? "bg-slate-800/90 border-blue-500/60 shadow-xl shadow-blue-500/10 scale-105 z-50"
              : "bg-slate-900/50 border-white/5 hover:border-white/10 hover:bg-slate-800/50"
          }`}
          style={provided.draggableProps.style}
        >
          {/* Card Header: Code & Credits */}
          <div className="flex justify-between items-start">
            <span className="font-semibold text-blue-400">{course.code}</span>
            <span className="text-xs bg-slate-800/80 border border-white/5 px-2 py-1 rounded-full text-slate-300 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-slate-400" />
              {course.credits} Cr
            </span>
          </div>

          {/* Title */}
          <h4 className="text-sm font-medium text-slate-200 line-clamp-2">
            {course.title}
          </h4>

          {/* Prerequisites / Warning Badge */}
          {prerequisites.length > 0 && (
            <div
              className={`text-xs mt-1 flex items-center gap-1.5 ${
                hasPrereqViolation
                  ? "text-amber-400 font-medium"
                  : "text-amber-500/80"
              }`}
            >
              {hasPrereqViolation && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              <span>Prereqs: {prerequisites.join(", ")}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};
