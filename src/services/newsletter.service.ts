import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import WeeklyNewsletter from '../emails/WeeklyNewsletter';
import { UserPreferences } from '../models/UserPreferences';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock-key' });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SMTP_PASS || 'mock',
  },
});

export class NewsletterService {
  static async generateAiIntro(userName: string, userSkills: string[]): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a 2-sentence personalized opening paragraph for a weekly career newsletter for ${userName}, who has skills in ${userSkills.join(', ')}. Keep it encouraging and tailored to tech opportunities.`,
      });
      return response.text?.trim() || `Here are the top curated career opportunities matching your profile skills this week.`;
    } catch (err) {
      return `Here are the top curated career opportunities matching your profile skills this week.`;
    }
  }

  static async sendNewsletterBatch(batchSize: number = 100, skip: number = 0) {
    const preferences = await UserPreferences.find({ subscribedToNewsletter: true })
      .skip(skip)
      .limit(batchSize);

    for (const pref of preferences) {
      // Query top 5 highest-ranked opportunities matching user tags (Mock DB query here)
      const mockOpportunities = [
        { title: 'AI Software Engineering Intern', organization: 'Google', link: 'https://yuvahub.com/opp/1' },
        { title: 'Embedded Systems Developer', organization: 'Tesla', link: 'https://yuvahub.com/opp/2' },
        { title: 'Full Stack Engineer', organization: 'Microsoft', link: 'https://yuvahub.com/opp/3' },
        { title: 'Machine Learning Resident', organization: 'OpenAI', link: 'https://yuvahub.com/opp/4' },
        { title: 'IoT Robotics Specialist', organization: 'Boston Dynamics', link: 'https://yuvahub.com/opp/5' },
      ];

      const aiIntro = await this.generateAiIntro('User', pref.skills);
      const unsubscribeUrl = `https://yuvahub.com/api/newsletter/unsubscribe?userId=${pref.userId}`;

      const emailHtml = await render(
        WeeklyNewsletter({
          userName: 'Developer',
          aiIntro,
          opportunities: mockOpportunities,
          unsubscribeUrl,
        })
      );

      await transporter.sendMail({
        from: '"YuvaHub Careers" <careers@yuvahub.com>',
        to: pref.email,
        subject: 'Your Personalized Weekly Career Digest 🚀',
        html: emailHtml,
      });
    }

    return { processed: preferences.length };
  }
}
