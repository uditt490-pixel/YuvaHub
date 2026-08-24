import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { BookOpen } from "lucide-react";

interface CourseCardProps {
  course: {
    id: string;
    code: string;
    title: string;
    credits: number;
    prerequisites: string[];
  };
  index: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, index }) => {
  return (
    <Draggable draggableId={course.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2 ${
            snapshot.isDragging
              ? "bg-slate-800/80 border-blue-500/50 shadow-xl shadow-blue-500/10 scale-105 z-50"
              : "bg-slate-900/50 border-white/5 hover:border-white/10 hover:bg-slate-800/50"
          }`}
          style={{ ...provided.draggableProps.style }}
        >
          <div className="flex justify-between items-start">
            <span className="font-semibold text-blue-400">{course.code}</span>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-300 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {course.credits} Cr
            </span>
          </div>
          <h4 className="text-sm text-slate-200 line-clamp-2">{course.title}</h4>
          {course.prerequisites.length > 0 && (
            <div className="text-xs text-amber-500/80 mt-1">
              Prereqs: {course.prerequisites.join(", ")}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};
