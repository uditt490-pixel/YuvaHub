import React from 'react';
import mockData from '../../data/mockPortfolio.json';

const Minimalist = ({ userData = mockData }) => {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a202c', backgroundColor: '#fdfdfd', minHeight: '100vh', padding: '40px 20px' }}>
      <main style={{ maxWidth: '768px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <header style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '32px', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            {userData.name}
          </h1>
          <h2 style={{ fontSize: '1.25rem', color: '#4a5568', fontWeight: '400', margin: '0 0 24px 0' }}>
            {userData.headline}
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#718096', maxWidth: '600px', margin: '0 0 24px 0' }}>
            {userData.bio}
          </p>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href={userData.socials.github} target="_blank" rel="noopener noreferrer" style={{ color: '#2b6cb0', textDecoration: 'none', fontWeight: '600' }}>GitHub</a>
            <a href={userData.socials.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#2b6cb0', textDecoration: 'none', fontWeight: '600' }}>LinkedIn</a>
            <a href={`mailto:${userData.socials.email}`} style={{ color: '#2b6cb0', textDecoration: 'none', fontWeight: '600' }}>Email</a>
          </div>
        </header>

        {/* Badges Section */}
        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>YuvaHub Achievements</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {userData.badges.map((badge, idx) => (
              <span key={idx} style={{ backgroundColor: '#edf2f7', color: '#2d3748', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500' }}>
                🏆 {badge}
              </span>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Featured Projects</h3>
          <div style={{ display: 'grid', gap: '24px' }}>
            {userData.projects.map((project, idx) => (
              <div key={idx} style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', transition: 'transform 0.2s' }}>
                <h4 style={{ fontSize: '1.25rem', margin: '0 0 8px 0' }}>
                  <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ color: '#1a202c', textDecoration: 'none' }}>{project.title}</a>
                </h4>
                <p style={{ color: '#718096', margin: '0 0 16px 0', lineHeight: '1.5' }}>{project.description}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {project.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4a5568', fontWeight: '600' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Minimalist;
