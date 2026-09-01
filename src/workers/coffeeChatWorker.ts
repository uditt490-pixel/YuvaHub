import mongoose from 'mongoose';
import { Worker, Job } from 'bullmq';
import { User } from '../models/User.js';
import { CoffeeChatPairing } from '../models/CoffeeChatPairing.js';
import { generateIcebreakersAndEmail } from '../services/emailService.js';
import { redisClient } from '../config/redis.js';

export async function findValidMentor(student: any, mentors: any[], restrictionDate: Date) {
  for (const mentor of mentors) {
    const mentorIndustry = mentor.industry || mentor.targetIndustry;
    const studentIndustry = student.targetIndustry || student.industry;

    if (mentorIndustry === studentIndustry || !studentIndustry || !mentorIndustry) {
      if (mongoose.connection.readyState === 1) {
        try {
          const pastPairing = await (CoffeeChatPairing as any).findOne({
            studentId: student._id,
            mentorId: mentor._id,
            matchedAt: { $gte: restrictionDate }
          });

          if (!pastPairing) {
            return mentor;
          }
        } catch (err) {
          return mentor;
        }
      } else {
        return mentor;
      }
    }
  }
  return null;
}

export const coffeeChatWorker = new Worker('coffeeChatQueue', async (job: Job) => {
  if (job.name === 'weekly-lottery-match') {
    console.log('[LOTTERY] Initializing weekly mentorship lottery pairing...');

    const mentors = await (User as any).find({ role: 'MENTOR', optInCoffeeChat: true, shadowBanned: false });
    const students = await (User as any).find({ role: 'STUDENT', optInCoffeeChat: true });

    if (!mentors.length || !students.length) {
      console.log('[LOTTERY] Aborting matching sequence: Insufficient user pool.');
      return;
    }

    const shuffledStudents = students.sort(() => 0.5 - Math.random());
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    for (const student of shuffledStudents) {
      const compatibleMentor = await findValidMentor(student, mentors, sixMonthsAgo);

      if (compatibleMentor) {
        const mentorIndex = mentors.findIndex((m: any) => m.id === compatibleMentor.id || m._id.toString() === compatibleMentor._id.toString());
        if (mentorIndex !== -1) {
          mentors.splice(mentorIndex, 1);
        }

        if (mongoose.connection.readyState === 1) {
          try {
            await (CoffeeChatPairing as any).create({
              studentId: student._id,
              mentorId: compatibleMentor._id,
              industry: student.targetIndustry || student.industry || 'Technology'
            });
          } catch (err) {
            console.error('Error recording pairing:', err);
          }
        }

        await generateIcebreakersAndEmail(student, compatibleMentor);
      }
    }
    console.log('[LOTTERY] Weekly lottery execution block completed.');
  }
}, { connection: redisClient as any });
