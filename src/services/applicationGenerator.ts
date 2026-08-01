import { GoogleGenerativeAI } from "@google/generative-ai";


interface ApplicationContext {
  opportunityTitle: string;
  organization?: string;

  profile?: {
    name?: string;
    email?: string;
    skills?: string[];
    experience?: string;
    education?: string;
  };
}


const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);



/**
 * Application Generator Service
 *
 * Generates:
 * - SOP drafts
 * - Cover letters
 * - Application emails
 */

export async function generateApplicationDraft(
  context: ApplicationContext
): Promise<string> {

  try {

    if (!process.env.GEMINI_API_KEY) {
      return generateFallbackDraft(context);
    }


    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });



    const prompt = `
You are an expert career application assistant.

Create a professional application draft.

Opportunity:
${context.opportunityTitle}

Organization:
${context.organization || "Not specified"}


Candidate Profile:

Name:
${context.profile?.name || "Student"}

Skills:
${context.profile?.skills?.join(", ") || "Not provided"}

Experience:
${context.profile?.experience || "Not provided"}

Education:
${context.profile?.education || "Not provided"}


Requirements:

1. Write a strong personalized introduction.
2. Explain why the candidate is suitable.
3. Highlight relevant skills.
4. Keep the tone professional.
5. Make it suitable for internship/job application.


Generate only the final application draft.
`;



    const result =
      await model.generateContent(prompt);



    const response =
      result.response.text();


    return response;



  } catch(error: any) {

    console.error(
      "Application generator failed:",
      error
    );

    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Quota exceeded') || error?.message?.includes('RESOURCE_EXHAUSTED');
    const isServiceUnavailable = error?.status >= 500 || error?.message?.includes('503') || error?.message?.includes('500');

    if (isRateLimit || isServiceUnavailable) {
      return generateFallbackDraft(context, true);
    }

    return generateFallbackDraft(context, false);

  }

}



/**
 * Offline fallback
 */
function generateFallbackDraft(
  context: ApplicationContext,
  isAiTraffic: boolean = false
): string {


  let draft = `
Dear Hiring Team,

I am excited to apply for the opportunity of ${context.opportunityTitle}
at ${context.organization || "your organization"}.

With my background in technology and experience building projects,
I believe I can contribute effectively while continuing to learn and grow.

My skills and project experience align well with this opportunity,
and I would appreciate the chance to demonstrate my abilities.

Thank you for considering my application.

Regards,
${context.profile?.name || "Your Name"}
`;

  if (isAiTraffic) {
    draft += `\n*(Note: This is a static template provided because our AI service is currently experiencing high traffic. Please customize it before sending.)*\n`;
  } else if (!process.env.GEMINI_API_KEY) {
    draft += `\n*(Note: This is a static template provided because AI features are currently unavailable. Please customize it before sending.)*\n`;
  }

  return draft;
}