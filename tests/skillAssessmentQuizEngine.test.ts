import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkillQuizEngine } from '../src/services/skillQuizEngine';
import {
  generateSkillQuiz,
  evaluateSkillQuiz,
} from '../src/api/controllers/skillAssessmentController';

describe('Automated Skill Assessment & Quizzes Integration (#926)', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      user: { id: 'student_777', uid: 'student_777', role: 'student' },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('1. AI Skill Quiz Question Generation Engine', () => {
    it('should generate a pool of 10 questions for requested skill with randomized options', () => {
      const questions = SkillQuizEngine.generateQuestions('React');
      expect(questions).toHaveLength(10);
      expect(questions[0]).toHaveProperty('id');
      expect(questions[0]).toHaveProperty('question');
      expect(questions[0].options).toHaveLength(4);
    });

    it('should generate unique question option layouts across invocations to prevent cheating', () => {
      const setA = SkillQuizEngine.generateQuestions('Node');
      const setB = SkillQuizEngine.generateQuestions('Node');

      expect(setA[0].id).not.toEqual(setB[0].id);
    });
  });

  describe('2. Backend Scoring Logic & Badge Awarding (> 80%)', () => {
    it('should award a verified skill badge when score is >= 80%', async () => {
      const questions = SkillQuizEngine.generateQuestions('React');
      const answers = questions.map((q) => ({
        questionId: q.id,
        selectedOptionIndex: q.correctOptionIndex, // 100% score
      }));

      req.body = {
        skill: 'React',
        questions,
        answers,
      };

      await evaluateSkillQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          passed: true,
          scorePercent: 100,
          badgeAwarded: true,
          message: expect.stringContaining('Verified React badge has been awarded'),
        })
      );
    });

    it('should NOT award a verified skill badge when score is < 80%', async () => {
      const questions = SkillQuizEngine.generateQuestions('Python');
      const answers = questions.map((q, idx) => ({
        questionId: q.id,
        // Select wrong option for 5 questions
        selectedOptionIndex: idx < 5 ? (q.correctOptionIndex + 1) % 4 : q.correctOptionIndex,
      })); // 50% score

      req.body = {
        skill: 'Python',
        questions,
        answers,
      };

      await evaluateSkillQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          passed: false,
          scorePercent: 50,
          badgeAwarded: false,
          message: expect.stringContaining('Minimum 80% score required'),
        })
      );
    });

    it('should return 400 when required fields are missing in quiz submission', async () => {
      req.body = { skill: 'React' }; // missing questions & answers

      await evaluateSkillQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Missing required fields'),
        })
      );
    });
  });
});
