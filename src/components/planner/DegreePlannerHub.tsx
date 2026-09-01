import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { SemesterBoard } from './SemesterBoard';
import { PrerequisiteAlert } from './PrerequisiteAlert';
import { AcademicRoadmap, Course } from '../../../shared/schemas/academicRoadmap';

const INITIAL_ROADMAP: AcademicRoadmap = {
  id: 'roadmap-1',
  studentId: 'student-101',
  degreeName: 'B.Tech Computer Science & Engineering',
  requiredCredits: 120,
  semesters: [
    {
      id: 'sem-1',
      name: 'Fall 2025',
      year: 2025,
      order: 1,
      courses: [
        { id: 'cs101', code: 'CS101', title: 'Intro to Programming', credits: 4, department: 'CS', prerequisites: [], corequisites: [] },
        { id: 'math101', code: 'MATH101', title: 'Calculus I', credits: 4, department: 'MATH', prerequisites: [], corequisites: [] },
      ],
    },
    {
      id: 'sem-2',
      name: 'Spring 2026',
      year: 2026,
      order: 2,
      courses: [
        { id: 'cs102', code: 'CS102', title: 'Data Structures', credits: 4, department: 'CS', prerequisites: ['cs101'], corequisites: [] },
      ],
    },
  ],
};

export const DegreePlannerHub: React.FC = () => {
  const [roadmap, setRoadmap] = useState<AcademicRoadmap>(INITIAL_ROADMAP);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const totalPlannedCredits = roadmap.semesters.reduce(
    (acc, sem) => acc + sem.courses.reduce((cAcc, c) => cAcc + c.credits, 0),
    0
  );

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceSemIndex = roadmap.semesters.findIndex((s) => s.id === source.droppableId);
    const destSemIndex = roadmap.semesters.findIndex((s) => s.id === destination.droppableId);

    const sourceSem = roadmap.semesters[sourceSemIndex];
    const destSem = roadmap.semesters[destSemIndex];

    const sourceCourses = [...sourceSem.courses];
    const destCourses = sourceSemIndex === destSemIndex ? sourceCourses : [...destSem.courses];

    const [movedCourse] = sourceCourses.splice(source.index, 1);

    // Prerequisite check: Ensure prerequisites are in earlier semesters
    if (sourceSemIndex !== destSemIndex && movedCourse.prerequisites.length > 0) {
      const hasViolation = movedCourse.prerequisites.some((prereqId) => {
        const prereqSemIndex = roadmap.semesters.findIndex((s) =>
          s.courses.some((c) => c.id === prereqId)
        );
        return prereqSemIndex >= destSemIndex;
      });

      if (hasViolation) {
        setAlertMessage(`Cannot move ${movedCourse.code}: Prerequisite courses must be completed in an earlier semester.`);
        return;
      }
    }

    setAlertMessage(null);
    destCourses.splice(destination.index, 0, movedCourse);

    const newSemesters = [...roadmap.semesters];
    newSemesters[sourceSemIndex] = { ...sourceSem, courses: sourceCourses };
    newSemesters[destSemIndex] = { ...destSem, courses: destCourses };

    setRoadmap({ ...roadmap, semesters: newSemesters });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{roadmap.degreeName}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Interactive Degree & Graduation Roadmap</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-sm text-gray-500 dark:text-gray-400">Graduation Progress</span>
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {totalPlannedCredits} / {roadmap.requiredCredits} Credits
            </div>
          </div>
        </div>
      </div>

      <PrerequisiteAlert message={alertMessage} onClose={() => setAlertMessage(null)} />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmap.semesters.map((semester) => (
            <SemesterBoard key={semester.id} semester={semester} />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
