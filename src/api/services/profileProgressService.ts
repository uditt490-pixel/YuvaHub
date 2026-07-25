export interface MissingItem {
  field: string;
  suggestion: string;
}

export interface ProfileProgress {
  score: number;
  missingItems: MissingItem[];
}

export const calculateProfileProgress = (user: any, resumes: any[]): ProfileProgress => {
  let score = 0;
  const missingItems: MissingItem[] = [];

  // 1. Avatar (10%)
  if (user.avatarUrl && user.avatarUrl.trim() !== '') {
    score += 10;
  } else {
    missingItems.push({
      field: 'avatar',
      suggestion: 'Upload a profile picture to make your profile stand out.'
    });
  }

  // 2. Bio (15%)
  if (user.bio && user.bio.trim() !== '') {
    score += 15;
  } else {
    missingItems.push({
      field: 'bio',
      suggestion: 'Add a short bio to tell others about yourself.'
    });
  }

  // 3. Resume (40%)
  if ((resumes && resumes.length > 0) || (user.resumeUrl && user.resumeUrl.trim() !== '')) {
    score += 40;
  } else {
    missingItems.push({
      field: 'resume',
      suggestion: 'Upload your resume to significantly improve your AI matching capabilities.'
    });
  }

  // 4. Education (20%)
  if (
    (user.college && user.college.trim() !== '') || 
    (user.year && user.year.trim() !== '') || 
    (user.field && user.field.trim() !== '')
  ) {
    score += 20;
  } else {
    missingItems.push({
      field: 'education',
      suggestion: 'Add your education details (college, year, field) to help us find relevant opportunities.'
    });
  }

  // 5. Skills (15%)
  if (user.skills && Array.isArray(user.skills) && user.skills.length > 0) {
    score += 15;
  } else {
    missingItems.push({
      field: 'skills',
      suggestion: 'Add your skills so we can match you with the right opportunities.'
    });
  }

  return {
    score,
    missingItems
  };
};
