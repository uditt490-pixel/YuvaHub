import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
    startDate: '',
    endDate: '',
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

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        setSubmitError("End date cannot be earlier than start date.");
        return;
      }
    }

    setLoading(true);
    setSubmitError(null);
    try {
      if (!user) throw new Error("Must be logged in to submit.");
      
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      
      await addDoc(collection(db, 'opportunities'), {
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
        startDate: formData.startDate,
        endDate: formData.endDate,
        tags: tagsArray,
        contactEmail: formData.email,
        status: 'pending_review',
        submitterUid: user.uid,
        createdAt: serverTimestamp()
      });
      
      setSuccess(true);
      setFormData({
        type: 'Internship', title: '', org: '', desc: '', year: 'Any', field: 'Any', location: '', link: '', deadline: '', startDate: '', endDate: '', tags: '', email: '', confirmed: false
      });
    } catch {
      setSubmitError('Unable to submit the opportunity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to Submit</h2>
        <p className="text-gray-500 max-w-md">You need to be signed in to submit an opportunity to the YuvaHub network.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-12 clean-card p-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 flex items-center justify-center rounded-full mb-6">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Opportunity Submitted!</h2>
        <p className="text-gray-600 mb-8">Your opportunity is live for review. It'll appear within 24 hours.</p>
        <button onClick={() => setSuccess(false)} className="clean-btn px-6 py-2.5">Submit Another</button>
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
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          Submit Opportunity
        </h2>
        <p className="text-gray-500 font-medium">Contribute verified opportunities to the network.</p>
      </header>

      {submitError ? <ErrorState title="Submission failed" description={submitError} /> : null}

      <form onSubmit={handleSubmit} className="clean-card bg-white p-8 space-y-6">
        
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Title <span className="text-red-500">*</span></label>
          <input required type="text" className="clean-input w-full p-3" placeholder="e.g. SDE Intern" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Organization / Host <span className="text-red-500">*</span></label>
            <input required type="text" className="clean-input w-full p-3" placeholder="e.g. Google" value={formData.org} onChange={e => setFormData({...formData, org: e.target.value})} />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Type <span className="text-red-500">*</span></label>
            <select className="clean-input w-full p-3" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              {['Internship', 'Hackathon', 'Scholarship', 'Job', 'Fellowship', 'Event', 'Program', 'Other'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Description <span className="text-red-500">*</span></label>
          <textarea required maxLength={500} rows={4} className="clean-input w-full p-3 resize-none" placeholder="Provide a brief description..." value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-4">Eligibility</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
               <label className="text-xs font-medium text-gray-500 uppercase">Year</label>
               <select className="clean-input w-full p-2.5 text-sm" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                 {['Any', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgrad'].map(y => <option key={y} value={y}>{y}</option>)}
               </select>
            </div>
            <div className="space-y-1">
               <label className="text-xs font-medium text-gray-500 uppercase">Field</label>
               <select className="clean-input w-full p-2.5 text-sm" value={formData.field} onChange={e => setFormData({...formData, field: e.target.value})}>
                 {['Any', 'Engineering', 'Science', 'Commerce', 'Arts', 'Law', 'Medicine', 'Design'].map(y => <option key={y} value={y}>{y}</option>)}
               </select>
            </div>
            <div className="space-y-1">
               <label className="text-xs font-medium text-gray-500 uppercase">Location</label>
               <input type="text" className="clean-input w-full p-2.5 text-sm" placeholder="e.g. Remote" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Application Link <span className="text-red-500">*</span></label>
            <input required type="url" className="clean-input w-full p-3" placeholder="https://..." value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Deadline</label>
            <input type="date" className="clean-input w-full p-3" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
          </div>
        </div>

        {(formData.type === 'Hackathon' || formData.type === 'Event' || formData.type === 'Program') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Start Date</label>
              <input type="date" className="clean-input w-full p-3" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">End Date</label>
              <input type="date" className="clean-input w-full p-3" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map(tag => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors border ${isTagSelected(tag) ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Contact Email</label>
            <input type="email" className="clean-input w-full p-3" placeholder="Optional" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
        </div>

        <div className="pt-6 mt-6 flex flex-col gap-6 border-t border-gray-100">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="mt-0.5 relative flex items-center justify-center">
              <input type="checkbox" className="peer w-5 h-5 appearance-none border-2 border-gray-300 rounded cursor-pointer checked:bg-blue-600 checked:border-blue-600 transition-colors" checked={formData.confirmed} onChange={e => setFormData({...formData, confirmed: e.target.checked})} />
              <Check className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">I confirm this is a legitimate, student-friendly opportunity.</span>
          </label>
          
          <button type="submit" disabled={!formData.confirmed || loading} className="clean-btn w-full md:w-auto px-10 py-3.5 flex justify-center items-center gap-2 font-bold shadow-md">
            {loading ? <><Loader2 className="animate-spin w-5 h-5" /> Submitting...</> : 'Submit Opportunity →'}
          </button>
        </div>

      </form>
    </div>
  );
}
