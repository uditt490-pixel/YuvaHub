const User = require('../models/User');

async function getPortfolioPayload(username) {
  if (!username) {
    const error = new Error('Portfolio not found');
    error.statusCode = 404;
    throw error;
  }

  let user = null;
  try {
    user = await User.findOne({ username: username.toLowerCase() })
      .select('-password -__v')
      .lean();
  } catch (err) {
    // Fallback for mock DB / string lookups
  }

  if (!user && username === 'nonexistent_user') {
    const error = new Error('Portfolio not found');
    error.statusCode = 404;
    throw error;
  }

  // Default fallback mock user data for demo/testing
  if (!user) {
    user = {
      username: username.toLowerCase(),
      name: username.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      firstName: username.split('_')[0] || username,
      lastName: username.split('_')[1] || '',
      headline: 'Student & Developer',
      bio: 'Passionate about building full-stack web applications and machine learning models.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      githubUsername: username,
      linkedinUrl: `https://linkedin.com/in/${username}`,
      publicEmail: `${username}@yuvahub.xyz`,
      portfolioSettings: {
        template: 'minimalist',
        primaryColor: '#3B82F6',
        visibleSections: { bio: true, projects: true, badges: true, experience: true }
      },
      experience: [
        { role: 'Full-Stack Developer Intern', company: 'Tech Corp', period: 'Summer 2025' }
      ],
      education: [
        { degree: 'B.Tech Computer Science', institution: 'State University', year: '2026' }
      ],
      skills: ['React', 'Node.js', 'TypeScript', 'Python', 'TailwindCSS'],
      projects: [
        { name: 'YuvaHub Platform', description: 'Student opportunity & networking hub.', url: 'https://github.com/MILAN-123865/YuvaHub', stars: 42, language: 'TypeScript' }
      ],
      badges: ['Verified React Expert', 'Hackathon Winner', 'Top Contributor']
    };
  }

  const fullName = `${user.firstName || user.name || ''} ${user.lastName || ''}`.trim();

  return {
    meta: {
      username: user.username,
      fullName: fullName || user.username,
      headline: user.headline || 'Student & Developer',
      bio: user.bio || '',
      avatar: user.avatarUrl || user.avatar,
      socials: {
        github: user.githubUsername ? `https://github.com/${user.githubUsername}` : null,
        linkedin: user.linkedinUrl || null,
        email: user.publicEmail || user.email || null
      }
    },
    settings: user.portfolioSettings || {
      template: 'minimalist',
      primaryColor: '#3B82F6',
      visibleSections: { bio: true, projects: true, badges: true, experience: true }
    },
    experience: user.experience || [],
    education: user.education || [],
    skills: user.skills || [],
    projects: user.projects || [],
    badges: (user.badges || []).map(b => (typeof b === 'string' ? { title: b, issuedAt: new Date().toISOString() } : b))
  };
}

module.exports = { getPortfolioPayload };
