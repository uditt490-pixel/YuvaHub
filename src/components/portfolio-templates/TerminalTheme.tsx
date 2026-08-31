import React from 'react';
import mockData from '../../data/mockPortfolio.json';

const TerminalTheme = ({ userData = mockData }) => {
  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#00ff41', fontFamily: '"Fira Code", "Courier New", Courier, monospace', minHeight: '100vh', padding: '40px 20px', lineHeight: '1.6' }}>
      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Terminal Header */}
        <div style={{ marginBottom: '40px', borderBottom: '1px dashed #333', paddingBottom: '20px' }}>
          <p style={{ margin: '0 0 10px 0', color: '#888' }}>
            <span style={{ color: '#00ff41' }}>guest@yuvahub</span>:<span style={{ color: '#3b82f6' }}>~</span>$ ./fetch_profile.sh --user {userData.name.split(' ')[0].toLowerCase()}
          </p>
          <h1 style={{ fontSize: '2.5rem', margin: '10px 0', fontWeight: 'bold' }}>
            &gt; {userData.name}_
          </h1>
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 20px 0', color: '#fff' }}>
            [{userData.headline}]
          </h2>
          <p style={{ maxWidth: '650px', margin: '0' }}>{userData.bio}</p>
        </div>

        {/* Links / Socials */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ margin: '0 0 10px 0', color: '#888' }}>
            <span style={{ color: '#00ff41' }}>guest@yuvahub</span>:<span style={{ color: '#3b82f6' }}>~/contact</span>$ ls -la
          </p>
          <ul style={{ listStyleType: 'none', padding: '0', margin: '0', display: 'flex', gap: '20px' }}>
            <li><a href={userData.socials.github} target="_blank" rel="noopener noreferrer" style={{ color: '#00ff41', textDecoration: 'underline' }}>github.sh</a></li>
            <li><a href={userData.socials.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#00ff41', textDecoration: 'underline' }}>linkedin.sh</a></li>
            <li><a href={`mailto:${userData.socials.email}`} style={{ color: '#00ff41', textDecoration: 'underline' }}>email.sh</a></li>
          </ul>
        </div>

        {/* Badges */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ margin: '0 0 10px 0', color: '#888' }}>
            <span style={{ color: '#00ff41' }}>guest@yuvahub</span>:<span style={{ color: '#3b82f6' }}>~/achievements</span>$ cat badges.json
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            {userData.badges.map((badge, idx) => (
              <span key={idx} style={{ border: '1px solid #00ff41', padding: '4px 10px', fontSize: '0.9rem' }}>
                [{badge}]
              </span>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <p style={{ margin: '0 0 10px 0', color: '#888' }}>
            <span style={{ color: '#00ff41' }}>guest@yuvahub</span>:<span style={{ color: '#3b82f6' }}>~/projects</span>$ ./deploy_all.sh
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {userData.projects.map((project, idx) => (
              <div key={idx} style={{ borderLeft: '2px solid #333', paddingLeft: '15px' }}>
                <h3 style={{ fontSize: '1.2rem', margin: '0 0 5px 0' }}>
                  <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                    {project.title}
                  </a>
                </h3>
                <p style={{ margin: '0 0 10px 0', color: '#ccc' }}>{project.description}</p>
                <p style={{ margin: '0', fontSize: '0.85rem' }}>
                  <span style={{ color: '#888' }}>Tags: </span> 
                  {project.tags.join(' | ')}
                </p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '30px', color: '#888', animation: 'blink 1s step-end infinite' }}>_</p>
        </div>

      </main>
      
      {/* Blinking cursor animation inline */}
      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
};

export default TerminalTheme;
