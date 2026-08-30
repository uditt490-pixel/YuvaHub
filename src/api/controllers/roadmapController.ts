import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Roadmap } from '../../models/Roadmap';
import { getRoadmapGenerationPrompt } from '../../utils/roadmapPrompts';
import { logger } from '../../utils/logger';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generates a new roadmap for a user's target role using Gemini AI.
 */
export const generateRoadmap = async (req: Request, res: Response) => {
    try {
        const { targetRole } = req.body;
        const userId = (req as any).user?.uid; // Assuming auth middleware attaches this

        if (!targetRole) {
            return res.status(400).json({ error: 'Target role is required' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = getRoadmapGenerationPrompt(targetRole);

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean markdown code blocks if Gemini adds them
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const nodes = JSON.parse(cleanJson);

        // Assign sequential IDs if missing
        const formattedNodes = nodes.map((node: any, index: number) => ({
            ...node,
            id: node.id || `node-${index}`,
            status: index === 0 ? 'in-progress' : 'locked', // First node is in-progress
        }));

        // Save to database
        const newRoadmap = await Roadmap.create({
            userId,
            targetRole,
            nodes: formattedNodes,
        });

        res.status(201).json({ data: newRoadmap });
    } catch (error) {
        logger.error({ err: error }, 'Error generating roadmap:');
        res.status(500).json({ error: 'Failed to generate roadmap' });
    }
};

/**
 * Updates the status of a specific node in a user's roadmap.
 */
export const updateNodeStatus = async (req: Request, res: Response) => {
    try {
        const { roadmapId, nodeId, status } = req.body;
        const userId = (req as any).user?.uid;

        if (!['in-progress', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
        if (!roadmap) {
            return res.status(404).json({ error: 'Roadmap not found' });
        }

        const node = roadmap.nodes.find((n: any) => n.id === nodeId);
        if (!node) {
            return res.status(404).json({ error: 'Node not found' });
        }

        node.status = status;

        // If a node is completed, unlock the next one
        if (status === 'completed') {
            const currentIndex = roadmap.nodes.findIndex((n: any) => n.id === nodeId);
            if (currentIndex !== -1 && currentIndex + 1 < roadmap.nodes.length) {
                roadmap.nodes[currentIndex + 1].status = 'in-progress';
            }
        }

        await roadmap.save();
        res.status(200).json({ data: roadmap });
    } catch (error) {
        logger.error({ err: error }, 'Error updating node status:');
        res.status(500).json({ error: 'Failed to update node' });
    }
};
