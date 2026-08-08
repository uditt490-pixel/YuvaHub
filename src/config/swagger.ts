import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "YuvaHub API",
      version: "1.0.0",
      description:
        "YuvaHub is a community-driven opportunity discovery platform. This API provides endpoints for authentication, opportunities, bookmarks, community forums, mentorship, AI assistance, and more.",
    },
    servers: [
      { url: "/api/v1", description: "API v1" },
      { url: "/api", description: "API (legacy)" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
            code: { type: "string" },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            timestamp: { type: "string", format: "date-time" },
            architecture: { type: "string" },
          },
        },
        AuthSyncResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            profile: { type: "object" },
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
        AuthRefreshResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
        KarmaBalanceResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            balance: { type: "integer" },
          },
        },
        BookmarkListResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            bookmarks: { type: "array", items: { type: "object" } },
          },
        },
        BookmarkActionResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: { type: "string" },
          },
        },
        OpportunityListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: { type: "array", items: { type: "object" } },
            items: { type: "array", items: { type: "object" } },
            num_results: { type: "integer" },
            next_page: { type: "integer", nullable: true },
            next_cursor: { type: "string", nullable: true },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer" },
                limit: { type: "integer" },
                totalItems: { type: "integer" },
                totalPages: { type: "integer" },
              },
            },
          },
        },
        CommunityPost: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            content: { type: "string" },
            author: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CommunityComment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            postId: { type: "string" },
            content: { type: "string" },
            author: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Team: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            members: { type: "array", items: { type: "string" } },
          },
        },
        Bounty: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            reward: { type: "integer" },
            status: { type: "string", enum: ["open", "in_progress", "resolved"] },
          },
        },
        Scholarship: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            provider: { type: "string" },
            amount: { type: "number" },
            deadline: { type: "string", format: "date" },
          },
        },
        Notification: {
          type: "object",
          properties: {
            _id: { type: "string" },
            type: { type: "string" },
            message: { type: "string" },
            read: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreatePostInput: {
          type: "object",
          required: ["title", "content"],
          properties: {
            title: { type: "string" },
            content: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
          },
        },
        CreateCommentInput: {
          type: "object",
          required: ["content"],
          properties: {
            content: { type: "string" },
          },
        },
        CreateBountyInput: {
          type: "object",
          required: ["title", "description", "reward"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            reward: { type: "integer" },
            skills: { type: "array", items: { type: "string" } },
          },
        },
        BookmarkInput: {
          type: "object",
          required: ["opportunityId"],
          properties: {
            opportunityId: { type: "string" },
          },
        },
        AiGenerateInput: {
          type: "object",
          required: ["prompt"],
          properties: {
            prompt: { type: "string" },
            type: {
              type: "string",
              enum: ["cover_letter", "resume_tips", "career_advice", "interview_prep"],
            },
          },
        },
        TrackAnalyticsInput: {
          type: "object",
          required: ["event", "data"],
          properties: {
            event: { type: "string" },
            data: { type: "object" },
          },
        },
      },
    },
    paths: {
      // ─── Health ──────────────────────────────────────────────────────────────
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            200: { description: "Server is healthy", content: { "application/json": { schema: { $ref: "#/components/schemas/HealthResponse" } } } },
          },
        },
      },

      // ─── Auth ────────────────────────────────────────────────────────────────
      "/auth/sync": {
        post: {
          tags: ["Auth"],
          summary: "Firebase token verification & user sync",
          description: "Verifies Firebase ID token, upserts user profile in MongoDB, returns JWT pair",
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { idToken: { type: "string" } } } } } },
          responses: {
            200: { description: "Auth sync successful", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthSyncResponse" } } } },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh JWT tokens",
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { refreshToken: { type: "string" } } } } } },
          responses: {
            200: { description: "Tokens refreshed", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthRefreshResponse" } } } },
            401: { description: "Invalid refresh token" },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout and invalidate refresh token",
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { refreshToken: { type: "string" } } } } } },
          responses: {
            200: { description: "Logged out successfully" },
          },
        },
      },

      // ─── Opportunities ───────────────────────────────────────────────────────
      "/opportunities": {
        get: {
          tags: ["Opportunities"],
          summary: "List opportunities (paginated, ranked)",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
            { name: "category", in: "query", schema: { type: "string" } },
            { name: "tags", in: "query", schema: { type: "string" }, description: "Comma-separated tags" },
            { name: "search", in: "query", schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Paginated list of opportunities", content: { "application/json": { schema: { $ref: "#/components/schemas/OpportunityListResponse" } } } },
          },
        },
        post: {
          tags: ["Opportunities"],
          summary: "Submit a new opportunity",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, url: { type: "string" }, tags: { type: "array", items: { type: "string" } } } } } } },
          responses: {
            201: { description: "Opportunity created" },
            400: { description: "Validation error" },
          },
        },
      },
      "/opportunities/trending": {
        get: {
          tags: ["Opportunities"],
          summary: "Get trending opportunities (cached 300s)",
          responses: { 200: { description: "Trending opportunities" } },
        },
      },
      "/opportunities/latest": {
        get: {
          tags: ["Opportunities"],
          summary: "Get latest 24h opportunities",
          responses: { 200: { description: "Latest opportunities" } },
        },
      },
      "/opportunities/semantic-search": {
        get: {
          tags: ["Opportunities"],
          summary: "Semantic search via embeddings",
          parameters: [
            { name: "q", in: "query", required: true, schema: { type: "string" } },
          ],
          responses: { 200: { description: "Semantic search results" } },
        },
      },
      "/opportunity/{id}": {
        get: {
          tags: ["Opportunities"],
          summary: "Get opportunity by ID (cached 3600s)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Opportunity details" },
            404: { description: "Opportunity not found" },
          },
        },
        put: {
          tags: ["Opportunities"],
          summary: "Update an opportunity (admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Opportunity updated" } },
        },
      },
      "/opportunities/search": {
        get: {
          tags: ["Opportunities"],
          summary: "Search opportunities (backward compat alias)",
          parameters: [{ name: "q", in: "query", schema: { type: "string" } }],
          responses: { 200: { description: "Search results" } },
        },
      },

      // ─── Bookmarks ───────────────────────────────────────────────────────────
      "/bookmarks": {
        get: {
          tags: ["Bookmarks"],
          summary: "List user bookmarks",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "List of bookmarks", content: { "application/json": { schema: { $ref: "#/components/schemas/BookmarkListResponse" } } } } },
        },
        post: {
          tags: ["Bookmarks"],
          summary: "Add a bookmark",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/BookmarkInput" } } } },
          responses: { 200: { description: "Bookmark added", content: { "application/json": { schema: { $ref: "#/components/schemas/BookmarkActionResponse" } } } } },
        },
      },
      "/bookmarks/{opportunityId}": {
        delete: {
          tags: ["Bookmarks"],
          summary: "Remove a bookmark",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "opportunityId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Bookmark removed", content: { "application/json": { schema: { $ref: "#/components/schemas/BookmarkActionResponse" } } } } },
        },
      },

      // ─── Users ────────────────────────────────────────────────────────────────
      "/users/me/saved-opportunities": {
        get: {
          tags: ["Users"],
          summary: "Get saved opportunities",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Saved opportunities" } },
        },
      },
      "/users/me/profile-progress": {
        get: {
          tags: ["Users"],
          summary: "Get profile completion progress",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Profile progress" } },
        },
      },
      "/user/sync": {
        get: {
          tags: ["Users"],
          summary: "Sync user data",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "User synced" } },
        },
      },
      "/user": {
        delete: {
          tags: ["Users"],
          summary: "Delete user account",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Account deleted" } },
        },
      },

      // ─── Karma ────────────────────────────────────────────────────────────────
      "/karma/balance": {
        get: {
          tags: ["Karma"],
          summary: "Get karma balance",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Karma balance", content: { "application/json": { schema: { $ref: "#/components/schemas/KarmaBalanceResponse" } } } } },
        },
      },
      "/karma/award": {
        post: {
          tags: ["Karma"],
          summary: "Award karma to a user",
          security: [{ bearerAuth: [] }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { userId: { type: "string" }, amount: { type: "integer" }, reason: { type: "string" } } } } } },
          responses: { 200: { description: "Karma awarded" } },
        },
      },

      // ─── Community Posts ──────────────────────────────────────────────────────
      "/community/posts": {
        get: {
          tags: ["Community"],
          summary: "List community posts",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
            { name: "tags", in: "query", schema: { type: "string" } },
          ],
          responses: { 200: { description: "List of community posts", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/CommunityPost" } } } } } },
        },
        post: {
          tags: ["Community"],
          summary: "Create a community post",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreatePostInput" } } } },
          responses: { 201: { description: "Post created" } },
        },
      },
      "/community/posts/{postId}": {
        get: {
          tags: ["Community"],
          summary: "Get a community post by ID",
          parameters: [{ name: "postId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Post details" }, 404: { description: "Post not found" } },
        },
        delete: {
          tags: ["Community"],
          summary: "Delete a community post (admin or author)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "postId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Post deleted" } },
        },
      },
      "/community/posts/{postId}/comments": {
        get: {
          tags: ["Community"],
          summary: "Get comments for a post",
          parameters: [{ name: "postId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "List of comments", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/CommunityComment" } } } } } },
        },
        post: {
          tags: ["Community"],
          summary: "Add a comment to a post",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "postId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCommentInput" } } } },
          responses: { 201: { description: "Comment created" } },
        },
      },
      "/community/posts/{postId}/comments/{commentId}": {
        put: {
          tags: ["Community"],
          summary: "Edit a comment",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "postId", in: "path", required: true, schema: { type: "string" } },
            { name: "commentId", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCommentInput" } } } },
          responses: { 200: { description: "Comment updated" }, 404: { description: "Comment not found" } },
        },
      },
      "/community/posts/{postId}/upvote": {
        post: {
          tags: ["Community"],
          summary: "Upvote a community post",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "postId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Post upvoted" } },
        },
      },

      // ─── Bounties ────────────────────────────────────────────────────────────
      "/bounties": {
        get: {
          tags: ["Bounties"],
          summary: "List bounties",
          parameters: [
            { name: "status", in: "query", schema: { type: "string", enum: ["open", "in_progress", "resolved"] } },
            { name: "tags", in: "query", schema: { type: "string" } },
          ],
          responses: { 200: { description: "List of bounties", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Bounty" } } } } } },
        },
        post: {
          tags: ["Bounties"],
          summary: "Create a new bounty",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateBountyInput" } } } },
          responses: { 201: { description: "Bounty created" } },
        },
      },
      "/bounties/{id}/accept": {
        post: {
          tags: ["Bounties"],
          summary: "Accept a bounty",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Bounty accepted" } },
        },
      },
      "/bounties/{id}/resolve": {
        post: {
          tags: ["Bounties"],
          summary: "Resolve a bounty",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Bounty resolved" } },
        },
      },
      "/bounties/{id}/rate": {
        post: {
          tags: ["Bounties"],
          summary: "Rate a bounty",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Bounty rated" } },
        },
      },
      "/bounties/leaderboard": {
        get: {
          tags: ["Bounties"],
          summary: "Get bounty leaderboard",
          responses: { 200: { description: "Leaderboard" } },
        },
      },

      // ─── Teams ────────────────────────────────────────────────────────────────
      "/teams": {
        get: {
          tags: ["Teams"],
          summary: "List teams",
          parameters: [{ name: "search", in: "query", schema: { type: "string" } }],
          responses: { 200: { description: "List of teams", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Team" } } } } } },
        },
        post: {
          tags: ["Teams"],
          summary: "Create a team",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } } } } } },
          responses: { 201: { description: "Team created" } },
        },
      },
      "/teams/{id}": {
        get: {
          tags: ["Teams"],
          summary: "Get team by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Team details" }, 404: { description: "Team not found" } },
        },
      },
      "/teams/{id}/join": {
        post: {
          tags: ["Teams"],
          summary: "Submit join request",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Join request submitted" } },
        },
      },
      "/teams/{id}/requests": {
        get: {
          tags: ["Teams"],
          summary: "Get team join requests",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Join requests" } },
        },
      },
      "/teams/requests/{requestId}/respond": {
        post: {
          tags: ["Teams"],
          summary: "Respond to a join request",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "requestId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { action: { type: "string", enum: ["approve", "reject"] } } } } } },
          responses: { 200: { description: "Request processed" } },
        },
      },

      // ─── AI Assistant ────────────────────────────────────────────────────────
      "/ai/generate": {
        post: {
          tags: ["AI"],
          summary: "Generate AI content (rate-limited)",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AiGenerateInput" } } } },
          responses: { 200: { description: "Generated content" }, 429: { description: "Rate limited" } },
        },
      },
      "/ai/resume-review": {
        post: {
          tags: ["AI"],
          summary: "AI resume review (rate-limited)",
          security: [{ bearerAuth: [] }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { resume: { type: "string" } } } } } },
          responses: { 200: { description: "Resume review results" }, 429: { description: "Rate limited" } },
        },
      },
      "/ai/career-roadmap": {
        post: {
          tags: ["AI"],
          summary: "Generate career roadmap (rate-limited)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Career roadmap" }, 429: { description: "Rate limited" } },
        },
      },
      "/ai/analyze-resume": {
        post: {
          tags: ["AI"],
          summary: "Analyze resume (rate-limited)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Resume analysis" }, 429: { description: "Rate limited" } },
        },
      },
      "/ai/outreach": {
        post: {
          tags: ["AI"],
          summary: "Generate outreach message (rate-limited)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Generated outreach message" }, 429: { description: "Rate limited" } },
        },
      },

      // ─── MentorShip ──────────────────────────────────────────────────────────
      "/mentorship/availability": {
        get: {
          tags: ["Mentorship"],
          summary: "Get mentor availability",
          responses: { 200: { description: "Mentor availability" } },
        },
      },
      "/mentorship/book": {
        post: {
          tags: ["Mentorship"],
          summary: "Book a mentorship session",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Session booked" } },
        },
      },
      "/mentorship/sessions": {
        get: {
          tags: ["Mentorship"],
          summary: "List mentorship sessions",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "List of sessions" } },
        },
      },
      "/mentorship/sessions/status": {
        patch: {
          tags: ["Mentorship"],
          summary: "Update session status",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Session status updated" } },
        },
      },

      // ─── Notifications ───────────────────────────────────────────────────────
      "/notifications": {
        get: {
          tags: ["Notifications"],
          summary: "List notifications",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "List of notifications", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Notification" } } } } } },
        },
      },
      "/notifications/{id}/read": {
        post: {
          tags: ["Notifications"],
          summary: "Mark notification as read",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Notification marked as read" } },
        },
      },
      "/notifications/read-all": {
        post: {
          tags: ["Notifications"],
          summary: "Mark all notifications as read",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "All notifications marked as read" } },
        },
      },

      // ─── Scholarships ────────────────────────────────────────────────────────
      "/scholarships": {
        get: {
          tags: ["Scholarships"],
          summary: "List scholarships (cached 300s)",
          responses: { 200: { description: "List of scholarships", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Scholarship" } } } } } },
        },
        post: {
          tags: ["Scholarships"],
          summary: "Create a scholarship (admin only)",
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: "Scholarship created" } },
        },
      },
      "/scholarships/{id}": {
        get: {
          tags: ["Scholarships"],
          summary: "Get scholarship by ID (cached 3600s)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Scholarship details" }, 404: { description: "Scholarship not found" } },
        },
        put: {
          tags: ["Scholarships"],
          summary: "Update a scholarship (admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Scholarship updated" } },
        },
        delete: {
          tags: ["Scholarships"],
          summary: "Delete a scholarship (admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Scholarship deleted" } },
        },
      },
      "/scholarships/validate": {
        post: {
          tags: ["Scholarships"],
          summary: "Validate scholarship eligibility",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Eligibility result" } },
        },
      },

      // ─── Admin ────────────────────────────────────────────────────────────────
      "/admin/health": {
        get: {
          tags: ["Admin"],
          summary: "Admin health check",
          responses: { 200: { description: "Health status" } },
        },
      },
      "/admin/metrics": {
        get: {
          tags: ["Admin"],
          summary: "Get system metrics (admin only)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "System metrics" } },
        },
      },
      "/admin/scrapers": {
        get: {
          tags: ["Admin"],
          summary: "List scrapers (admin only)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Scrapers list" } },
        },
      },
      "/admin/scrapers/stats": {
        get: {
          tags: ["Admin"],
          summary: "Get scraper stats (admin only)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Scraper stats" } },
        },
      },
      "/admin/scrapers/logs": {
        get: {
          tags: ["Admin"],
          summary: "Get scraper logs (admin only)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Scraper logs" } },
        },
      },
      "/admin/scrapers/trigger": {
        post: {
          tags: ["Admin"],
          summary: "Trigger a scraper (admin only)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Scraper triggered" } },
        },
      },
      "/admin/incidents": {
        get: {
          tags: ["Admin"],
          summary: "Get incidents (admin only)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Incidents list" } },
        },
      },
      "/admin/users/{id}": {
        delete: {
          tags: ["Admin"],
          summary: "Delete a user (admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "User deleted" } },
        },
      },

      // ─── Storage ──────────────────────────────────────────────────────────────
      "/storage/signature": {
        post: {
          tags: ["Storage"],
          summary: "Get upload signature",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Upload signature" } },
        },
      },
      "/storage/save": {
        post: {
          tags: ["Storage"],
          summary: "Save uploaded file reference",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "File reference saved" } },
        },
      },
      "/storage/upload-local": {
        post: {
          tags: ["Storage"],
          summary: "Upload file locally (multipart)",
          responses: { 200: { description: "File uploaded" } },
        },
      },

      // ─── Resumes ──────────────────────────────────────────────────────────────
      "/resumes": {
        get: {
          tags: ["Resumes"],
          summary: "List user resumes",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "List of resumes" } },
        },
        post: {
          tags: ["Resumes"],
          summary: "Create a resume",
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: "Resume created" } },
        },
      },
      "/resumes/{id}/rename": {
        put: {
          tags: ["Resumes"],
          summary: "Rename a resume",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Resume renamed" } },
        },
      },
      "/resumes/{id}": {
        delete: {
          tags: ["Resumes"],
          summary: "Delete a resume",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Resume deleted" } },
        },
      },
      "/resumes/{id}/default": {
        put: {
          tags: ["Resumes"],
          summary: "Set resume as default",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Default resume set" } },
        },
      },
      "/resumes/{id}/export/pdf": {
        get: {
          tags: ["Resumes"],
          summary: "Export resume as PDF",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "PDF file" } },
        },
      },

      // ─── Analytics ────────────────────────────────────────────────────────────
      "/analytics/track": {
        post: {
          tags: ["Analytics"],
          summary: "Track an analytics event",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TrackAnalyticsInput" } } } },
          responses: { 200: { description: "Event tracked" } },
        },
      },
      "/analytics/buffer-status": {
        get: {
          tags: ["Analytics"],
          summary: "Get analytics buffer status",
          responses: { 200: { description: "Buffer status" } },
        },
      },

      // ─── Applications ─────────────────────────────────────────────────────────
      "/applications/generate-draft": {
        post: {
          tags: ["Applications"],
          summary: "Generate application draft",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Draft generated" } },
        },
      },
      "/applications/queue": {
        post: {
          tags: ["Applications"],
          summary: "Queue an application",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Application queued" } },
        },
      },

      // ─── Bookmark Folders ─────────────────────────────────────────────────────
      "/bookmark-folders": {
        get: {
          tags: ["Bookmark Folders"],
          summary: "List bookmark folders",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "List of folders" } },
        },
        post: {
          tags: ["Bookmark Folders"],
          summary: "Create a bookmark folder",
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: "Folder created" } },
        },
      },
      "/bookmark-folders/{folderId}": {
        delete: {
          tags: ["Bookmark Folders"],
          summary: "Delete a bookmark folder",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "folderId", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Folder deleted" } },
        },
      },
      "/bookmarks/organize": {
        post: {
          tags: ["Bookmark Folders"],
          summary: "Organize bookmark into folder",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Bookmark organized" } },
        },
      },

      // ─── Search ───────────────────────────────────────────────────────────────
      "/search": {
        get: {
          tags: ["Search"],
          summary: "Search across the platform",
          parameters: [
            { name: "q", in: "query", schema: { type: "string" } },
            { name: "type", in: "query", schema: { type: "string", enum: ["opportunities", "posts", "users"] } },
          ],
          responses: { 200: { description: "Search results" } },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
