import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { GraduationCap, BookOpen, AlertCircle, Save } from "lucide-react";
import { SemesterBoard } from "../components/planner/SemesterBoard";
import { CourseCard } from "../components/planner/CourseCard";
import { PrerequisiteAlert } from "../components/planner/PrerequisiteAlert";

interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  prerequisites: string[];
}

interface Semester {
  id: string;
  term: string;
  year: number;
  courseIds: string[];
}

export const DegreePlannerHub = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [unassignedCourses, setUnassignedCourses] = useState<string[]>([]);
  const [alertMsg, setAlertMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [graduationRequirements] = useState(120);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catalogRes, roadmapRes] = await Promise.all([
          fetch("/api/planner/catalog").then(res => res.json()),
          fetch("/api/planner/roadmap").then(res => res.json())
        ]);

        if (catalogRes.success) {
          setCourses(catalogRes.data.courses);
        }

        if (roadmapRes.success) {
          const userSemesters = roadmapRes.data.roadmap.semesters;
          if (userSemesters.length === 0) {
            // Default 8 semesters if empty
            const defaultSemesters: Semester[] = Array.from({ length: 8 }).map((_, i) => {
              const yearOffset = Math.floor(i / 2);
              const term = i % 2 === 0 ? "Fall" : "Spring";
              return {
                id: `sem-${i}`,
                term,
                year: 2026 + yearOffset,
                courseIds: []
              };
            });
            setSemesters(defaultSemesters);
            setUnassignedCourses(catalogRes.data.courses.map((c: Course) => c.id));
          } else {
            setSemesters(userSemesters);
            const assignedIds = new Set(userSemesters.flatMap((s: Semester) => s.courseIds));
            setUnassignedCourses(catalogRes.data.courses.map((c: Course) => c.id).filter((id: string) => !assignedIds.has(id)));
          }
        }
      } catch (err) {
        console.error("Failed to load planner data", err);
      }
    };
    fetchData();
  }, []);

  const saveRoadmap = async (newSemesters: Semester[]) => {
    setIsSaving(true);
    try {
      await fetch("/api/planner/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semesters: newSemesters })
      });
    } catch (err) {
      console.error("Failed to save roadmap", err);
    } finally {
      setIsSaving(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Prerequisite checking logic
    const course = courses.find(c => c.id === draggableId);
    if (course && course.prerequisites.length > 0 && destination.droppableId.startsWith('sem-')) {
      const destSemIndex = semesters.findIndex(s => s.id === destination.droppableId);
      
      const courseToSemesterIndex = new Map<string, number>();
      semesters.forEach((sem, idx) => {
        sem.courseIds.forEach(cid => courseToSemesterIndex.set(cid, idx));
      });

      // Also need to account for courses moved in the current transaction, but simplify to checking existing state first
      let hasViolation = false;
      let violationMsg = "";

      for (const prereqId of course.prerequisites) {
        const prereqSemIndex = courseToSemesterIndex.get(prereqId);
        if (prereqSemIndex === undefined) {
          hasViolation = true;
          violationMsg = `Course ${course.code} requires ${prereqId} to be taken first.`;
          break;
        }
        if (prereqSemIndex >= destSemIndex) {
          hasViolation = true;
          violationMsg = `Course ${course.code} requires ${prereqId} to be taken in a prior semester.`;
          break;
        }
      }

      if (hasViolation) {
        setAlertMsg(violationMsg);
        setTimeout(() => setAlertMsg(""), 5000);
        return; // Block the move
      }
    }

    // Perform move
    let startList = source.droppableId === 'unassigned' ? [...unassignedCourses] : [...(semesters.find(s => s.id === source.droppableId)?.courseIds || [])];
    let destList = destination.droppableId === 'unassigned' ? [...unassignedCourses] : [...(semesters.find(s => s.id === destination.droppableId)?.courseIds || [])];

    if (source.droppableId === destination.droppableId) {
      startList.splice(source.index, 1);
      startList.splice(destination.index, 0, draggableId);
      
      if (source.droppableId === 'unassigned') {
        setUnassignedCourses(startList);
      } else {
        const newSems = semesters.map(s => s.id === source.droppableId ? { ...s, courseIds: startList } : s);
        setSemesters(newSems);
        saveRoadmap(newSems);
      }
    } else {
      startList.splice(source.index, 1);
      destList.splice(destination.index, 0, draggableId);

      if (source.droppableId === 'unassigned') {
        setUnassignedCourses(startList);
      }

      if (destination.droppableId === 'unassigned') {
        setUnassignedCourses(destList);
      }

      const newSems = semesters.map(s => {
        if (s.id === source.droppableId) return { ...s, courseIds: startList };
        if (s.id === destination.droppableId) return { ...s, courseIds: destList };
        return s;
      });
      setSemesters(newSems);
      saveRoadmap(newSems);
    }
  };

  const totalPlannedCredits = semesters.reduce((sum, sem) => {
    return sum + sem.courseIds.reduce((cSum, cid) => cSum + (courses.find(c => c.id === cid)?.credits || 0), 0);
  }, 0);

  const progress = Math.min(100, Math.round((totalPlannedCredits / graduationRequirements) * 100));

  return (
    <div className="font-sans h-full flex flex-col">
      <PrerequisiteAlert message={alertMsg} onClose={() => setAlertMsg("")} />
      
      {/* Header */}
      <header className="border-b border-border-theme bg-transparent p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-400" />
            Degree Planner Hub
          </h1>
          <p className="text-text-muted text-sm mt-1">Plan your academic journey and track prerequisites visually.</p>
        </div>
        
        <div className="flex items-center gap-6 bg-surface rounded-xl p-4 border border-border-theme">
          <div className="flex flex-col">
            <span className="text-xs text-text-muted uppercase tracking-wider">Progress</span>
            <span className="text-xl font-bold text-text-primary">{totalPlannedCredits} / {graduationRequirements} <span className="text-sm font-normal text-text-muted">Credits</span></span>
          </div>
          <div className="w-32 h-2 bg-surface-secondary rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          {isSaving ? (
            <span className="text-xs text-text-muted flex items-center gap-1 animate-pulse">
              <Save className="w-3 h-3" /> Saving...
            </span>
          ) : (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Saved
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          
          {/* Sidebar - Course Catalog */}
          <div className="w-80 bg-transparent border-r border-border-theme flex flex-col">
            <div className="p-4 border-b border-border-theme bg-transparent">
              <h2 className="font-semibold text-text-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Course Catalog
              </h2>
            </div>
            
            <Droppable droppableId="unassigned">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto p-4 flex flex-col gap-3 ${
                    snapshot.isDraggingOver ? "bg-surface/5" : ""
                  }`}
                >
                  {unassignedCourses.map((id, index) => {
                    const course = courses.find(c => c.id === id);
                    if (!course) return null;
                    return <CourseCard key={course.id} course={course} index={index} />;
                  })}
                  {provided.placeholder}
                  {unassignedCourses.length === 0 && !snapshot.isDraggingOver && (
                    <div className="text-center text-sm text-text-secondary py-8">
                      All available courses planned.
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>

          {/* Main Board - Semesters */}
          <div className="flex-1 overflow-x-auto p-6 bg-transparent">
            <div className="flex gap-6 pb-4">
              {semesters.map((semester) => (
                <SemesterBoard key={semester.id} semester={semester} courses={courses} />
              ))}
            </div>
          </div>

        </DragDropContext>
      </div>
    </div>
  );
};
