import { Request, Response } from 'express';
import { ObjectId, db } from '../db.js';
import { ProjectIncubationSchema, AIVentureEvaluationSchema } from '../../models/incubationSchema.js';
import { getGenAI } from '../genai.js';
import { Type } from '@google/genai';

export async function createIncubationProject(req: Request, res: Response) {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const validatedData = ProjectIncubationSchema.parse(req.body);
    const collection = db.collection('incubation_projects');

    const result = await collection.insertOne({
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      id: result.insertedId,
      project: { id: result.insertedId, ...validatedData }
    });
  } catch (err: any) {
    console.error('[IncubationController] Create error:', err);
    res.status(400).json({ error: err.message || 'Invalid incubation project payload' });
  }
}

export async function getIncubationProjects(req: Request, res: Response) {
  try {
    if (!db) {
      return res.json({ projects: [], total: 0 });
    }

    const collection = db.collection('incubation_projects');
    const category = req.query.category as string;
    const stage = req.query.stage as string;

    const query: any = {};
    if (category) query.category = category;
    if (stage) query.stage = stage;

    const projects = await collection.find(query).sort({ createdAt: -1 }).toArray();

    const formatted = projects.map((p: any) => ({
      ...p,
      id: p._id ? p._id.toString() : p.id
    }));

    res.json({ success: true, count: formatted.length, projects: formatted });
  } catch (err: any) {
    console.error('[IncubationController] Get error:', err);
    res.status(500).json({ error: 'Failed to retrieve incubation projects' });
  }
}

export async function getIncubationProjectById(req: Request, res: Response) {
  try {
    if (!db) return res.status(503).json({ error: 'Database unavailable' });

    const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    let queryId: any;
    try {
      queryId = new ObjectId(idStr);
    } catch {
      queryId = idStr;
    }

    const project = await db.collection('incubation_projects').findOne({ _id: queryId });
    if (!project) {
      return res.status(404).json({ error: 'Incubation project not found' });
    }

    res.json({
      success: true,
      project: { ...project, id: project._id ? project._id.toString() : project.id }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
}

export async function evaluateVentureWithAI(req: Request, res: Response) {
  try {
    const { title, tagline, problemStatement, solutionOverview, targetMarket, category, fundingRequestedINR } = req.body;

    if (!title || !problemStatement || !solutionOverview) {
      return res.status(400).json({ error: 'Missing core pitch details for AI evaluation' });
    }

    const genAI = getGenAI();
    if (!genAI) {
      // Deterministic fallback response when AI is offline
      const fallbackEvaluation = {
        overallViabilityScore: 84,
        feasibilityRating: 'High - Strong architectural alignment and clear student product focus.',
        marketOpportunityRating: 'Substantial - Growing TAM in Indian student tech ecosystem.',
        keyStrengths: [
          'High demand for domain-specific automation',
          'Scalable business model with low upfront capital requirement',
          'Strong team structure and clear domain expertise'
        ],
        riskFactors: [
          'High competition from incumbents',
          'Requires rapid user acquisition to establish network effects'
        ],
        suggestedPivots: [
          'Incorporate tier-2 and tier-3 college campus distribution channels',
          'Offer freemium access for campus ambassadors'
        ],
        grantEligibilityScore: 88,
        recommendedFundingTierINR: Math.min(fundingRequestedINR || 100000, 250000)
      };
      return res.json({ success: true, evaluation: fallbackEvaluation, mode: 'fallback' });
    }

    const prompt = `
You are an elite Venture Capital Analyst and Student Startup Incubator Director at YuvaHub.
Evaluate the following student startup venture proposal and generate a structured evaluation JSON:

Project Title: ${title}
Tagline: ${tagline}
Category: ${category}
Problem Statement: ${problemStatement}
Solution Overview: ${solutionOverview}
Target Market: ${targetMarket}
Funding Requested: ₹${fundingRequestedINR}

Provide scores, ratings, strengths, risk factors, and grant recommendation.
`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallViabilityScore: { type: Type.INTEGER },
            feasibilityRating: { type: Type.STRING },
            marketOpportunityRating: { type: Type.STRING },
            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedPivots: { type: Type.ARRAY, items: { type: Type.STRING } },
            grantEligibilityScore: { type: Type.INTEGER },
            recommendedFundingTierINR: { type: Type.INTEGER }
          },
          required: [
            'overallViabilityScore',
            'feasibilityRating',
            'marketOpportunityRating',
            'keyStrengths',
            'riskFactors',
            'suggestedPivots',
            'grantEligibilityScore',
            'recommendedFundingTierINR'
          ]
        }
      }
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    const validated = AIVentureEvaluationSchema.parse(parsed);

    res.json({ success: true, evaluation: validated, mode: 'live_ai' });
  } catch (err: any) {
    console.error('[IncubationController] AI evaluate error:', err);
    res.status(500).json({ error: 'AI Venture evaluation encountered an error' });
  }
}
