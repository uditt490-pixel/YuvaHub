import React from 'react';
import MinimalistTemplate from '../../src/components/portfolio/templates/MinimalistTemplate';
import TerminalTemplate from '../../src/components/portfolio/templates/TerminalTemplate';
import CreativeTemplate from '../../src/components/portfolio/templates/CreativeTemplate';
import { PortfolioPayload } from '../../src/services/portfolioService';

interface Props {
  params: { username: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

async function fetchPortfolioData(username: string): Promise<PortfolioPayload | null> {
  try {
    const res = await fetch(`http://localhost:3000/api/v1/portfolio/${username}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export default async function PortfolioPage({ params }: Props) {
  const data = await fetchPortfolioData(params.username);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-red-400">404 - Portfolio Not Found</h1>
          <p className="text-sm text-slate-400">The requested YuvaHub portfolio URL does not exist.</p>
        </div>
      </div>
    );
  }

  const templates: Record<string, React.ComponentType<{ data: PortfolioPayload }>> = {
    minimalist: MinimalistTemplate,
    terminal: TerminalTemplate,
    creative: CreativeTemplate,
  };

  const SelectedTemplate = templates[data.settings.template] || MinimalistTemplate;

  return (
    <main style={{ '--primary-color': data.settings.primaryColor } as React.CSSProperties}>
      <SelectedTemplate data={data} />
    </main>
  );
}
