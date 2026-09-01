import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";
import { sendSuccess, sendError, sendBadRequest, sendNotFound } from "../../lib/apiResponse.js";
import { CreateProjectInputSchema, Project } from "../../models/projectSchema.js";

// Curated Initial Projects for Project Vault
export const INITIAL_VAULT_PROJECTS: Omit<Project, '_id'>[] = [
  {
    id: "proj_yuvahub_core",
    title: "YuvaHub Enterprise Career Discovery Engine",
    description: "Unified open-source student platform for AI-powered opportunity matching, ATS resume scoring, hackathon judge studios, and verified micro-internships.",
    techStack: ["React", "TypeScript", "Node.js", "Express", "MongoDB", "TailwindCSS", "Gemini AI"],
    difficulty: "Intermediate",
    category: "AI & Machine Learning",
    maintainer: {
      name: "YuvaHub Core Team",
      handle: "yuvahub-org",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    },
    repoUrl: "https://github.com/uditt490-pixel/YuvaHub",
    demoUrl: "https://yuvahub.dev",
    goodFirstIssues: true,
    openIssuesCount: 14,
    stars: 520,
    views: 3420,
    upvotes: 388,
    tags: ["Open Source", "React", "TypeScript", "Career Tech", "AI Agent"],
    status: "Active",
    isOpenSource: true,
    isBeginnerFriendly: true,
    isRemoteCollaboration: true,
    isFeatured: true,
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-08-15")
  },
  {
    id: "proj_flow_dag",
    title: "OrchestraDAG - Distributed Workflow Engine",
    description: "High-throughput asynchronous distributed task runner and workflow DAG scheduler written with BullMQ, Redis backpressure, and RabbitMQ dead-letter queues.",
    techStack: ["Node.js", "TypeScript", "Redis", "BullMQ", "RabbitMQ", "Docker"],
    difficulty: "Advanced",
    category: "Cloud & DevOps",
    maintainer: {
      name: "Aarav Sharma",
      handle: "aarav-sys",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
    },
    repoUrl: "https://github.com/orchestradag/orchestra-core",
    demoUrl: "https://orchestradag.io",
    goodFirstIssues: true,
    openIssuesCount: 8,
    stars: 342,
    views: 2150,
    upvotes: 276,
    tags: ["Distributed Systems", "Worker Queues", "Async", "Event Driven"],
    status: "Active",
    isOpenSource: true,
    isBeginnerFriendly: false,
    isRemoteCollaboration: true,
    isFeatured: true,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-08-10")
  },
  {
    id: "proj_zk_shield",
    title: "ZK-Shield: Zero-Knowledge Student Credentials",
    description: "Privacy-preserving identity proof verification enabling hackathon participants to prove university student status without disclosing sensitive PII.",
    techStack: ["Solidity", "Circom", "TypeScript", "Next.js", "Ethers.js"],
    difficulty: "Advanced",
    category: "Web3 & Blockchain",
    maintainer: {
      name: "Priya Patel",
      handle: "priyazk",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
    },
    repoUrl: "https://github.com/zk-shield/protocol",
    demoUrl: "https://zkshield.app",
    goodFirstIssues: false,
    openIssuesCount: 5,
    stars: 289,
    views: 1890,
    upvotes: 215,
    tags: ["Zero Knowledge", "Cryptography", "Identity", "Ethereum"],
    status: "Active",
    isOpenSource: true,
    isBeginnerFriendly: false,
    isRemoteCollaboration: true,
    isFeatured: true,
    createdAt: new Date("2026-02-15"),
    updatedAt: new Date("2026-07-28")
  },
  {
    id: "proj_code_canvas",
    title: "CodeCanvas Interactive Algorithmic Visualizer",
    description: "Visual exploration environment for graph algorithms, dynamic programming tables, and tree traversals with step-by-step memory inspection.",
    techStack: ["React", "TypeScript", "Canvas API", "WebAssembly", "TailwindCSS"],
    difficulty: "Beginner",
    category: "Full Stack Web",
    maintainer: {
      name: "Rohan Verma",
      handle: "rohan-v",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
    },
    repoUrl: "https://github.com/codecanvas/visualizer",
    demoUrl: "https://codecanvas.run",
    goodFirstIssues: true,
    openIssuesCount: 19,
    stars: 460,
    views: 4200,
    upvotes: 395,
    tags: ["Algorithms", "Education", "Visualization", "Good First Issue"],
    status: "Active",
    isOpenSource: true,
    isBeginnerFriendly: true,
    isRemoteCollaboration: true,
    isFeatured: false,
    createdAt: new Date("2026-03-01"),
    updatedAt: new Date("2026-08-16")
  },
  {
    id: "proj_pulse_iot",
    title: "PulseGuard: Edge IoT Biometric Health Monitor",
    description: "Ultra-low power wearable firmware and companion mobile dashboard for real-time telemetry streaming and anomaly detection.",
    techStack: ["C++", "FreeRTOS", "Flutter", "MQTT", "Python", "FastAPI"],
    difficulty: "Intermediate",
    category: "IoT & Hardware",
    maintainer: {
      name: "Ananya Iyer",
      handle: "ananya-iot",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
    },
    repoUrl: "https://github.com/pulseguard/edge-firmware",
    demoUrl: "https://pulseguard.health",
    goodFirstIssues: true,
    openIssuesCount: 6,
    stars: 175,
    views: 1120,
    upvotes: 140,
    tags: ["IoT", "Embedded", "Flutter", "MQTT", "HealthTech"],
    status: "Active",
    isOpenSource: true,
    isBeginnerFriendly: false,
    isRemoteCollaboration: true,
    isFeatured: false,
    createdAt: new Date("2026-03-20"),
    updatedAt: new Date("2026-08-01")
  },
  {
    id: "proj_sentinel_sec",
    title: "SentinelAPI - Automated Security & Secret Scanner",
    description: "CLI tool and GitHub Action that scans codebases for leaked credentials, misconfigured OAuth scopes, and vulnerable endpoints.",
    techStack: ["Go", "Docker", "GitHub Actions", "Shell"],
    difficulty: "Intermediate",
    category: "Cybersecurity",
    maintainer: {
      name: "Vikram Malhotra",
      handle: "v-malhotra",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80"
    },
    repoUrl: "https://github.com/sentinel-sec/sentinel-cli",
    demoUrl: "https://sentinel-sec.dev",
    goodFirstIssues: true,
    openIssuesCount: 11,
    stars: 310,
    views: 2600,
    upvotes: 245,
    tags: ["Security", "CLI", "DevSecOps", "Go"],
    status: "Active",
    isOpenSource: true,
    isBeginnerFriendly: true,
    isRemoteCollaboration: true,
    isFeatured: false,
    createdAt: new Date("2026-04-05"),
    updatedAt: new Date("2026-08-14")
  }
];

