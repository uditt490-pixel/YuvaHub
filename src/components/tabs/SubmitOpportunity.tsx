import React, { useState } from 'react';
import { Check, Loader2, Send, PlusCircle, Shield, Sparkles } from 'lucide-react';
import { submitOpportunity } from '../../services/apiClient';
import { ErrorState } from '../ui/states';
import { useAppContext } from '../../context/AppContext';

export default function SubmitOpportunity() {
  const { user } = useAppContext();
  const [formData, setFormData] = useState({
    type: 'Internship',
    title: '',
    org: '',
    desc: '',
    year: 'Any',
    field: 'Any',
    location: '',
    link: '',
    deadline: '',
    tags: '',
    email: '',
    confirmed: false
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.confirmed || loading) return;

    setLoading(true);
    setSubmitError(null);
    try {
      if (!user) throw new Error("Must be logged in to submit an opportunity.");
      
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      
      await submitOpportunity({
        type: formData.type,
        title: formData.title,
        organization: formData.org,
        description: formData.desc,
        eligibility: {
          year: formData.year,
          field: formData.field,
          location: formData.location
        },
        link: formData.link,
        deadline: formData.deadline,
        tags: tagsArray,
        contactEmail: formData.email
      });
      
      setSuccess(true);
      setFormData({
        type: 'Internship', title: '', org: '', desc: '', year: 'Any', field: 'Any', location: '', link: '', deadline: '', tags: '', email: '', confirmed: false
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Unable to submit the opportunity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="w-full max-w-[1400px] mx-auto py-16 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-surface-secondary border border-border-theme text-text-secondary mb-4">
          <PlusCircle className="w-8 h-8 text-primary-blue" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-text-primary mb-2">Sign in to Submit</h2>
        <p className="text-sm text-text-secondary font-medium max-w-md">You need to be signed in to submit an opportunity to the YuvaHub network.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-12 bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-10 text-center flex flex-col items-center shadow-md space-y-4">
        <div className="w-16 h-16 bg-[#63703d]/15 text-[#63703d] flex items-center justify-center rounded-full border border-[#63703d]/30">
          <Check className="w-8 h-8 text-[#63703d]" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-text-primary dark:text-white">Opportunity Submitted!</h2>
        <p className="text-sm text-text-secondary dark:text-slate-300 font-medium">Your opportunity is live for review by our moderation team. It will appear within 24 hours.</p>
        <button 
          onClick={() => setSuccess(false)} 
          className="px-6 py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md transition-colors"
        >
          Submit Another Opportunity
        </button>
      </div>
    );
  }

  const TAG_OPTIONS = ['AI/ML', 'Web Dev', 'Design', 'Finance', 'Science', 'Law', 'Medicine', 'Cybersecurity', 'Data Science', 'Other'];

  const toggleTag = (tag: string) => {
    let currentTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (currentTags.includes(tag)) {
      currentTags = currentTags.filter(t => t !== tag);
    } else {
      currentTags.push(tag);
    }
    setFormData({...formData, tags: currentTags.join(', ')});
  };

  const isTagSelected = (tag: string) => formData.tags.split(',').map(t => t.trim()).includes(tag);

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">
      {/* Header */}
      <header className="border-b border-border-theme dark:border-slate-800 pb-6 pt-2 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#603620] text-[#f3e4bd] text-xs font-bold uppercase tracking-wider">
          <PlusCircle className="w-3.5 h-3.5 text-[#f3e4bd]" />
          <span>Organizer Submission Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text-primary dark:text-white tracking-tight">
          Submit Opportunity
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary dark:text-slate-400 font-medium">
          Contribute verified student-friendly hackathons, internships, scholarships, or jobs to the YuvaHub network.
        </p>
      </header>

      {submitError ? <ErrorState title="Submission failed" description={submitError} /> : null}

      <form onSubmit={handleSubmit} className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-slate-300">Opportunity Title <span className="text-red-500">*</span></label>
          <input required type="text" className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none focus:border-primary-blue" placeholder="e.g. Software Development Engineer Intern" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-slate-300">Organization / Company <span className="text-red-500">*</span></label>
            <input required type="text" className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none focus:border-primary-blue" placeholder="e.g. Google / Microsoft" value={formData.org} onChange={e => setFormData({...formData, org: e.target.value})} />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-slate-300">Opportunity Category <span className="text-red-500">*</span></label>
            <select className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none focus:border-primary-blue cursor-pointer" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              {['Internship', 'Hackathon', 'Scholarship', 'Job', 'Fellowship', 'Event', 'Program', 'Other'].map(t => (
                <option key={t} value={t} className="bg-surface text-text-primary">{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-slate-300">Description <span className="text-red-500">*</span></label>
          <textarea required maxLength={500} rows={4} className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none focus:border-primary-blue resize-none" placeholder="Provide a brief overview of eligibility, responsibilities, and benefits..." value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} />
        </div>

        <div className="pt-4 border-t border-border-theme dark:border-slate-800 space-y-3">
          <h4 className="font-serif font-bold text-text-primary dark:text-slate-100 text-sm">Eligibility Parameters</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-text-muted uppercase">Year of Study</label>
               <select className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-2.5 text-xs text-text-primary dark:text-white" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                 {['Any', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgrad'].map(y => <option key={y} value={y}>{y}</option>)}
               </select>
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-text-muted uppercase">Field of Study</label>
               <select className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-2.5 text-xs text-text-primary dark:text-white" value={formData.field} onChange={e => setFormData({...formData, field: e.target.value})}>
                 {['Any', 'Engineering', 'Science', 'Commerce', 'Arts', 'Law', 'Medicine', 'Design'].map(y => <option key={y} value={y}>{y}</option>)}
               </select>
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-text-muted uppercase">Location</label>
               <input type="text" className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-2.5 text-xs text-text-primary dark:text-white" placeholder="e.g. Remote / Hybrid" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-theme dark:border-slate-800">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-slate-300">Official Portal Application URL <span className="text-red-500">*</span></label>
            <input required type="url" className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none focus:border-primary-blue" placeholder="https://official-program-page.com" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-slate-300">Application Deadline</label>
            <input type="date" className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none focus:border-primary-blue" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
          </div>
        </div>

        <div className="pt-4 border-t border-border-theme dark:border-slate-800 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-slate-300 block mb-2">Category Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map(tag => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                    isTagSelected(tag)
                      ? 'bg-primary-blue text-white border-primary-blue shadow-sm'
                      : 'bg-surface-secondary dark:bg-slate-800 text-text-secondary dark:text-slate-300 border-border-theme dark:border-slate-700 hover:bg-[#e8ded1]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-slate-300">Organizer Contact Email</label>
            <input type="email" className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none focus:border-primary-blue" placeholder="organizer@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
        </div>

        <div className="pt-6 border-t border-border-theme dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-border-theme text-primary-blue focus:ring-[#b56b37]" 
              checked={formData.confirmed} 
              onChange={e => setFormData({...formData, confirmed: e.target.checked})} 
            />
            <span className="text-xs text-text-primary dark:text-slate-300 font-semibold group-hover:text-primary-blue transition-colors">
              I confirm this is a legitimate, student-friendly opportunity with zero hidden fees.
            </span>
          </label>
          
          <button 
            type="submit" 
            disabled={!formData.confirmed || loading} 
            className="w-full sm:w-auto px-8 py-3.5 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md shadow-[#b56b37]/20 flex justify-center items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? <><Loader2 className="animate-spin w-4 h-4" /> Submitting...</> : <>Submit Opportunity <Send className="w-3.5 h-3.5" /></>}
          </button>
        </div>

      </form>
    </div>
  );
}
