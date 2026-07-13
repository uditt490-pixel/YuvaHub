import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../../types';
import { ErrorState } from '../ui/states';

export default function Profile({ user, profile, setProfile }: { user: any, profile: UserProfile | null, setProfile: (p: UserProfile) => void }) {
  const [formData, setFormData] = useState<UserProfile>(profile || {
    uid: user?.uid || '', name: user?.displayName || '', email: user?.email || '',
    college: '', year: '', field: '', city: '', state: '', country: '', phone: '',
    githubUrl: '', linkedinUrl: '', portfolioUrl: '', bio: '', avatarUrl: '', skills: []
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const calculateStrength = () => {
    const fields = ['name', 'email', 'college', 'year', 'field', 'city', 'country', 'githubUrl', 'linkedinUrl', 'bio'];
    let filled = 0;
    fields.forEach(f => {
      // @ts-ignore
      if (formData[f] && formData[f].length > 0) filled++;
    });
    if (formData.skills && formData.skills.length > 0) filled++;
    return Math.round((filled / (fields.length + 1)) * 100);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Auth required.");
    if (loading) return;
    setLoading(true);
    setSaveError(null);
    try {
      await setDoc(doc(db, 'users', user.uid), formData, { merge: true });
      setProfile(formData);
      alert("Profile updated successfully.");
    } catch {
      setSaveError('Unable to save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const DUMMY_APPS = [
    { title: 'Google Summer of Code', status: 'Applied', date: 'Oct 14' },
    { title: 'Frontend Intern @ Vercel', status: 'Interested', date: 'Oct 12' }
  ];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to View Profile</h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-3xl font-bold">
            {formData.name?.charAt(0) || user?.displayName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              {formData.name || 'Your Profile'}
            </h2>
            <p className="text-gray-500 font-medium">Manage your identity and parameters.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
           <ShieldCheck className="w-8 h-8 text-blue-600" />
           <div>
             <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Profile Strength</div>
             <div className="font-bold text-2xl text-blue-600 leading-none mt-1">{calculateStrength()}%</div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {saveError ? <ErrorState title="Profile not saved" description={saveError} /> : null}
          <form onSubmit={handleSave} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            {/* Identity */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Core Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                   <label className="text-sm font-semibold text-gray-700">Full Name</label>
                   <input readOnly disabled value={formData.name} className="clean-input p-3 bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                   <label className="text-sm font-semibold text-gray-700">Email Address</label>
                   <input readOnly disabled value={formData.email} className="clean-input p-3 bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                   <label className="text-sm font-semibold text-gray-700">Phone (Optional)</label>
                   <input type="tel" placeholder="Phone" className="clean-input p-3" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Academic */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Academic Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">College / University</label>
                  <input type="text" placeholder="College Name" className="clean-input p-3" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Current Year</label>
                  <select className="clean-input w-full p-3" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                    <option value="">Select Year</option>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Postgrad'].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Field of Study</label>
                  <input type="text" placeholder="e.g. Computer Science and Engineering" className="clean-input p-3" value={formData.field} onChange={e => setFormData({...formData, field: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <input type="text" placeholder="City" className="clean-input p-3" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                <input type="text" placeholder="State" className="clean-input p-3" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                <input type="text" placeholder="Country" className="clean-input p-3" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
              </div>
            </div>

            {/* Links & Skills */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Loadout (Links & Skills)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input type="url" placeholder="GitHub URL" className="clean-input p-3" value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} />
                <input type="url" placeholder="LinkedIn URL" className="clean-input p-3" value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} />
                <input type="url" placeholder="Portfolio URL" className="clean-input p-3 md:col-span-2" value={formData.portfolioUrl} onChange={e => setFormData({...formData, portfolioUrl: e.target.value})} />
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Technical Skills</label>
                <div className="flex gap-3">
                  <input type="text" placeholder="e.g. React, Python, Marketing" className="clean-input p-3 flex-1" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (skillInput.trim()) {
                        setFormData({...formData, skills: [...(formData.skills||[]), skillInput.trim()]});
                        setSkillInput('');
                      }
                    }
                  }} />
                  <button type="button" onClick={() => { if(skillInput.trim()) { setFormData({...formData, skills: [...(formData.skills||[]), skillInput.trim()]}); setSkillInput(''); } }} className="clean-btn px-6 py-3">Add Note</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.skills?.map(s => (
                    <span key={s} className="px-3 py-1 font-medium text-sm bg-blue-50 text-blue-700 rounded-full flex items-center gap-2 border border-blue-100">
                      {s}
                      <button type="button" onClick={() => setFormData({...formData, skills: formData.skills?.filter(x => x !== s)})} className="hover:text-blue-900 bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center leading-none">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1">
                 <label className="text-sm font-semibold text-gray-700">Bio <span className="text-gray-400 font-normal">(Max 200 chars)</span></label>
                 <textarea placeholder="Write a short summary..." maxLength={200} rows={3} className="clean-input p-3 w-full resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button type="submit" disabled={loading} className="clean-btn w-full px-8 py-3.5 flex justify-center items-center shadow-md">
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="clean-card p-6 sticky top-24">
             <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Activity Log</h3>
             <p className="text-xs font-semibold uppercase text-gray-500 mb-4 tracking-wider">My Applications</p>
             <div className="space-y-4">
               {DUMMY_APPS.map(app => (
                 <div key={app.title} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <h4 className="font-semibold text-gray-900 truncate mb-2">{app.title}</h4>
                    <div className="flex justify-between items-center mt-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${app.status==='Applied' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{app.status}</span>
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {app.date}</span>
                    </div>
                 </div>
               ))}
             </div>
             <button className="w-full mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">View All Activity <ExternalLink className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
