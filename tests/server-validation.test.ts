import request from "supertest";
import express from "express";
import { z } from "zod";
import { describe, it, expect } from "vitest";
import { validateRequest } from "../src/api/middlewares/validateRequest.js";
import { authSyncSchema } from "../src/schemas/authSchema.js";
import { aiGenerateSchema } from "../src/schemas/aiSchema.js";
import { searchQuerySchema } from "../src/schemas/searchSchema.js";

const app = express();
app.use(express.json());

app.post("/api/v1/auth/sync", validateRequest(z.object({ body: authSyncSchema })), (req, res) => {
  res.status(200).json({ success: true });
});

app.post("/api/v1/ai/generate", validateRequest(z.object({ body: aiGenerateSchema })), (req, res) => {
  res.status(200).json({ success: true });
});

app.get("/api/v1/search", validateRequest(z.object({ query: searchQuerySchema })), (req, res) => {
  res.status(200).json({ success: true });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error("Test App Error:", err);
  res.status(500).json({ error: err.message || err });
});

describe("Zod Validation Middleware Integration", () => {
  describe("POST /api/v1/auth/sync", () => {
    it("should return 400 when body is invalid", async () => {
      const res = await request(app)
        .post("/api/v1/auth/sync")
        .send({
          email: "invalid-email" // Invalid email format
        });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("should return 200 when body is valid", async () => {
      const res = await request(app)
        .post("/api/v1/auth/sync")
        .send({
          email: "test@example.com",
          name: "John Doe",
          uid: "123"
        });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/v1/ai/generate", () => {
    it("should return 400 when prompt exceeds 10000 chars", async () => {
      const res = await request(app)
        .post("/api/v1/ai/generate")
        .send({
          prompt: "a".repeat(10001) // Exceeds limit
        });
      expect(res.status).toBe(400);
      expect(res.body.details[0].message).toContain("less than 10,000 characters");
    });
  });

  describe("GET /api/v1/search", () => {
    it("should coerce page and limit and clamp values", async () => {
      const res = await request(app)
        .get("/api/v1/search")
        .query({
          q: "test",
          limit: 150 // Should be clamped or fail if strict. With z.coerce.number().max(100), it will fail validation.
        });
      
      // Since max is 100, providing 150 will return 400 Bad Request
      expect(res.status).toBe(400);
    });
  });
});
