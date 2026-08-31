import { Scholarship } from '../models/Scholarship.js';

export const screenScholarships = async (req, res) => {
  try {
    const { familyIncome, cgpa, gender, year, category } = req.body;

    // Build the strict filter query using MongoDB operators
    // A user qualifies if:
    // 1. Their family income is LESS THAN OR EQUAL TO the max allowed income ($lte)
    // 2. Their CGPA is GREATER THAN OR EQUAL TO the minimum required CGPA ($gte)
    // 3. The gender restriction is 'All' or matches their gender ($in)
    // 4. Their academic year is included in the eligible years ($in)
    const query = {
      'criteria.maxFamilyIncome': { $gte: Number(familyIncome) },
      'criteria.minCGPA': { $lte: Number(cgpa) },
      $or: [
        { 'criteria.genderRestriction': 'All' },
        { 'criteria.genderRestriction': gender }
      ],
      'criteria.eligibleYears': { $in: [Number(year)] }
    };

    const matchedScholarships = await Scholarship.find(query);

    // Calculate a match confidence score for each returned scholarship
    const scoredScholarships = matchedScholarships.map(scholarship => {
      let score = 70; // Base match for passing hard filters
      
      // Bonus points for closer income/CGPA alignment
      if (Number(familyIncome) <= scholarship.criteria.maxFamilyIncome * 0.7) score += 15;
      if (Number(cgpa) >= scholarship.criteria.minCGPA + 1.0) score += 15;

      return {
        ...scholarship.toObject(),
        matchConfidence: Math.min(score, 100) // Cap at 100%
      };
    });

    // Sort by highest confidence score
    scoredScholarships.sort((a, b) => b.matchConfidence - a.matchConfidence);

    res.status(200).json({
      success: true,
      count: scoredScholarships.length,
      scholarships: scoredScholarships
    });

  } catch (error) {
    console.error("Scholarship Screening Error:", error);
    res.status(500).json({ success: false, error: "Internal server error during screening." });
  }
};
