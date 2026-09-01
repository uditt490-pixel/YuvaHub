import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// In-memory or session store for interview states (can be scaled to Redis)
const interviewSessions = new Map();

export const startInterview = async (req, res) => {
  try {
    const { userId, jobRole, experienceLevel } = req.body;
    const sessionId = `${userId}_${Date.now()}`;

    const systemInstruction = `You are a strict, professional technical recruiter conducting a mock interview for a ${experienceLevel} ${jobRole} position. 
    Ask ONE clear, concise interview question at a time. Do not give feedback yet; wait for the candidate's response.`;

    interviewSessions.set(sessionId, {
      jobRole,
      experienceLevel,
      turnCount: 0,
      history: [{ role: 'user', parts: [{ text: systemInstruction }] }]
    });

    // Get the first question from Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: "Begin the interview by welcoming the candidate and asking your first question." }] }],
    });

    res.status(200).json({ success: true, sessionId, question: response.text });
  } catch (error) {
    console.error("Start Interview Error:", error);
    res.status(500).json({ success: false, error: "Failed to initialize mock interview." });
  }
};

export const submitInterviewTurn = async (req, res) => {
  try {
    const { sessionId, answer } = req.body;
    const session = interviewSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, error: "Interview session not found." });
    }

    session.turnCount += 1;

    // If max turns (e.g., 5 questions) reached, generate evaluation report
    if (session.turnCount >= 5) {
      const evaluationPrompt = `The mock interview is now complete. Based on the candidate's responses, generate a detailed Markdown evaluation report scoring their performance out of 10, highlighting their key strengths, and outlining areas for technical/behavioral improvement.`;

      const evalResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }],
      });

      interviewSessions.delete(sessionId); // Clean up session

      return res.status(200).json({
        success: true,
        isComplete: true,
        report: evalResponse.text
      });
    }

    // Otherwise, ask the next interview question
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: `Candidate answer: ${answer}\n\nProvide constructive follow-up or ask the next interview question.` }] }],
    });

    res.status(200).json({
      success: true,
      isComplete: false,
      question: response.text,
      turnCount: session.turnCount
    });

  } catch (error) {
    console.error("Interview Turn Error:", error);
    res.status(500).json({ success: false, error: "Failed to process interview response." });
  }
};
