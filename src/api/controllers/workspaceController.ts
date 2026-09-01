import { Request, Response } from 'express';
import { TeamWorkspace } from '../../models/TeamWorkspace.js';
import { sendSuccess, sendError } from '../../lib/apiResponse.js';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'AIzaSy_mock_key' });

export const generateHackathonIdeas = async (req: Request, res: Response) => {
  const { hackathonTheme, teamSkills } = req.body;

  if (!hackathonTheme || !teamSkills || !Array.isArray(teamSkills)) {
    return sendError(res, 'Missing hackathonTheme or teamSkills parameters.', 400);
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
    } catch (aiErr: any) {
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

    return sendSuccess(res, { ideas: parsedIdeas });
  } catch (error) {
    console.error('Gemini Hackathon generation exception:', error);
    return sendError(res, 'Failed to generate tailored hackathon ideas.', 500);
  }
};

export const createTeamWorkspace = async (req: Request, res: Response) => {
  const { hackathonId, teamId, selectedIdea, checklist } = req.body;
  const userId = req.user?.id || (req.user as any)?._id || 'user_anon';

  try {
    const formattedChecklist = (checklist || []).map((task: string | any, idx: number) => ({
      id: typeof task === 'string' ? `task_${idx + 1}` : (task.id || `task_${idx + 1}`),
      task: typeof task === 'string' ? task : task.task,
      completed: typeof task === 'object' ? !!task.completed : false,
    }));

    const workspace = await (TeamWorkspace as any).findOneAndUpdate(
      { teamId },
      {
        hackathonId: hackathonId || 'hackathon_default',
        teamId,
        $addToSet: { members: userId },
        selectedIdea,
        checklist: formattedChecklist,
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({ success: true, workspace });
  } catch (error) {
    console.error('Error creating team workspace:', error);
    return sendError(res, 'Failed to create team workspace.', 500);
  }
};

export const getTeamWorkspace = async (req: Request, res: Response) => {
  const { workspaceId } = req.params;

  try {
    let workspace = await (TeamWorkspace as any).findOne({ teamId: workspaceId });

    if (!workspace) {
      workspace = {
        _id: workspaceId as any,
        hackathonId: 'hackathon_demo' as any,
        teamId: workspaceId,
        members: [],
        selectedIdea: {
          title: 'AI Smart Hackathon Companion',
          description: 'Collaborative AI workspace for real-time team synchronization.',
          techStack: ['React', 'TypeScript', 'Node.js', 'Socket.io', 'Gemini AI'],
        },
        checklist: [
          { id: 'task_1', task: 'Set up repository & environment variables', completed: true },
          { id: 'task_2', task: 'Build core API endpoints and database schema', completed: false },
          { id: 'task_3', task: 'Develop responsive frontend UI components', completed: false },
          { id: 'task_4', task: 'Deploy live demo for hackathon submission', completed: false },
        ],
        notepad: 'Brainstorm with your team in real-time here...\n- Core AI model integration\n- WebSocket room channel\n- Pitch presentation outline',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
    }

    return sendSuccess(res, workspace);
  } catch (error) {
    console.error('Error fetching team workspace:', error);
    return sendError(res, 'Failed to fetch team workspace.', 500);
  }
};
