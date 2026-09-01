import React, { useState } from 'react';

export default function ScraperBuilder() {
  const [form, setForm] = useState({
    name: '',
    targetUrl: '',
    renderMode: 'static',
    pagination: { type: 'url_pattern', nextSelector: '', urlParamName: 'page' },
    selectors: { listContainer: '', title: '', link: '', deadline: '', description: '', organization: '' },
  });
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTestScrape = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/scrapers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      setPreviewData(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const res = await fetch('/api/admin/scrapers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) alert('Blueprint saved successfully!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Custom Scraper Builder</h1>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Scraper Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border p-2 rounded" />
        <input placeholder="Target URL" value={form.targetUrl} onChange={e => setForm({...form, targetUrl: e.target.value})} className="border p-2 rounded" />
      </div>
      <div className="flex gap-4">
        <select value={form.renderMode} onChange={e => setForm({...form, renderMode: e.target.value as any})} className="border p-2 rounded">
          <option value="static">Static (Cheerio)</option>
          <option value="dynamic">Dynamic (Playwright)</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="List Container Selector (e.g. .job-card)" value={form.selectors.listContainer} onChange={e => setForm({...form, selectors: {...form.selectors, listContainer: e.target.value}})} className="border p-2 rounded" />
        <input placeholder="Title Selector (e.g. h3::text)" value={form.selectors.title} onChange={e => setForm({...form, selectors: {...form.selectors, title: e.target.value}})} className="border p-2 rounded" />
        <input placeholder="Link Selector (e.g. a::attr(href))" value={form.selectors.link} onChange={e => setForm({...form, selectors: {...form.selectors, link: e.target.value}})} className="border p-2 rounded" />
        <input placeholder="Deadline Selector" value={form.selectors.deadline} onChange={e => setForm({...form, selectors: {...form.selectors, deadline: e.target.value}})} className="border p-2 rounded" />
      </div>
      <div className="flex gap-4">
        <button onClick={handleTestScrape} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? 'Testing...' : 'Test Scrape'}</button>
        <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">Save Blueprint</button>
      </div>
      {previewData.length > 0 && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Test Preview Results:</h3>
          <pre className="text-xs overflow-x-auto">{JSON.stringify(previewData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
