'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface CourseItem {
  courseCode: string;
  title: string;
  credits: number;
  prerequisites: string[];
}

interface Column {
  id: string;
  title: string;
  courses: CourseItem[];
}

export default function DegreePlannerHub() {
  const [boardData, setBoardData] = useState<Record<string, Column>>({
    catalog: { id: 'catalog', title: 'Course Catalog', courses: [] },
    Fall_2026: { id: 'Fall_2026', title: 'Fall 2026', courses: [] },
    Spring_2027: { id: 'Spring_2027', title: 'Spring 2027', courses: [] },
  });
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // Calculate accumulated vs target graduation credits
  const totalPlannedCredits = Object.entries(boardData)
    .filter(([id]) => id !== 'catalog')
    .reduce((acc, [_, col]) => acc + col.courses.reduce((sum, c) => sum + c.credits, 0), 0);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = boardData[source.droppableId];
    const destCol = boardData[destination.droppableId];
    const sourceCourses = [...sourceCol.courses];
    const destCourses = source.droppableId === destination.droppableId ? sourceCourses : [...destCol.courses];
    
    const [removed] = sourceCourses.splice(source.index, 1);
    destCourses.splice(destination.index, 0, removed);

    const updatedData = {
      ...boardData,
      [source.droppableId]: { ...sourceCol, courses: sourceCourses },
      [destination.droppableId]: { ...destCol, courses: destCourses },
    };

    setBoardData(updatedData);

    // Call backend graph validator pipeline
    const formattedSemesters = Object.entries(updatedData)
      .filter(([id]) => id !== 'catalog')
      .map(([id, col]) => ({ semesterId: id, courses: col.courses.map(c => c.courseCode) }));

    const res = await fetch('/api/academic-roadmap/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'student_1', semesters: formattedSemesters }),
    });
    const validation = await res.json();

    if (!validation.isValid) {
      const firstError = validation.violations[0];
      setAlertMsg(`⚠️ Prerequisite Warning: ${firstError.course} placed before missing dependencies: ${firstError.missing.join(', ')}`);
    } else {
      setAlertMsg(null);
    }
  };

  return (
    <div className="p-6 bg-zinc-950 text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Degree Roadmap Planner</h1>
          <p className="text-sm text-zinc-400">Drag and drop courses to structure your multi-year timeline safely.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-right">
          <span className="text-xs text-zinc-400 font-medium block">Graduation Credit Progress</span>
          <span className="text-xl font-bold text-purple-400">{totalPlannedCredits}</span>
          <span className="text-zinc-500 text-sm"> / 120 Credits</span>
        </div>
      </div>

      {alertMsg && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-sm font-medium">
          {alertMsg}
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {Object.values(boardData).map((column) => (
            <div key={column.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col min-h-[400px]">
              <h3 className="font-bold text-zinc-200 mb-3 border-b border-zinc-800 pb-2 flex justify-between items-center">
                <span>{column.title}</span>
                <span className="text-xs text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-full font-mono">
                  {column.courses.reduce((sum, c) => sum + c.credits, 0)} Credits
                </span>
              </h3>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 flex-1 min-h-[350px]">
                    {column.courses.map((course, index) => (
                      <Draggable key={course.courseCode} draggableId={course.courseCode} index={index}>
                        {(dragProvided) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className="bg-zinc-950 border border-zinc-800 hover:border-purple-500/50 p-3 rounded-lg shadow transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                                {course.courseCode}
                              </span>
                              <span className="text-xs text-zinc-400 font-medium">{course.credits} Credits</span>
                            </div>
                            <p className="text-sm font-medium text-zinc-200 mt-1">{course.title}</p>
                            {course.prerequisites.length > 0 && (
                              <p className="text-[10px] text-zinc-500 mt-1.5 truncate">
                                Prereqs: {course.prerequisites.join(', ')}
                              </p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
