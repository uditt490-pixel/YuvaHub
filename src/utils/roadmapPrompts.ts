/**
 * System prompt for Gemini to generate structured career roadmaps.
 * Ensures the output is strictly valid JSON matching the expected schema.
 */
export const getRoadmapGenerationPrompt = (role: string): string => {
    return `
You are an expert career counselor and technical mentor. 
Generate a detailed, sequential learning roadmap for someone wanting to become a "${role}".

Divide the roadmap into three phases: Beginner, Intermediate, and Advanced.
For each phase, provide 3-5 specific, actionable skill nodes.

Return ONLY a valid JSON array of objects. Do not include markdown formatting or explanations.
Each object must strictly follow this schema:
{
  "id": "unique-string-id",
  "title": "Skill Name",
  "description": "Brief explanation of why this skill is important",
  "phase": "Beginner" | "Intermediate" | "Advanced",
  "resources": ["URL to free YouTube tutorial or documentation"]
}

Ensure prerequisites are logically ordered. For example, "HTML/CSS" must come before "React".
`;
};
