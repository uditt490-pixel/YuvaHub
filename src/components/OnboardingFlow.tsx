import React, { useState } from 'react';
import { Target, Loader2, User, BookOpen, CheckCircle, Sparkles, Zap } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

interface OnboardingProps {
  user: any;
  profile: UserProfile | null;
  onComplete: (updatedProfile: UserProfile) => void;
}

export default function OnboardingFlow({ user, profile, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    college: profile?.college || '',
    year: profile?.year || '',
    field: profile?.field || '',
    interests: profile?.skills || [],
  });

  const [interestInput, setInterestInput] = useState('');

  const handleNext = () => setStep(step + 1);

  const handleAddInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && interestInput.trim() !== '') {
      e.preventDefault();
      if (!formData.interests.includes(interestInput.trim())) {
        setFormData({ ...formData, interests: [...formData.interests, interestInput.trim()] });
      }
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
  };

  const handleFinish = async () => {
    setStep(4); // AI Generation step
    
    const updatedProfile: UserProfile = {
      ...profile,
      uid: user.uid,
      name: profile?.name || user.displayName || user.email?.split('@')[0] || 'User',
      email: profile?.email || user.email || '',
      college: formData.college,
      year: formData.year,
      field: formData.field,
      skills: formData.interests,
      onboarded: true
    };

    // Save to localStorage immediately so user never sees onboarding again on login
    if (user?.uid) {
      try {
        localStorage.setItem(`yuvahub-onboarded-${user.uid}`, 'true');
      } catch (e) {
        console.warn('Could not save onboarded state to localStorage', e);
      }
    }

    setTimeout(async () => {
      // 1. Write to Firestore with timeout
      try {
        const firestorePromise = setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 2000));
        await Promise.race([firestorePromise, timeoutPromise]);
      } catch (fsErr) {
        console.warn("Firestore save skipped or failed during onboarding:", fsErr);
      }

      // 2. Write to MongoDB
      try {
        const token = await user.getIdToken(true);
        await fetch("/api/v1/auth/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(updatedProfile)
        });
      } catch (dbErr) {
        console.warn("MongoDB sync failed on onboarding completion:", dbErr);
      }

      // 3. Always complete onboarding in UI state
      onComplete(updatedProfile);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-[#fcf9f2] z-[100] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-[#603620] flex items-center justify-center shadow-md">
              <Zap className="w-4 h-4 text-[#f3e4bd]" />
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-[#231f20]">
              Yuva<span className="text-[#b56b37] italic">Hub</span>
            </h1>
          </div>
          <p className="text-xs uppercase tracking-widest font-extrabold text-[#603620]">Student Profile Onboarding</p>
          <div className="flex items-center justify-center gap-2 mt-6">
             <div className={`h-2 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-[#b56b37]' : 'bg-[#e8ded1]'}`} />
             <div className={`h-2 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-[#b56b37]' : 'bg-[#e8ded1]'}`} />
             <div className={`h-2 flex-1 rounded-full transition-all ${step >= 3 ? 'bg-[#b56b37]' : 'bg-[#e8ded1]'}`} />
             <div className={`h-2 flex-1 rounded-full transition-all ${step >= 4 ? 'bg-[#b56b37]' : 'bg-[#e8ded1]'}`} />
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white border border-[#e8ded1] rounded-2xl p-8 shadow-sm animate-fade-in">
            <div className="flex justify-center mb-6">
               <div className="w-16 h-16 rounded-full bg-[#f6efe2] flex items-center justify-center text-[#b56b37]">
                  <User className="w-8 h-8 text-[#b56b37]" />
               </div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-center text-[#231f20] mb-6">Profile Setup</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#603620] mb-1">College / University</label>
                <input 
                  type="text" 
                  className="w-full bg-[#fcf9f2] border border-[#e8ded1] rounded-xl p-3 text-sm text-[#231f20] focus:ring-2 focus:ring-[#b56b37]/20 focus:border-[#b56b37] outline-none transition-all" 
                  value={formData.college}
                  onChange={(e) => setFormData({...formData, college: e.target.value})}
                  placeholder="e.g. GEHU Bhimtal / IIT Bombay"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#603620] mb-1">Year of Study</label>
                  <select 
                    className="w-full bg-[#fcf9f2] border border-[#e8ded1] rounded-xl p-3 text-sm text-[#231f20] focus:ring-2 focus:ring-[#b56b37]/20 focus:border-[#b56b37] outline-none transition-all cursor-pointer"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                  >
                    <option value="">Select Year</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                    <option value="5th">5th Year</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#603620] mb-1">Field of Study</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#fcf9f2] border border-[#e8ded1] rounded-xl p-3 text-sm text-[#231f20] focus:ring-2 focus:ring-[#b56b37]/20 focus:border-[#b56b37] outline-none transition-all" 
                    value={formData.field}
                    onChange={(e) => setFormData({...formData, field: e.target.value})}
                    placeholder="e.g. Computer Science"
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={handleNext}
              disabled={!formData.college || !formData.year || !formData.field}
              className="w-full py-3.5 mt-8 text-xs font-extrabold uppercase tracking-wider bg-[#b56b37] hover:bg-[#603620] text-white rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-[#e8ded1] rounded-2xl p-8 shadow-sm animate-fade-in">
             <div className="flex justify-center mb-6">
               <div className="w-16 h-16 rounded-full bg-[#f6efe2] flex items-center justify-center text-[#b56b37]">
                  <Target className="w-8 h-8 text-[#b56b37]" />
               </div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-center text-[#231f20] mb-1">Select Interests & Skills</h2>
            <p className="text-xs text-[#8c7569] text-center mb-6">Personalize your opportunity feed & AI recommendations</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#603620] mb-1">Add Skills & Interests (Press Enter)</label>
                <input 
                  type="text" 
                  className="w-full bg-[#fcf9f2] border border-[#e8ded1] rounded-xl p-3 text-sm text-[#231f20] focus:ring-2 focus:ring-[#b56b37]/20 focus:border-[#b56b37] outline-none transition-all" 
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={handleAddInterest}
                  placeholder="e.g. AI, Web Dev, Python, Hackathons..."
                />
              </div>
              <div className="flex flex-wrap gap-2 min-h-16 border rounded-xl p-4 bg-[#fcf9f2] border-[#e8ded1]">
                 {formData.interests.length === 0 && <span className="text-xs text-[#8c7569]">No interests added yet. Type above and press Enter.</span>}
                 {formData.interests.map((interest: string) => (
                   <span key={interest} className="px-3 py-1 bg-white border border-[#e8ded1] text-[#603620] rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                     {interest}
                     <button onClick={() => handleRemoveInterest(interest)} className="text-[#8c7569] hover:text-red-600 rounded-full w-4 h-4 flex items-center justify-center ml-0.5">&times;</button>
                   </span>
                 ))}
              </div>
            </div>
            <div className="flex gap-3 mt-8">
               <button onClick={() => setStep(1)} className="px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider bg-white text-[#603620] border border-[#e8ded1] hover:bg-[#f6efe2] rounded-xl transition-all cursor-pointer">Back</button>
               <button onClick={handleFinish} className="flex-1 py-3.5 text-xs font-extrabold uppercase tracking-wider bg-[#b56b37] hover:bg-[#603620] text-white rounded-xl shadow-md transition-all cursor-pointer">Generate Profile</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white border border-[#e8ded1] rounded-2xl p-12 flex flex-col items-center justify-center text-center animate-fade-in min-h-[380px] shadow-sm">
            <Sparkles className="w-16 h-16 text-[#b56b37] animate-pulse mb-6" />
            <h2 className="text-2xl font-serif font-bold text-[#231f20] mb-3">AI Profile Configuration</h2>
            <p className="text-xs text-[#8c7569] max-w-md">Our AI engine is matching your background with live hackathons, internships & grant opportunities...</p>
            <div className="w-48 h-2 bg-[#e8ded1] rounded-full mt-8 overflow-hidden">
               <div className="h-full bg-[#b56b37] animate-[pulse_1.5s_ease-in-out_infinite]" style={{ width: '70%' }} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
