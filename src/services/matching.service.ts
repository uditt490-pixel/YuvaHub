import { Scholarship, IScholarship } from '../models/Scholarship';
import { ScreenerFormData } from '../schemas/screenerSchema';

export class MatchingService {
  static async findEligibleScholarships(profile: ScreenerFormData) {
    // MongoDB query ensuring hard filters exclude unqualified records
    const query: any = {};

    if (profile.familyIncome !== undefined) {
      query.$or = [
        { maxFamilyIncome: { $exists: false } },
        { maxFamilyIncome: { $gte: profile.familyIncome } },
      ];
    }

    if (profile.cgpa !== undefined) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { requiredCGPA: { $exists: false } },
          { requiredCGPA: { $lte: profile.cgpa } },
        ],
      });
    }

    if (profile.gender) {
      query.$and.push({
        $or: [
          { genderRestriction: 'Any' },
          { genderRestriction: { $exists: false } },
          { genderRestriction: profile.gender },
        ],
      });
    }

    const scholarships = await Scholarship.find(query);

    // Compute Match Confidence Score & breakdown reasons
    return scholarships.map((sch) => {
      let score = 70; // Base match
      const reasons: string[] = [];

      if (profile.cgpa && sch.requiredCGPA && profile.cgpa >= sch.requiredCGPA) {
        score += 15;
        reasons.push(`Your CGPA (${profile.cgpa}) meets or exceeds the required ${sch.requiredCGPA}.`);
      }
      if (profile.familyIncome && sch.maxFamilyIncome && profile.familyIncome <= sch.maxFamilyIncome) {
        score += 15;
        reasons.push(`Family income is within the maximum threshold of $${sch.maxFamilyIncome}.`);
      }

      return {
        scholarship: sch,
        matchConfidence: Math.min(score, 100),
        matchReasons: reasons,
      };
    });
  }
}
