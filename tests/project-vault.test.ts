import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/api/db.js', () => {
  const mockProjects: any[] = [];
  return {
    dbCommand: {
      collection: vi.fn().mockReturnValue({
        countDocuments: vi.fn().mockResolvedValue(mockProjects.length),
        insertOne: vi.fn().mockImplementation((doc: any) => {
          mockProjects.push(doc);
          return Promise.resolve({ insertedId: 'proj_inserted_1' });
        }),
        updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
        deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 })
      })
    },
    dbQuery: null // Test in-memory fallback path
  };
});

import { ProjectSchema, CreateProjectInputSchema } from '../src/models/projectSchema.js';
import { getProjects, getProjectById, createProject, toggleProjectUpvote, deleteProject, updateProject, INITIAL_VAULT_PROJECTS } from '../src/api/controllers/projectController.js';

describe('Project Vault Schema & Validation', () => {
  it('should validate a complete valid project schema', () => {
    const validProject = {
      title: 'Automated DAG Scheduler',
      description: 'Distributed scheduling engine with retry backoff and monitoring dashboard.',
      techStack: ['Node.js', 'TypeScript', 'Redis'],
      difficulty: 'Advanced',
      category: 'Cloud & DevOps',
      maintainer: {
        name: 'Jane Doe',
        handle: 'janedoe'
      },
      repoUrl: 'https://github.com/janedoe/dag-scheduler',
      demoUrl: 'https://dag-scheduler.io',
      goodFirstIssues: true,
      openIssuesCount: 5,
      stars: 120,
      views: 500,
      upvotes: 45,
      tags: ['Open Source', 'DevOps'],
      status: 'Active',
      isOpenSource: true,
      isBeginnerFriendly: false,
      isRemoteCollaboration: true,
      isFeatured: true
    };

    const parsed = ProjectSchema.safeParse(validProject);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.title).toBe('Automated DAG Scheduler');
      expect(parsed.data.difficulty).toBe('Advanced');
    }
  });

  it('should reject invalid project without required repoUrl or short description', () => {
    const invalidProject = {
      title: 'X',
      description: 'Too short',
      techStack: [],
      repoUrl: 'not-a-valid-url'
    };

    const parsed = CreateProjectInputSchema.safeParse(invalidProject);
    expect(parsed.success).toBe(false);
  });
});

describe('Project Vault Controller API', () => {
  let mockRes: any;

  beforeEach(() => {
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
  });

  it('should retrieve projects with search, filter, and pagination', async () => {
    const req = {
      query: {
        q: 'YuvaHub',
        page: '1',
        limit: '5',
        sortBy: 'Recently Added'
      }
    } as any;

    await getProjects(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const body = mockRes.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.results).toBeDefined();
    expect(body.pagination).toBeDefined();
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(5);
  });

  it('should filter projects by tech stack', async () => {
    const req = {
      query: {
        tech: 'React',
        page: '1',
        limit: '10'
      }
    } as any;

    await getProjects(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const body = mockRes.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.results.length).toBeGreaterThan(0);
    body.results.forEach((p: any) => {
      expect(p.techStack).toContain('React');
    });
  });

  it('should retrieve single project by id', async () => {
    const sample = INITIAL_VAULT_PROJECTS[0];
    const req = {
      params: { id: sample.id }
    } as any;

    await getProjectById(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const body = mockRes.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.project.title).toBe(sample.title);
  });

  it('should create a new project and return 200 with inserted project', async () => {
    const req = {
      body: {
        title: 'Quantum Simulator Web',
        description: 'Web-based visual quantum circuit simulator and state vector analyzer.',
        techStack: 'React, TypeScript, WebAssembly',
        category: 'AI & Machine Learning',
        difficulty: 'Intermediate',
        repoUrl: 'https://github.com/quantum/sim-web',
        maintainerName: 'Quantum Dev',
        goodFirstIssues: true
      },
      user: {
        displayName: 'Quantum Dev',
        uid: 'user_quantum_123'
      }
    } as any;

    await createProject(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const body = mockRes.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.project.title).toBe('Quantum Simulator Web');
    expect(body.project.maintainer.name).toBe('Quantum Dev');
  });

  it('should toggle upvotes for a project', async () => {
    const sample = INITIAL_VAULT_PROJECTS[0];
    const initialUpvotes = sample.upvotes || 0;

    const req = {
      params: { id: sample.id }
    } as any;

    await toggleProjectUpvote(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const body = mockRes.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.upvotes).toBe(initialUpvotes + 1);
  });

  it('should partially update a project (title and demoUrl)', async () => {
    const sample = INITIAL_VAULT_PROJECTS[0];
    const req = {
      params: { id: sample.id },
      body: {
        title: 'YuvaHub Enterprise Career Discovery Engine v2',
        demoUrl: 'https://v2.yuvahub.dev'
      }
    } as any;

    await updateProject(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const body = mockRes.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.project.title).toBe('YuvaHub Enterprise Career Discovery Engine v2');
    expect(body.project.demoUrl).toBe('https://v2.yuvahub.dev');
  });

  it('should reject updateProject with empty body', async () => {
    const sample = INITIAL_VAULT_PROJECTS[0];
    const req = {
      params: { id: sample.id },
      body: {}
    } as any;

    await updateProject(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    const body = mockRes.json.mock.calls[0][0];
    expect(body.success).toBe(false);
  });

  it('should delete a project by id', async () => {
    const sample = INITIAL_VAULT_PROJECTS[0];
    const req = {
      params: { id: sample.id }
    } as any;

    await deleteProject(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const body = mockRes.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.message).toContain('removed');
  });
});
