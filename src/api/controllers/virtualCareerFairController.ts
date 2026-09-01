import { Request, Response } from "express";
import { VirtualCareerFairSchema, CompanyBoothSchema, IVirtualCareerFair, ICompanyBooth } from "../../models/virtualCareerFairSchema";

// In-memory store for demonstration purposes
const careerFairs: IVirtualCareerFair[] = [];
const booths: ICompanyBooth[] = [];

export const createCareerFair = (req: Request, res: Response) => {
  try {
    const parsed = VirtualCareerFairSchema.parse(req.body);
    const newFair = { ...parsed, id: Math.random().toString(36).substring(7) };
    careerFairs.push(newFair);
    res.status(201).json(newFair);
  } catch (error) {
    res.status(400).json({ error: "Invalid data" });
  }
};

export const getCareerFairs = (req: Request, res: Response) => {
  res.json(careerFairs);
};

export const addCompanyBooth = (req: Request, res: Response) => {
  try {
    const parsed = CompanyBoothSchema.parse(req.body);
    const newBooth = { ...parsed, id: Math.random().toString(36).substring(7) };
    booths.push(newBooth);
    // Find the fair and add the booth to it
    const fairIndex = careerFairs.findIndex(f => f.id === parsed.fairId);
    if (fairIndex !== -1) {
      if (!careerFairs[fairIndex].booths) {
        careerFairs[fairIndex].booths = [];
      }
      careerFairs[fairIndex].booths?.push(newBooth);
    }
    res.status(201).json(newBooth);
  } catch (error) {
    res.status(400).json({ error: "Invalid data" });
  }
};

export const getCompanyBooths = (req: Request, res: Response) => {
  const { fairId } = req.params;
  const filteredBooths = booths.filter(b => b.fairId === fairId);
  res.json(filteredBooths);
};

export const dropResume = (req: Request, res: Response) => {
  const { boothId, studentId, resumeUrl } = req.body;
  if (!boothId || !studentId || !resumeUrl) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  // In a real application, save to DB
  console.log(`Student ${studentId} dropped resume at booth ${boothId}. URL: ${resumeUrl}`);
  res.status(200).json({ message: "Resume dropped successfully" });
};
