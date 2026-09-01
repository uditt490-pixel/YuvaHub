import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ScanResult {
    issues: {
        type: 'accessibility' | 'seo';
        severity: 'low' | 'medium' | 'high';
        description: string;
        suggestion: string;
        resolved: boolean;
    }[];
}

/**
 * Uses Gemini AI to analyze content for accessibility and SEO issues.
 */
export const scanContent = async (content: any): Promise<ScanResult> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      Analyze the following content for Accessibility and SEO issues.
      Content Title: ${content.title}
      Content Description: ${content.description}
      Has Images Without Alt: ${content.hasImagesWithoutAlt}
      Meta Description Length: ${content.metaDescriptionLength}

      Return ONLY a valid JSON array of issues. Each issue must have:
      - "type": "accessibility" or "seo"
      - "severity": "low", "medium", or "high"
      - "description": string
      - "suggestion": string
      
      Example: [{"type": "accessibility", "severity": "high", "description": "Missing alt text", "suggestion": "Add descriptive alt text to all images"}]
    `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const issues = JSON.parse(responseText);

        return { issues: issues.map((i: any) => ({ ...i, resolved: false })) };
    } catch (error) {
        logger.error({ err: error }, 'AI Content Scanning failed:');
        // Fallback to rule-based scanning if AI fails
        const fallbackIssues = [];
        if (content.hasImagesWithoutAlt) {
            fallbackIssues.push({ type: 'accessibility', severity: 'high', description: 'Images missing alt text', suggestion: 'Add alt text', resolved: false });
        }
        if (content.metaDescriptionLength < 50) {
            fallbackIssues.push({ type: 'seo', severity: 'medium', description: 'Meta description too short', suggestion: 'Expand to 50-160 characters', resolved: false });
        }
        return { issues: fallbackIssues };
    }
};
