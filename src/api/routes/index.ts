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
import teamRoutes from "./teamRoutes.js";
import scholarshipRoutes from "./scholarshipRoutes.js";
import mentorshipRoutes from "./mentorshipRoutes.js";
import bookmarkFolderRoutes from "./bookmarkFolderRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";

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
  teamRoutes,
  scholarshipRoutes,
  mentorshipRoutes,
  bookmarkFolderRoutes,
  analyticsRoutes
];

// Mount all routes onto v1Router
routes.forEach((router) => {
  v1Router.use(router);
});

// For dual-version support, mount v1Router on both /api/v1 and /api
rootRouter.use("/v1", v1Router);
rootRouter.use("/", v1Router);

// Special alias mappings from server.ts to maintain backward compatibility
rootRouter.use("/opportunities/search", searchRoutes);

export default rootRouter;
