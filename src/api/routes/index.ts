import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import bookmarkRoutes from "./bookmarkRoutes.js";
import karmaRoutes from "./karmaRoutes.js";
import bountyRoutes from "./bountyRoutes.js";
import storageRoutes from "./storageRoutes.js";
import resumeRoutes from "./resumeRoutes.js";
import opportunityRoutes from "./opportunityRoutes.js";
import aiRoutes from "./aiRoutes.js";
import searchRoutes from "./searchRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import applicationRoutes from "./applicationRoutes.js";
import adminRoutes from "./adminRoutes.js";
import communityRoutes from "./communityRoutes.js";
import forumReplyRoutes from "./forumReplyRoutes.js";
import teamRoutes from "./teamRoutes.js";
import scholarshipRoutes from "./scholarshipRoutes.js";
import mentorshipRoutes from "./mentorshipRoutes.js";
import bookmarkFolderRoutes from "./bookmarkFolderRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import recommendationRoutes from "./recommendationRoutes.js";
import eventRoutes from "./eventRoutes.js";
import leaderboardRoutes from "./leaderboardRoutes.js";
import experienceRoutes from "./experienceRoutes.js";
import projectRoutes from "./projectRoutes.js";
import endorsementRoutes from "./endorsementRoutes.js";
import pollRoutes from "./pollRoutes.js";
import watchlistRoutes from "./watchlistRoutes.js";
import reportRoutes from "./reportRoutes.js";
import skillGapRoutes from "./skillGapRoutes.js";
import careerGoalRoutes from "./careerGoalRoutes.js";
import alumniMentorshipRoutes from "./alumniMentorshipRoutes.js";
import alumniRoutes from "./alumniRoutes.js";
import activityRoutes from "./activityRoutes.js";
import announcementRoutes from "./announcementRoutes.js";
import opportunityNoteRoutes from "./opportunityNoteRoutes.js";
import savedSearchRoutes from "./savedSearchRoutes.js";
import testimonialRoutes from "./testimonialRoutes.js";
import eventRsvpRoutes from "./eventRsvpRoutes.js";
import skillAssessmentRoutes from "./skillAssessmentRoutes.js";
import voteRoutes from "./voteRoutes.js";
import workspaceRoutes from "./workspaceRoutes.js";
import feedbackRoutes from "./feedbackRoutes.js";
import studyRoomRoutes from "./studyRoomRoutes.js";
import observabilityRoutes from "./observabilityRoutes.js";
import employerRoutes from "./employerRoutes.js";
import newsletterRoutes from "./newsletterRoutes.js";
import { errorHandler } from "../middlewares/errorHandler.js";
import { apiVersionHeaders } from "../versioning/middleware.js";

const rootRouter = Router();
const v1Router = Router();

// Define all routers
const routes = [
  authRoutes,
  userRoutes,
  bookmarkRoutes,
  karmaRoutes,
  bountyRoutes,
  storageRoutes,
  resumeRoutes,
  opportunityRoutes,
  aiRoutes,
  searchRoutes,
  notificationRoutes,
  applicationRoutes,
  adminRoutes,
  communityRoutes,
  forumReplyRoutes,
  teamRoutes,
  scholarshipRoutes,
  mentorshipRoutes,
  bookmarkFolderRoutes,
  analyticsRoutes,
  recommendationRoutes,
  eventRoutes,
  leaderboardRoutes,
  experienceRoutes,
  projectRoutes,
  endorsementRoutes,
  pollRoutes,
  watchlistRoutes,
  reportRoutes,
  skillGapRoutes,
  careerGoalRoutes,
  alumniMentorshipRoutes,
  alumniRoutes,
  activityRoutes,
  announcementRoutes,
  opportunityNoteRoutes,
  savedSearchRoutes,
  testimonialRoutes,
  eventRsvpRoutes,
  skillAssessmentRoutes,
  voteRoutes,
  workspaceRoutes,
  feedbackRoutes,
  studyRoomRoutes,
  observabilityRoutes,
  employerRoutes,
  newsletterRoutes,
];

// Mount all routes onto v1Router
routes.forEach((router) => {
  v1Router.use(router);
});

// Health check route
v1Router.get("/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString(), architecture: "modular" });
});

// Canonical versioned namespace. All new endpoints land here by default.
rootRouter.use("/v1", apiVersionHeaders(), v1Router);

// Graceful legacy alias: forwards unversioned /api/* traffic to v1 while
// consumers migrate. The versioning middleware marks it as deprecated
// (Deprecation + Sunset headers) so callers are nudged onto /api/v1.
rootRouter.use("/", apiVersionHeaders(), v1Router);

// Special alias mappings from server.ts to maintain backward compatibility
rootRouter.use("/opportunities/search", searchRoutes);

// Global error handler (Express 5 auto-forwards rejections)
rootRouter.use(errorHandler);

export default rootRouter;
