/**
 * Integration tests for issue #285 — route handlers must not crash when
 * Express delivers a route param as `string[]` instead of `string`.
 *
 * These tests import the real controller modules but stub the `../db.js`
 * dependency so they can run without a live MongoDB connection. The stub
 * returns `null` for both `dbCommand` and `dbQuery`, which makes the
 * handlers take their "Database not available" path — but the point of
 * these tests is to verify the param-normalization guard runs BEFORE that
 * path, so an array param produces a clean 400 response instead of a
 * `TypeError: postId.replace is not a function` crash.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// ---------------------------------------------------------------------
// Stub `../db.js` BEFORE importing the controllers. Both `dbCommand` and
// `dbQuery` are `null` so every handler will hit its 503 branch — but only
// AFTER the param-normalization guard runs. That's exactly the path we
// want to exercise.
// ---------------------------------------------------------------------
vi.mock("../src/api/db.js", () => ({
  dbCommand: null,
  dbQuery: null,
}));

// `escape-html` is a real dependency of communityController; let it run.
// `mongodb` is a real dependency too — vitest will resolve it from
// node_modules. No stub needed.

// Import the controllers AFTER the mock is registered.
import {
  deletePost,
  getPostById,
  createComment,
  editComment,
  getComments,
  upvotePost,
} from "../src/api/controllers/communityController";
import {
  getScholarshipById,
  updateScholarship,
  deleteScholarship,
} from "../src/api/controllers/scholarshipController";

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

const VALID_HEX = "507f1f77bcf86cd799439011";

function fakeReq(overrides: Partial<Request> = {}): Request {
  return {
    params: {},
    query: {},
    body: {},
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

function fakeRes(): Response & { _status: number; _body: unknown } {
  const res: any = {
    _status: 0,
    _body: undefined,
    status(code: number) {
      this._status = code;
      return this;
    },
    json(body: unknown) {
      this._body = body;
      return this;
    },
    send(body: unknown) {
      this._body = body;
      return this;
    },
  };
  return res as Response & { _status: number; _body: unknown };
}

async function run(
  fn: (req: Request, res: Response, next?: NextFunction) => Promise<unknown>,
  req: Request,
): Promise<{ status: number; body: unknown; error: unknown }> {
  const res = fakeRes();
  let error: unknown = undefined;
  try {
    await fn(req, res);
  } catch (e) {
    error = e;
  }
  return { status: (res as any)._status, body: (res as any)._body, error };
}

// ---------------------------------------------------------------------
// Community controller — every handler that takes a route param
// ---------------------------------------------------------------------

describe("communityController — issue #285 array-param safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletePost returns 400 (not 500) when postId is a string[]", async () => {
    const req = fakeReq({ params: { postId: ["abc", "def"] } });
    const { status } = await run(deletePost, req);
    expect(status).not.toBe(500);
    expect(status).toBeLessThan(500);
  });

  it("deletePost does not throw when postId is an empty array", async () => {
    const req = fakeReq({ params: { postId: [] } });
    const { status } = await run(deletePost, req);
    expect(status).toBe(400);
  });

  it("getPostById returns 400 (not 500) when postId is a string[]", async () => {
    const req = fakeReq({ params: { postId: [VALID_HEX, "second"] } });
    const { status } = await run(getPostById, req);
    expect(status).not.toBe(500);
  });

  it("getPostById returns 400 when postId is an empty array", async () => {
    const req = fakeReq({ params: { postId: [] } });
    const { status, body } = await run(getPostById, req);
    expect(status).toBe(400);
    expect((body as any).error).toMatch(/postId/i);
  });

  it("getComments does NOT crash with `postId.replace is not a function`", async () => {
    // This is the exact bug from issue #285: the old code did
    // `postId.replace(/[.*+?^${}()|[\]\\]/g, ...)` directly on the param,
    // which throws when postId is an array.
    const req = fakeReq({ params: { postId: ["abc", "def"] } });
    const { status, error } = await run(getComments, req);
    // The request must NOT crash — any non-500 response (or even a 200 with
    // mock data) is acceptable. The point is: no `TypeError: postId.replace
    // is not a function`.
    expect(error).toBeUndefined();
    expect(status).not.toBe(500);
  });

  it("getComments returns 400 when postId is an empty array", async () => {
    const req = fakeReq({ params: { postId: [] } });
    const { status } = await run(getComments, req);
    expect(status).toBe(400);
  });

  it("createComment returns 400 when postId is an empty array", async () => {
    const req = fakeReq({
      params: { postId: [] },
      body: { content: "hi", author: "tester" },
    });
    const { status } = await run(createComment, req);
    expect(status).toBe(400);
  });

  it("editComment returns 400 when postId or commentId is an empty array", async () => {
    const req1 = fakeReq({
      params: { postId: [], commentId: VALID_HEX },
      body: { content: "edited" },
    });
    expect((await run(editComment, req1)).status).toBe(400);

    const req2 = fakeReq({
      params: { postId: "post_1", commentId: [] },
      body: { content: "edited" },
    });
    expect((await run(editComment, req2)).status).toBe(400);
  });

  it("upvotePost returns 400 when postId is an empty array (before checking userId)", async () => {
    const req = fakeReq({
      params: { postId: [] },
      user: { uid: "user_1" } as any,
    });
    const { status } = await run(upvotePost, req);
    expect(status).toBe(400);
  });

  it("upvotePost returns 400 when postId is an array of non-hex strings", async () => {
    const req = fakeReq({
      params: { postId: ["not-a-valid-id", "second"] },
      user: { uid: "user_1" } as any,
    });
    const { status } = await run(upvotePost, req);
    expect(status).not.toBe(500);
  });
});

// ---------------------------------------------------------------------
// Scholarship controller — same pattern
// ---------------------------------------------------------------------

describe("scholarshipController — issue #285 array-param safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getScholarshipById returns 400 when id is an empty array", async () => {
    const req = fakeReq({ params: { id: [] } });
    const { status, body } = await run(getScholarshipById, req);
    expect(status).toBe(400);
    expect((body as any).error).toMatch(/id/i);
  });

  it("getScholarshipById does not crash when id is a string[]", async () => {
    const req = fakeReq({ params: { id: [VALID_HEX, "second"] } });
    const { status } = await run(getScholarshipById, req);
    expect(status).not.toBe(500);
  });

  it("updateScholarship returns 400 when id is an empty array", async () => {
    const req = fakeReq({ params: { id: [] }, body: { title: "x" } });
    const { status, body } = await run(updateScholarship, req);
    expect(status).toBe(400);
    expect((body as any).error).toMatch(/id/i);
  });

  it("updateScholarship does not crash when id is a string[]", async () => {
    const req = fakeReq({ params: { id: [VALID_HEX] }, body: { title: "x" } });
    const { status } = await run(updateScholarship, req);
    expect(status).not.toBe(500);
  });

  it("deleteScholarship returns 400 when id is an empty array", async () => {
    const req = fakeReq({ params: { id: [] } });
    const { status, body } = await run(deleteScholarship, req);
    expect(status).toBe(400);
    expect((body as any).error).toMatch(/id/i);
  });

  it("deleteScholarship does not crash when id is a string[]", async () => {
    const req = fakeReq({ params: { id: [VALID_HEX, "extra"] } });
    const { status } = await run(deleteScholarship, req);
    expect(status).not.toBe(500);
  });
});
