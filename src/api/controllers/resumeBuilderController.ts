import { Request, Response } from 'express';
import { getResumeDraft, upsertResumeDraft } from '../../models/resumeDraft.js';
import { generatePdf } from '../../services/pdfGenerator.js';
import { dbQuery } from '../db.js';

// Helper to get user profile data for hydration
export const getProfileData = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query as any;
    if (!userId) return res.status(400).json({ message: 'userId query param required' });
    const user = await dbQuery.collection('users').findOne({ uid: userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const profileData = {
      education: user.education || [],
      skills: user.skills || [],
      githubUrl: user.githubUrl || null,
      // Add more fields as needed
    };
    return res.json({ profileData });
  } catch (err: any) {
    console.error('Error in getProfileData', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Save or update a resume draft
export const upsertResumeDraftHandler = async (req: Request, res: Response) => {
  try {
    const { userId, draft } = req.body;
    if (!userId || !draft) return res.status(400).json({ message: 'userId and draft required' });
    await upsertResumeDraft(userId, draft);
    const saved = await getResumeDraft(userId);
    return res.json({ draft: saved });
  } catch (err: any) {
    console.error('Error in upsertResumeDraftHandler', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Retrieve a saved draft
export const getResumeDraftHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query as any;
    if (!userId) return res.status(400).json({ message: 'userId query param required' });
    const draft = await getResumeDraft(userId);
    if (!draft) return res.status(404).json({ message: 'Draft not found' });
    return res.json({ draft });
  } catch (err: any) {
    console.error('Error in getResumeDraftHandler', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Generate PDF from selected template and draft data
export const generatePdfHandler = async (req: Request, res: Response) => {
  try {
    const { templateId, data } = req.body;
    if (!templateId || !data) return res.status(400).json({ message: 'templateId and data required' });
    const pdfBuffer = await generatePdf(templateId, data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="resume.pdf"`);
    return res.send(pdfBuffer);
  } catch (err: any) {
    console.error('Error in generatePdfHandler', err);
    return res.status(500).json({ message: 'PDF generation failed' });
  }
};
