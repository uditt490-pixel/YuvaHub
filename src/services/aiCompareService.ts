import { generatedContentProxyWithRetry } from "./gemini.js";

export interface CompareAnalysisResult {
    pros: string[];
    cons: string[];
    differentiators: string[];
    recommendedWinnerId: string;
    reasoning: string;
}

/**
 * Uses Gemini to generate a comparison summary for up to 4 opportunities
 * based on the user's profile and the opportunity details.
 */
export async function generateComparisonSummary(
    opportunities: any[],
    userProfile: any
): Promise<CompareAnalysisResult> {
    const oppsData = opportunities.map(opp => ({
        id: opp.id || opp._id?.toString(),
        title: opp.title,
        organization: opp.organization || opp.source_name,
        description: opp.description,
        type: opp.opportunity_type || opp.category,
        stipend: opp.stipend || (opp.normalizedStipend ? `${opp.normalizedStipend.currency} ${opp.normalizedStipend.min} - ${opp.normalizedStipend.max}` : 'Unpaid'),
        location: opp.location,
        tags: opp.tags || []
    }));

    const profileData = {
        skills: userProfile?.skills || '',
        field: userProfile?.field || '',
        experienceLevel: userProfile?.experienceLevel || 'Student'
    };

    const prompt = `You are an expert career advisor for students.
I will provide you with up to 4 job/internship/hackathon opportunities and a user's profile.
Your task is to compare them and output a structured JSON response.

User Profile:
${JSON.stringify(profileData, null, 2)}

Opportunities:
${JSON.stringify(oppsData, null, 2)}

Analyze these opportunities and provide:
1. pros: An array of 3-4 strings detailing the overall pros of these options.
2. cons: An array of 2-3 strings detailing the overall cons or limitations of these options.
3. differentiators: An array of 3-4 strings highlighting what makes them distinct from one another.
4. recommendedWinnerId: The ID of the best opportunity for this specific user.
5. reasoning: A 2-sentence explanation of why that opportunity is the winner.

Respond ONLY with valid JSON matching this schema, without any markdown formatting blocks like \`\`\`json:
{
  "pros": ["string"],
  "cons": ["string"],
  "differentiators": ["string"],
  "recommendedWinnerId": "string",
  "reasoning": "string"
}`;

    try {
        const response = await generatedContentProxyWithRetry(prompt, true, { maxRetries: 2 });
        let cleanJson = (response.text || "").trim();
        if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        const result = JSON.parse(cleanJson);
        return result;
    } catch (error) {
        console.error("Error generating comparison summary with Gemini:", error);
        return {
            pros: ["Failed to generate insights"],
            cons: ["Analysis unavailable"],
            differentiators: ["Please compare manually"],
            recommendedWinnerId: opportunities.length > 0 ? (opportunities[0].id || opportunities[0]._id?.toString()) : "",
            reasoning: "AI analysis failed."
        };
    }
}
