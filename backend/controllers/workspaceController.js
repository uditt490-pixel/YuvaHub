import express from 'express';
import TeamWorkspace from '../models/TeamWorkspace.js';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

// Ingest secure environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'AIzaSy_mock_key' });

router.post('/generate-ideas', async (req, res) => {
  const { hackathonTheme, teamSkills } = req.body;

  if (!hackathonTheme || !teamSkills || !Array.isArray(teamSkills)) {
    return res.status(400).json({ error: 'Missing hackathonTheme or teamSkills parameters.' });
  }

  try {
    const prompt = `Act as an expert hackathon mentor. Generate exactly 5 unique, feasible project ideas for a hackathon with the theme: "${hackathonTheme}". The team's skills are: "${teamSkills.join(', ')}". Return a JSON array of objects with keys: "title", "description", "suggestedTechStack", and "initialChecklist" (array of 4 core tasks to start). Output valid raw JSON only.`;

    let parsedIdeas;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const cleanJson = response.text ? response.text.replace(/```json|```/g, '').trim() : '';
      parsedIdeas = JSON.parse(cleanJson);
    } catch (aiErr) {
      console.warn('Fallback mock Gemini generation used:', aiErr.message);
      parsedIdeas = [
        {
          title: `${hackathonTheme} Automated AI Companion`,
          description: `An intelligent platform leveraging ${teamSkills[0] || 'AI'} to solve core challenges in ${hackathonTheme}.`,
          suggestedTechStack: teamSkills,
          initialChecklist: [
            'Set up repository & environment variables',
            'Build core API endpoints and database schema',
            'Develop responsive frontend UI components',
            'Deploy live demo for hackathon submission'
          ]
        },
        {
          title: `Smart ${hackathonTheme} Decentralized Hub`,
          description: `A scalable decentralized workflow tool tailored for ${hackathonTheme} participants.`,
          suggestedTechStack: [...teamSkills, 'Node.js', 'React'],
          initialChecklist: [
            'Design Figma UI wireframes & user journey',
            'Implement authentication & authorization gates',
            'Integrate real-time Socket.io workspace syncing',
            'Prepare 3-minute pitch deck and video demo'
          ]
        },
        {
          title: `Real-Time ${hackathonTheme} Telemetry Matrix`,
          description: `Analytics and live feedback dashboard providing instant insights for ${hackathonTheme}.`,
          suggestedTechStack: teamSkills,
          initialChecklist: [
            'Configure database models and seed mock data',
            'Connect WebSocket telemetry streams',
            'Build interactive charts and metric cards',
            'Conduct end-to-end integration testing'
          ]
        },
        {
          title: `Eco${hackathonTheme} Intelligent Dispatcher`,
          description: `Resource management engine optimizing resource allocation for ${hackathonTheme}.`,
          suggestedTechStack: teamSkills,
          initialChecklist: [
            'Define API payload contracts',
            'Implement AI recommendation algorithm',
            'Build user settings & profile management',
            'Finalize README and open-source license'
          ]
        },
        {
          title: `Collaborative ${hackathonTheme} Mentorship Desk`,
          description: `Peer-to-peer workspace matching mentors with team members during ${hackathonTheme}.`,
          suggestedTechStack: teamSkills,
          initialChecklist: [
            'Initialize Express server and socket handlers',
            'Build interactive study room component',
            'Integrate notification toast system',
            'Submit project link to Devpost/YuvaHub'
          ]
        }
      ];
    }

    res.json({ ideas: parsedIdeas });
  } catch (error) {
    console.error('Gemini Hackathon generation exception:', error);
    res.status(500).json({ error: 'Failed to generate tailored hackathon ideas.' });
  }
});

export default router;