export async function ensureProjectSeed() {
  if (!dbCommand) return;
  try {
    const col = dbCommand.collection("projects");
    const count = await col.countDocuments();
    if (count === 0) {
      console.log("[ProjectVault] Seeding initial projects...");
      await col.insertMany(INITIAL_VAULT_PROJECTS);
    }
  } catch (err) {
    console.warn("[ProjectVault] Seed check skipped:", err);
  }
}

export const getProjects = async (req: Request, res: Response) => {
  const q = ((req.query.q as string) || "").trim();
  const tech = (req.query.tech as string) || "";
  const category = (req.query.category as string) || "";
  const difficulty = (req.query.difficulty as string) || "";
  const status = (req.query.status as string) || "";
  const isOpenSource = req.query.isOpenSource as string;
  const isBeginnerFriendly = req.query.isBeginnerFriendly as string;
  const isRemoteCollaboration = req.query.isRemoteCollaboration as string;
  const isFeatured = req.query.isFeatured as string;
  const sortBy = (req.query.sortBy as string) || "Recently Added";

  // Pagination parameters
  const pageParam = parseInt(req.query.page as string, 10);
  const limitParam = parseInt(req.query.limit as string, 10);
  const page = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
  const limit = !isNaN(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 9;
  const skip = (page - 1) * limit;

  // If DB is offline, operate on memory projects
  if (!dbCommand || !dbQuery) {
    let filtered = INITIAL_VAULT_PROJECTS.filter(p => {
      if (q) {
        const text = `${p.title} ${p.description} ${p.techStack.join(" ")} ${p.tags.join(" ")} ${p.maintainer.name} ${p.maintainer.handle || ""}`.toLowerCase();
        if (!text.includes(q.toLowerCase())) return false;
      }
      if (tech && tech !== "all" && !p.techStack.some(t => t.toLowerCase() === tech.toLowerCase())) return false;
      if (category && category !== "all" && p.category.toLowerCase() !== category.toLowerCase()) return false;
      if (difficulty && difficulty !== "all" && p.difficulty.toLowerCase() !== difficulty.toLowerCase()) return false;
      if (status && status !== "all" && p.status.toLowerCase() !== status.toLowerCase()) return false;
      if (isOpenSource === "true" && !p.isOpenSource) return false;
      if (isBeginnerFriendly === "true" && !p.isBeginnerFriendly) return false;
      if (isRemoteCollaboration === "true" && !p.isRemoteCollaboration) return false;
      if (isFeatured === "true" && !p.isFeatured) return false;
      return true;
    });

    // In-memory sort
    if (sortBy === "Most Popular") {
      filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (sortBy === "Most Starred") {
      filtered.sort((a, b) => (b.stars || 0) - (a.stars || 0));
    } else if (sortBy === "Recently Updated") {
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sortBy === "Beginner Friendly") {
      filtered.sort((a, b) => (b.isBeginnerFriendly ? 1 : 0) - (a.isBeginnerFriendly ? 1 : 0));
    } else {
      // Recently Added
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const paginated = filtered.slice(skip, skip + limit);

    return sendSuccess(res, {
      results: paginated,
      items: paginated,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      meta: {
        query: q,
        total_found: totalItems,
        page,
        limit,
        totalPages,
        sortBy
      }
    });
  }

  try {
    await ensureProjectSeed();

    const andConditions: any[] = [];

    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      andConditions.push({
        $or: [
          { title: { $regex: escaped, $options: "i" } },
          { description: { $regex: escaped, $options: "i" } },
          { techStack: { $regex: escaped, $options: "i" } },
          { tags: { $regex: escaped, $options: "i" } },
          { "maintainer.name": { $regex: escaped, $options: "i" } },
          { "maintainer.handle": { $regex: escaped, $options: "i" } },
          { category: { $regex: escaped, $options: "i" } }
        ]
      });
    }

    if (tech && tech !== "all") {
      andConditions.push({
        techStack: { $regex: new RegExp(`^${tech}$`, "i") }
      });
    }

    if (category && category !== "all") {
      andConditions.push({
        category: { $regex: new RegExp(`^${category}$`, "i") }
      });
    }

    if (difficulty && difficulty !== "all") {
      andConditions.push({
        difficulty: { $regex: new RegExp(`^${difficulty}$`, "i") }
      });
    }

    if (status && status !== "all") {
      andConditions.push({
        status: { $regex: new RegExp(`^${status}$`, "i") }
      });
    }

    if (isOpenSource === "true") andConditions.push({ isOpenSource: true });
    if (isBeginnerFriendly === "true") andConditions.push({ isBeginnerFriendly: true });
    if (isRemoteCollaboration === "true") andConditions.push({ isRemoteCollaboration: true });
    if (isFeatured === "true") andConditions.push({ isFeatured: true });

    const filter = andConditions.length > 0 ? { $and: andConditions } : {};

    let sortSpec: Record<string, 1 | -1> = { createdAt: -1, _id: -1 };
    if (sortBy === "Most Popular") {
      sortSpec = { upvotes: -1, views: -1 };
    } else if (sortBy === "Most Starred") {
      sortSpec = { stars: -1, _id: -1 };
    } else if (sortBy === "Recently Updated") {
      sortSpec = { updatedAt: -1, _id: -1 };
    } else if (sortBy === "Beginner Friendly") {
      sortSpec = { isBeginnerFriendly: -1, stars: -1 };
    } else {
      sortSpec = { createdAt: -1, _id: -1 };
    }

    const [totalFound, docs] = await Promise.all([
      dbQuery.collection("projects").countDocuments(filter),
      dbQuery.collection("projects").find(filter).sort(sortSpec).skip(skip).limit(limit).toArray()
    ]);

    const mapped = docs.map((doc: any) => {
      const id = doc.id || (doc._id ? doc._id.toString() : "");
      const d = { ...doc, id };
      delete d._id;
      return d;
    });

    const totalPages = Math.max(1, Math.ceil(totalFound / limit));

    return sendSuccess(res, {
      results: mapped,
      items: mapped,
      pagination: {
        page,
        limit,
        totalItems: totalFound,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      meta: {
        query: q,
        total_found: totalFound,
        page,
        limit,
        totalPages,
        sortBy
      }
    });
  } catch (err: any) {
    console.error("[getProjects] Database error:", err);
    return sendError(res, "Failed to retrieve projects from Project Vault", 500);
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) return sendBadRequest(res, "Project ID is required");

  if (!dbQuery) {
    const found = INITIAL_VAULT_PROJECTS.find(p => p.id === id);
    if (!found) return sendNotFound(res, "Project not found");
    return sendSuccess(res, { project: found });
  }

  try {
    const oid = safeObjectId(id);
    const query = oid ? { $or: [{ _id: oid }, { id }] } : { id };
    const doc = await dbQuery.collection("projects").findOne(query);

    if (!doc) return sendNotFound(res, "Project not found");

    // Increment view count in background
    if (dbCommand) {
      dbCommand.collection("projects").updateOne(query, { $inc: { views: 1 } }).catch(() => {});
    }

    const docId = doc.id || (doc._id ? doc._id.toString() : "");
    const mapped = { ...doc, id: docId, views: (doc.views || 0) + 1 };
    delete mapped._id;

    return sendSuccess(res, { project: mapped });
  } catch (err: any) {
    console.error("[getProjectById] Error:", err);
    return sendError(res, "Failed to fetch project", 500);
  }
};

export const createProject = async (req: Request, res: Response) => {
  const parsed = CreateProjectInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendBadRequest(res, parsed.error.issues[0]?.message || "Invalid project submission data");
  }

  const data = parsed.data;
  const user = req.user;

  const newProject: Omit<Project, '_id'> = {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: data.title,
    description: data.description,
    techStack: Array.isArray(data.techStack) ? data.techStack : [data.techStack],
    difficulty: data.difficulty,
    category: data.category,
    maintainer: {
      name: data.maintainerName || user?.displayName || user?.name || "YuvaHub Contributor",
      handle: data.maintainerHandle || user?.email?.split("@")[0] || "contributor",
      avatar: user?.photoURL || "",
      email: user?.email || undefined,
      uid: user?.uid || undefined
    },
    repoUrl: data.repoUrl,
    demoUrl: data.demoUrl || undefined,
    goodFirstIssues: data.goodFirstIssues ?? true,
    openIssuesCount: data.openIssuesCount ?? 0,
    stars: 1,
    views: 1,
    upvotes: 1,
    tags: Array.isArray(data.tags) ? data.tags : [],
    status: data.status,
    isOpenSource: data.isOpenSource ?? true,
    isBeginnerFriendly: data.isBeginnerFriendly ?? false,
    isRemoteCollaboration: data.isRemoteCollaboration ?? true,
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  if (!dbCommand) {
    INITIAL_VAULT_PROJECTS.unshift(newProject);
    return sendSuccess(res, { project: newProject, message: "Project submitted successfully" });
  }

  try {
    const result = await dbCommand.collection("projects").insertOne(newProject);
    return sendSuccess(res, {
      project: { ...newProject, _id: result.insertedId },
      message: "Project submitted successfully to Project Vault!"
    });
  } catch (err: any) {
    console.error("[createProject] Database error:", err);
    return sendError(res, "Failed to create project", 500);
  }
};

export const toggleProjectUpvote = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) return sendBadRequest(res, "Project ID is required");

  if (!dbCommand || !dbQuery) {
    const found = INITIAL_VAULT_PROJECTS.find(p => p.id === id);
    if (!found) return sendNotFound(res, "Project not found");
    found.upvotes = (found.upvotes || 0) + 1;
    found.stars = (found.stars || 0) + 1;
    return sendSuccess(res, { upvotes: found.upvotes, stars: found.stars, upvoted: true });
  }

  try {
    const oid = safeObjectId(id);
    const query = oid ? { $or: [{ _id: oid }, { id }] } : { id };
    const project = await dbQuery.collection("projects").findOne(query);

    if (!project) return sendNotFound(res, "Project not found");

    const newUpvotes = (project.upvotes || 0) + 1;
    const newStars = (project.stars || 0) + 1;

    await dbCommand.collection("projects").updateOne(query, {
      $set: { upvotes: newUpvotes, stars: newStars, updatedAt: new Date() }
    });

    return sendSuccess(res, { upvotes: newUpvotes, stars: newStars, upvoted: true });
  } catch (err: any) {
    console.error("[toggleProjectUpvote] Error:", err);
    return sendError(res, "Failed to upvote project", 500);
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) return sendBadRequest(res, "Project ID is required");

  if (!dbCommand) {
    const idx = INITIAL_VAULT_PROJECTS.findIndex(p => p.id === id);
    if (idx !== -1) INITIAL_VAULT_PROJECTS.splice(idx, 1);
    return sendSuccess(res, { message: "Project removed successfully" });
  }

  try {
    const oid = safeObjectId(id);
    const query = oid ? { $or: [{ _id: oid }, { id }] } : { id };
    const result = await dbCommand.collection("projects").deleteOne(query);

    if (result.deletedCount === 0) return sendNotFound(res, "Project not found");

    return sendSuccess(res, { message: "Project removed from Project Vault" });
  } catch (err: any) {
    console.error("[deleteProject] Error:", err);
    return sendError(res, "Failed to delete project", 500);
  }
};

/**
 * PATCH /projects/:id
 * Partial update — only the fields provided in the request body are changed.
 * Automatically refreshes `updatedAt`.
 */
export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) return sendBadRequest(res, "Project ID is required");

  // Strip server-managed fields so callers can't spoof them
  const { _id, id: _bodyId, createdAt, views, upvotes, stars, ...allowedUpdates } = req.body;

  if (!allowedUpdates || Object.keys(allowedUpdates).length === 0) {
    return sendBadRequest(res, "No valid update fields provided");
  }

  const patch: Record<string, any> = { ...allowedUpdates, updatedAt: new Date() };

  // In-memory fallback
  if (!dbCommand || !dbQuery) {
    const found = INITIAL_VAULT_PROJECTS.find(p => p.id === id);
    if (!found) return sendNotFound(res, "Project not found");
    Object.assign(found, patch);
    return sendSuccess(res, { project: found, message: "Project updated successfully" });
  }

  try {
    const oid = safeObjectId(id);
    const query = oid ? { $or: [{ _id: oid }, { id }] } : { id };

    const result = await dbCommand.collection("projects").findOneAndUpdate(
      query,
      { $set: patch },
      { returnDocument: "after" }
    );

    if (!result) return sendNotFound(res, "Project not found");

    const docId = result.id || (result._id ? result._id.toString() : "");
    const mapped = { ...result, id: docId };
    delete mapped._id;

    return sendSuccess(res, { project: mapped, message: "Project updated successfully" });
  } catch (err: any) {
    console.error("[updateProject] Error:", err);
    return sendError(res, "Failed to update project", 500);
  }
};
