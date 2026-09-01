import { Request, Response } from "express";
import { SkillQuizEngine } from "../../services/skillQuizEngine.js";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";
import { sendSuccess, sendError } from "../../lib/apiResponse.js";

/**
 * Controller for AI-driven Automated Skill Assessments & Quizzes
 */
export const generateSkillQuiz = async (req: Request, res: Response) => {
  const { skill } = req.query;
  const targetSkill = typeof skill === "string" && skill.trim() ? skill.trim() : "React";

  try {
    const questions = SkillQuizEngine.generateQuestions(targetSkill);
    const sanitizedQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    return sendSuccess(res, {
      skill: targetSkill,
      questions: sanitizedQuestions,
      fullQuestions: questions, // retained for test validation or server-side session
      totalQuestions: questions.length,
      quizDurationSeconds: 600,
    });
  } catch (error) {
    console.error("Error generating skill quiz questions:", error);
    return sendError(res, "Failed to generate skill assessment questions.", 500);
  }
};

export const evaluateSkillQuiz = async (req: Request, res: Response) => {
  const uid = req.user?.uid || req.user?.id || (req.user as any)?._id || "user_student";
  const { skill, questions, answers } = req.body;

  if (!skill || !questions || !answers || !Array.isArray(answers)) {
    return res.status(400).json({
      error: "Missing required fields: skill, questions, and answers array are required.",
    });
  }

  try {
    const evalResult = SkillQuizEngine.evaluateQuiz(skill, questions, answers);

    let badgeAwarded = false;
    if (evalResult.passed) {
      badgeAwarded = true;
      if (dbCommand && uid) {
        await dbCommand.collection("users").updateOne(
          { $or: [{ uid }, { id: uid }, { _id: safeObjectId(uid) }] },
          {
            $addToSet: {
              verified_skills: skill,
              verifiedSkills: skill,
              badges: `${skill.toUpperCase()}_VERIFIED`,
            },
          },
          { upsert: true }
        );
      }
    }

    const message = evalResult.passed
      ? `Congratulations! You scored ${evalResult.scorePercent}%. Verified ${skill} badge has been awarded to your public profile.`
      : `You scored ${evalResult.scorePercent}%. Minimum 80% score required to earn a Verified skill badge. Retake available anytime.`;

    return res.status(200).json({
      success: true,
      passed: evalResult.passed,
      scorePercent: evalResult.scorePercent,
      correctCount: evalResult.correctCount,
      totalQuestions: evalResult.totalQuestions,
      badgeAwarded,
      message,
    });
  } catch (error) {
    console.error("Error evaluating skill quiz submission:", error);
    return sendError(res, "Failed to evaluate skill assessment submission.", 500);
  }
};
