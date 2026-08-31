import React, { useState } from 'react';

const TechTrends = () => {
  // Mocking the exact data structure our RSS/Gemini worker generates
  const [articles, setArticles] = useState([
    {
      title: "Musk's faster path to more gas turbines comes with pollution problem",
      link: "#",
      source: "TechCrunch",
      pubDate: "Sun, 30 Aug 2026",
      tags: ["General Tech", "AI"],
      summary: "• High demand for new energy infrastructure creates jobs for engineering students.\n• Shifts in fuel sources highlight the need to learn sustainable tech practices.\n• Understanding hardware manufacturing cycles gives a competitive edge in tech interviews."
    },
    {
      title: "React 19 RC is now available on NPM",
      link: "#",
      source: "Hacker News",
      pubDate: "Sat, 29 Aug 2026",
      tags: ["Web Dev", "Careers"],
      summary: "• Students need to update their portfolios to showcase modern React 19 features.\n• The new compiler reduces manual optimization, changing how frontend interviews are structured.\n• Adopting this early signals strong continuous learning to recruiters."
    }
  ]);

  return (
    <div style={{ maxWidth: '650px', margin: '20px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>
        📈 Tech Trends & Insights
      </h2>
      
      {articles.map((article, index) => (
        <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '20px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          
          {/* Header: Source and Date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>{article.source}</span>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{article.pubDate}</span>
          </div>

          {/* Title */}
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', lineHeight: '1.4' }}>
            <a href={article.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#111827', fontWeight: 'bold' }}>
              {article.title}
            </a>
          </h3>

          {/* Auto-Tags */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {article.tags.map(tag => (
               <span key={tag} style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '500' }}>
                 {tag}
               </span>
            ))}
          </div>

          {/* Gemini AI Summary Box */}
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
            <strong style={{ color: '#1e293b', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>
              🤖 Why this matters for students:
            </strong>
            <ul style={{ paddingLeft: '20px', margin: 0, color: '#334155', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {article.summary.split('\n').map((point, i) => {
                const cleanPoint = point.replace('•', '').trim();
                return cleanPoint ? <li key={i}>{cleanPoint}</li> : null;
              })}
            </ul>
          </div>

        </div>
      ))}
    </div>
  );
};

export default TechTrends;
