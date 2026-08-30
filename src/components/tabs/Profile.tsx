import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../../types';
import { ErrorState } from '../ui/states';
import { useAppContext } from '../../context/AppContext';
import ResumeVersionManager from './ResumeVersionManager';
import EndorsementHub from './EndorsementHub';
import TestimonialInbox from '../ui/TestimonialInbox';
import ExportCenter from './ExportCenter';

export default function Profile() {
  const { user, profile, setProfile } = useAppContext();
  const [formData, setFormData] = useState<UserProfile>(profile || {
    uid: user?.uid || '', name: user?.displayName || '', email: user?.email || '',
    college: '', year: '', field: '', city: '', state: '', country: '', phone: '',
    githubUrl: '', linkedinUrl: '', portfolioUrl: '', bio: '', avatarUrl: '', skills: [],
    avatarPublicId: '', resumeUrl: '', resumePublicId: '', coverLetterUrl: '', coverLetterPublicId: ''
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'resume' | 'cover_letter') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce client-side validation to ensure only .pdf, .png, and .jpeg are accepted.
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const allowed = ['.pdf', '.png', '.jpeg', '.jpg'];
    if (!allowed.includes(fileExt)) {
      alert("Unsupported file type. Only .pdf, .png, and .jpeg are allowed.");
      return;
    }

    if (type === 'avatar' && fileExt === '.pdf') {
      alert("Avatars must be an image (.png or .jpeg).");
      return;
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds the 10MB limit.");
      return;
    }

    if (!user) {
      alert("Authentication required.");
      return;
    }

    setUploadingType(type);
    try {
      const token = await user.getIdToken();
      
      let uploadData;

      try {
        // Step 1: Get signature from backend
        const sigRes = await fetch('/api/storage/signature', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ fileType: type, extension: fileExt })
        });

        if (!sigRes.ok) {
          throw new Error("Failed to generate upload signature");
        }

        const sigData = await sigRes.json();

        if (sigData.isDummy) {
          throw new Error("Cloudinary not configured on backend");
        }

        // Step 2: Upload directly to Cloudinary
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('api_key', sigData.apiKey);
        uploadFormData.append('timestamp', sigData.timestamp.toString());
        uploadFormData.append('signature', sigData.signature);
        uploadFormData.append('folder', sigData.folder);
        if (sigData.allowed_formats) {
          uploadFormData.append('allowed_formats', sigData.allowed_formats);
        }

        const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`;
        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          body: uploadFormData
        });

        if (!uploadRes.ok) {
          throw new Error("Cloudinary upload failed");
        }

        uploadData = await uploadRes.json();
      } catch (err: any) {
        console.warn("Cloudinary upload failed, attempting fallback.", err);
        
        if (import.meta.env.MODE === 'development') {
          console.log("Development mode: using local file upload fallback");
          const localFormData = new FormData();
          localFormData.append('file', file);
          const localUploadRes = await fetch('/api/storage/upload-local', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: localFormData
          });
          
          if (!localUploadRes.ok) {
            throw new Error("Local fallback upload failed");
          }
          uploadData = await localUploadRes.json();
        } else {
          if (type === 'avatar') {
            const fallbackSeed = user?.displayName || user?.email || 'user';
            uploadData = {
              secure_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fallbackSeed)}`,
              public_id: `fallback_${Date.now()}`
            };
            console.warn("Using DiceBear fallback avatar due to upload failure.");
          } else {
            throw new Error("File upload service is currently unavailable. Please try again later.");
          }
        }
      }

      // Step 3: Save metadata to MongoDB
      const saveRes = await fetch('/api/storage/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          url: uploadData.secure_url,
          publicId: uploadData.public_id
        })
      });

      if (!saveRes.ok) {
        const saveError = await saveRes.json().catch(() => ({}));
        throw new Error(saveError.error || "Failed to save upload metadata to profile");
      }

      const saveData = await saveRes.json();
      if (saveData.profile) {
        setProfile(saveData.profile);
        setFormData(saveData.profile);
        alert(`${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} uploaded successfully!`);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploadingType(null);
    }
  };

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

      // Synchronize changes to MongoDB backend
      try {
        const token = await user.getIdToken(true);
        await fetch("/api/v1/auth/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } catch (dbErr) {
        console.warn("MongoDB sync failed on profile save:", dbErr);
      }

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
    <div className="max-w-5xl mx-auto space-y-8 font-sans pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-surface p-6 md:p-8 rounded-2xl shadow-xs border border-border-theme">
        <div className="flex items-center gap-5">
          {formData.avatarUrl ? (
            <img 
              src={formData.avatarUrl.includes("cloudinary.com") ? formData.avatarUrl.replace("/upload/", "/upload/f_auto,q_auto,c_fill,w_200,h_200/") : formData.avatarUrl} 
              alt={`${formData.name || 'User'}'s profile picture`} 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-primary-blue shadow-sm"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[#603620] text-[#f3e4bd] flex items-center justify-center text-2xl font-serif font-bold shadow-xs">
              {formData.name?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-primary mb-1">
              {formData.name || 'Your Profile'}
            </h2>
            <p className="text-xs text-text-secondary font-medium">Manage your identity and academic parameters.</p>
            <div className="mt-3 flex items-center gap-3">
              <label className="cursor-pointer text-xs font-extrabold uppercase tracking-wider bg-surface-secondary hover:bg-primary-blue hover:text-white text-text-secondary px-3.5 py-1.5 rounded-xl border border-border-theme transition-all cursor-pointer">
                Upload Avatar
                <input 
                  type="file" 
                  accept="image/png, image/jpeg" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, 'avatar')} 
                />
              </label>
              {uploadingType === 'avatar' && <span className="text-xs text-primary-blue font-bold animate-pulse">Uploading...</span>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-background border border-border-theme rounded-2xl p-4 shrink-0">
           <div className="w-10 h-10 rounded-xl bg-[#603620] text-[#f3e4bd] flex items-center justify-center">
             <ShieldCheck className="w-5 h-5" />
           </div>
           <div>
             <div className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Profile Strength</div>
             <div className="font-serif font-bold text-2xl text-primary-blue leading-none mt-0.5">{calculateStrength()}%</div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {saveError ? <ErrorState title="Profile not saved" description={saveError} /> : null}
          <form onSubmit={handleSave} className="space-y-8 bg-surface p-6 md:p-8 rounded-2xl shadow-xs border border-border-theme">
            {/* Identity */}
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-text-primary border-b border-border-theme pb-3">Core Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-xs font-bold text-text-secondary">Full Name</label>
                   <input readOnly disabled value={formData.name} className="w-full bg-surface-secondary/50 border border-border-theme rounded-xl p-3 text-xs text-text-muted cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-text-secondary">Email Address</label>
                   <input readOnly disabled value={formData.email} className="w-full bg-surface-secondary/50 border border-border-theme rounded-xl p-3 text-xs text-text-muted cursor-not-allowed" />
                </div>
                <div className="space-y-1 md:col-span-2">
                   <label className="text-xs font-bold text-text-secondary">Phone (Optional)</label>
                   <input type="tel" placeholder="Phone" className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none focus:border-primary-blue" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Academic */}
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-text-primary border-b border-border-theme pb-3">Academic Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary">College / University</label>
                  <input type="text" placeholder="College Name" className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none focus:border-primary-blue" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary">Current Year</label>
                  <select className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none focus:border-primary-blue" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                    <option value="">Select Year</option>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Postgrad'].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-text-secondary">Field of Study</label>
                  <input type="text" placeholder="e.g. Computer Science and Engineering" className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none focus:border-primary-blue" value={formData.field} onChange={e => setFormData({...formData, field: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-text-primary border-b border-border-theme pb-3">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="City" className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none focus:border-primary-blue" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                <input type="text" placeholder="State" className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none focus:border-primary-blue" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                <input type="text" placeholder="Country" className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none focus:border-primary-blue" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
              </div>
            </div>

            {/* Links & Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-text-primary border-b border-border-theme pb-3">Loadout (Links & Skills)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="url" placeholder="GitHub URL" className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none focus:border-primary-blue" value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} />
                <input type="url" placeholder="LinkedIn URL" className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none focus:border-primary-blue" value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} />
                <input type="url" placeholder="Portfolio URL" className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none focus:border-primary-blue md:col-span-2" value={formData.portfolioUrl} onChange={e => setFormData({...formData, portfolioUrl: e.target.value})} />
              </div>
              
              <div className="pt-2 border-t border-border-theme">
                <ResumeVersionManager />
              </div>

              <div className="pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary block">Cover Letter (PDF, PNG, JPEG)</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer text-xs font-extrabold uppercase tracking-wider bg-surface-secondary hover:bg-primary-blue hover:text-white text-text-secondary px-4 py-3 rounded-xl border border-border-theme transition-all text-center flex-1">
                      {formData.coverLetterUrl ? "Change Cover Letter" : "Upload Cover Letter"}
                      <input 
                        type="file" 
                        accept=".pdf, image/png, image/jpeg" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'cover_letter')} 
                      />
                    </label>
                    {uploadingType === 'cover_letter' && <span className="text-xs text-primary-blue font-bold animate-pulse">Uploading...</span>}
                  </div>
                  {formData.coverLetterUrl && (
                    <a 
                      href={formData.coverLetterUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-bold text-primary-blue hover:underline flex items-center gap-1 mt-1"
                    >
                      View Uploaded Cover Letter <ExternalLink className="w-3.5 h-3.5 inline-block ml-0.5" />
                    </a>
                  )}
                </div>
              </div>
              
              <div className="pt-2">
                <label className="text-xs font-bold text-text-secondary mb-2 block">Technical Skills</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. React, Python, Marketing" 
                    className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none focus:border-primary-blue flex-1" 
                    value={skillInput} 
                    onChange={e => setSkillInput(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (skillInput.trim()) {
                          setFormData({...formData, skills: [...(formData.skills||[]), skillInput.trim()]});
                          setSkillInput('');
                        }
                      }
                    }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => { if(skillInput.trim()) { setFormData({...formData, skills: [...(formData.skills||[]), skillInput.trim()]}); setSkillInput(''); } }} 
                    className="bg-primary-blue hover:bg-[#603620] text-white px-5 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills?.map(s => (
                    <span key={s} className="px-3 py-1 font-bold text-xs bg-surface-secondary text-text-secondary rounded-full flex items-center gap-2 border border-border-theme">
                      {s}
                      <button type="button" onClick={() => setFormData({...formData, skills: formData.skills?.filter(x => x !== s)})} className="hover:text-red-600 bg-surface border border-border-theme rounded-full w-4 h-4 flex items-center justify-center leading-none text-xs">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1 pt-2">
                 <label className="text-xs font-bold text-text-secondary">Bio <span className="text-text-muted font-normal">(Max 200 chars)</span></label>
                 <textarea placeholder="Write a short summary..." maxLength={200} rows={3} className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none focus:border-primary-blue resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
              </div>
            </div>

            <div className="pt-4 border-t border-border-theme">
              <button 
                type="submit" 
                disabled={loading} 
                className="bg-primary-blue hover:bg-[#603620] text-white w-full px-8 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex justify-center items-center shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs space-y-4">
             <h3 className="text-lg font-serif font-bold text-text-primary border-b border-border-theme pb-3">Activity Log</h3>
             <p className="text-[10px] font-extrabold uppercase text-text-secondary tracking-wider">My Applications</p>
             <div className="space-y-3">
                {DUMMY_APPS.map(app => (
                  <div key={app.title} className="p-4 bg-background rounded-xl border border-border-theme">
                     <h4 className="font-serif font-bold text-xs text-text-primary truncate mb-2">{app.title}</h4>
                     <div className="flex justify-between items-center mt-2">
                       <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase border ${app.status==='Applied' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{app.status}</span>
                       <span className="text-[10px] font-bold text-text-muted flex items-center gap-1"><Calendar className="w-3 h-3" /> {app.date}</span>
                     </div>
                  </div>
                ))}
             </div>
             <button className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-extrabold text-primary-blue hover:text-text-secondary uppercase tracking-wider transition-colors cursor-pointer">View All Activity <ExternalLink className="w-3.5 h-3.5" /></button>
          </div>
           
           {/* Endorsements Section */}
           <EndorsementHub />

           {/* Testimonials Inbox Section */}
           <TestimonialInbox />
           
           {/* Export Center Section */}
           <ExportCenter />
        </div>
      </div>
    </div>
  );
}
