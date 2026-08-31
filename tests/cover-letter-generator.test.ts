import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/api/genai.js', () => {
  return {
    getGenAI: vi.fn(),
    getCachedResponse: vi.fn(),
    setCachedResponse: vi.fn(),
    getAIFallback: vi.fn((prompt: string) => "Fallback text"),
  };
});

import { generateCoverLetter } from '../src/api/controllers/aiController.js';
import { getGenAI, getCachedResponse, setCachedResponse } from '../src/api/genai.js';

describe('AI-Driven Contextual Cover Letter Generator Controller (#899)', () => {
  let mockRes: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  it('should return 400 when opportunityTitle is missing', async () => {
    const req = {
      body: {
        organization: 'Acme Corp',
        candidateProfile: { name: 'Alice' },
      },
    } as any;

    await generateCoverLetter(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Opportunity title is required',
      })
    );
  });

  it('should return cached cover letter if available', async () => {
    const cachedText = 'Cached cover letter content for target role.';
    vi.mocked(getCachedResponse).mockReturnValue(cachedText);

    const req = {
      body: {
        opportunityTitle: 'Senior Frontend Developer',
        organization: 'Vercel',
        candidateProfile: { name: 'Alice', skills: ['React', 'Next.js'] },
        customMotivation: 'Loved Next.js since day one.',
      },
    } as any;

    await generateCoverLetter(req, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        coverLetter: cachedText,
      })
    );
  });

  it('should generate a contextual cover letter using Gemini when AI service is available', async () => {
    vi.mocked(getCachedResponse).mockReturnValue(null);

    const mockAiResponse = {
      text: 'Dear Vercel Hiring Team,\n\nI am thrilled to apply for the Senior Frontend Developer role. With my Next.js and React expertise...',
    };

    const mockGenerateContent = vi.fn().mockResolvedValue(mockAiResponse);
    vi.mocked(getGenAI).mockReturnValue({
      models: {
        generateContent: mockGenerateContent,
      },
    } as any);

    const req = {
      body: {
        opportunityTitle: 'Senior Frontend Developer',
        organization: 'Vercel',
        jobDescription: 'Build next-gen web applications with SSR, TypeScript, and edge computing.',
        candidateProfile: {
          name: 'Bob Smith',
          skills: ['React', 'TypeScript', 'Edge Compute'],
          experience: 'Developed high-scale React apps.',
        },
        customMotivation: 'Excited by Vercel platform innovation.',
        tone: 'Technical & Impact-Driven',
      },
    } as any;

    await generateCoverLetter(req, mockRes);

    expect(mockGenerateContent).toHaveBeenCalled();
    expect(setCachedResponse).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        coverLetter: expect.stringContaining('Dear Vercel Hiring Team'),
      })
    );
  });

  it('should return high-quality structured fallback when AI client is unavailable or offline', async () => {
    vi.mocked(getCachedResponse).mockReturnValue(null);
    vi.mocked(getGenAI).mockReturnValue(null);

    const req = {
      body: {
        opportunityTitle: 'AI Research Engineer',
        organization: 'DeepMind',
        candidateProfile: {
          name: 'Charlie',
          skills: ['Python', 'PyTorch', 'Transformers'],
          experience: 'Published paper on LLM optimization',
          education: 'M.S. in Computer Science',
        },
        customMotivation: 'I have dedicated my thesis to efficient attention mechanisms.',
      },
    } as any;

    await generateCoverLetter(req, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        coverLetter: expect.stringContaining('DeepMind'),
      })
    );

    const responseData = mockRes.json.mock.calls[0][0];
    const letter = responseData.coverLetter;
    expect(letter).toContain('AI Research Engineer');
    expect(letter).toContain('Charlie');
    expect(letter).toContain('Python, PyTorch, Transformers');
    expect(letter).toContain('I have dedicated my thesis to efficient attention mechanisms.');
  });
});
