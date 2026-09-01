import { Server, Socket } from "socket.io";

// Track booth queues: boothId -> array of { socketId, student: { uid, name } }
const boothQueues = new Map<string, Array<{ socketId: string; student: any }>>();

export const setupCareerFairPresence = (io: Server) => {
  const nsp = io.of("/career-fair");

  nsp.on("connection", (socket: Socket) => {
    socket.on("join_queue", ({ boothId, student }: { boothId: string; student: any }) => {
      if (!boothId || !student) return;

      if (!boothQueues.has(boothId)) {
        boothQueues.set(boothId, []);
      }
      
      const queue = boothQueues.get(boothId)!;
      // Prevent duplicate entry
      if (!queue.find(q => q.student.uid === student.uid)) {
        queue.push({ socketId: socket.id, student });
      }

      socket.join(`booth_${boothId}`);

      // Broadcast update to the user and everyone in the queue for this booth
      broadcastQueueUpdate(nsp, boothId);
      console.log(`[Socket/CareerFair] Student ${student.name} joined queue for booth ${boothId}`);
    });

    socket.on("leave_queue", ({ boothId, student }: { boothId: string; student: any }) => {
      if (!boothId || !student) return;

      removeStudentFromQueue(boothId, student.uid);
      socket.leave(`booth_${boothId}`);
      
      broadcastQueueUpdate(nsp, boothId);
      console.log(`[Socket/CareerFair] Student ${student.name} left queue for booth ${boothId}`);
    });

    socket.on("recruiter_status_update", ({ boothId, isOnline }: { boothId: string; isOnline: boolean }) => {
      nsp.to(`booth_${boothId}`).emit("recruiter_status_update", { boothId, isOnline });
    });

    socket.on("disconnect", () => {
      // Find and remove student from any booth queue they were in
      for (const [boothId, queue] of boothQueues.entries()) {
        const index = queue.findIndex(q => q.socketId === socket.id);
        if (index !== -1) {
          queue.splice(index, 1);
          broadcastQueueUpdate(nsp, boothId);
          console.log(`[Socket/CareerFair] Student disconnected, removed from booth ${boothId} queue`);
        }
      }
    });
  });
};

function removeStudentFromQueue(boothId: string, uid: string) {
  const queue = boothQueues.get(boothId);
  if (queue) {
    const index = queue.findIndex(q => q.student.uid === uid);
    if (index !== -1) {
      queue.splice(index, 1);
    }
  }
}

function broadcastQueueUpdate(nsp: any, boothId: string) {
  const queue = boothQueues.get(boothId) || [];
  // Send each student their specific position in line
  queue.forEach((item, index) => {
    nsp.to(item.socketId).emit("queue_update", {
      position: index + 1,
      totalQueue: queue.length
    });
  });
}
