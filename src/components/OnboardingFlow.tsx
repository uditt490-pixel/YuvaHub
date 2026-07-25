import React, { useState, useEffect } from 'react';
import { Target, Loader2, User, BookOpen, CheckCircle, Sparkles } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

const STORAGE_KEY = 'yuvahub_onboarding_step';

interface OnboardingProps {
  user: any;
  profile: UserProfile | null;
  onComplete: (updatedProfile: UserProfile) => void;
}

export default function OnboardingFlow({ user, profile, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    college: profile?.college || '',
    year: profile?.year || '',
    field: profile?.field || '',
    interests: profile?.skills || [],
  });

  const [interestInput, setInterestInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(step));
    } catch {}
  }, [step]);

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.college.trim()) errors.college = 'College/University is required';
    if (!formData.year) errors.year = 'Year of study is required';
    if (!formData.field.trim()) errors.field = 'Field of study is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (formData.interests.length === 0) errors.interests = 'Add at least one interest';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(step + 1);
      setValidationErrors({});
    }
  };

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
    if (!validateStep2()) return;
    setStep(4); // AI Generation step
    
    // Simulate AI generation delay for effect
    setTimeout(async () => {
      try {
        const updatedProfile = {
          ...profile,
          uid: user.uid,
          name: profile?.name || user.displayName || '',
          email: profile?.email || user.email || '',
          college: formData.college,
          year: formData.year,
          field: formData.field,
          skills: formData.interests,
          onboarded: true
        };

        // Write to Firestore
        await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });

        // Write to MongoDB
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

        onComplete(updatedProfile);
      } catch (error) {
        console.error("Error saving profile", error);
        setStep(3); // Go back on error
      }
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            <span className="text-gray-900">Yuva</span><span className="text-blue-600">Hub</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-6">
             <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-100'}`} />
             <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-100'}`} />
             <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-100'}`} />
             <div className={`h-2 flex-1 rounded-full ${step >= 4 ? 'bg-blue-600' : 'bg-gray-100'}`} />
          </div>
        </div>

        {step === 1 && (
          <div className="clean-card p-10 animate-fade-in">
            <div className="flex justify-center mb-6">
               <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <User className="w-8 h-8" />
               </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Profile Setup</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College/University</label>
                <input 
                  type="text" 
                  className={`clean-input w-full p-3 ${validationErrors.college ? 'border-red-500' : ''}`}
                  value={formData.college}
                  onChange={(e) => setFormData({...formData, college: e.target.value})}
                  placeholder="e.g. IIT Bombay"
                />
                {validationErrors.college && <p className="text-red-500 text-xs mt-1">{validationErrors.college}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                  <select 
                    className={`clean-input w-full p-3 ${validationErrors.year ? 'border-red-500' : ''}`}
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
                  {validationErrors.year && <p className="text-red-500 text-xs mt-1">{validationErrors.year}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                  <input 
                    type="text" 
                    className={`clean-input w-full p-3 ${validationErrors.field ? 'border-red-500' : ''}`}
                    value={formData.field}
                    onChange={(e) => setFormData({...formData, field: e.target.value})}
                    placeholder="e.g. Computer Science"
                  />
                  {validationErrors.field && <p className="text-red-500 text-xs mt-1">{validationErrors.field}</p>}
                </div>
              </div>
            </div>
            <button 
              onClick={handleNext}
              className="clean-btn w-full p-4 mt-8"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="clean-card p-10 animate-fade-in">
             <div className="flex justify-center mb-6">
               <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Target className="w-8 h-8" />
               </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Select Interests</h2>
            <p className="text-gray-500 text-center mb-8">What are you looking for?</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Add Skills & Interests (Press Enter)</label>
                <input 
                  type="text" 
                  className="clean-input w-full p-3" 
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={handleAddInterest}
                  placeholder="e.g. AI, Hackathons, Web Dev, Marketing..."
                />
              </div>
               <div className={`flex flex-wrap gap-2 min-h-16 border rounded-lg p-4 bg-gray-50 ${validationErrors.interests ? 'border-red-500' : 'border-gray-200'}`}>
                  {formData.interests.length === 0 && <span className="text-sm text-gray-400">No interests added yet.</span>}
                  {formData.interests.map((interest: string) => (
                    <span key={interest} className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1 shadow-sm">
                      {interest}
                      <button onClick={() => handleRemoveInterest(interest)} className="text-gray-400 hover:text-red-500 rounded-full w-4 h-4 flex items-center justify-center ml-1">&times;</button>
                    </span>
                  ))}
               </div>
               {validationErrors.interests && <p className="text-red-500 text-xs mt-1">{validationErrors.interests}</p>}
             </div>
             <div className="flex gap-4 mt-8">
                <button onClick={() => setStep(1)} className="clean-btn-outline px-6 py-4">Back</button>
                <button onClick={handleFinish} className="clean-btn flex-1 py-4">Generate Profile</button>
             </div>
          </div>
        )}

        {step === 4 && (
          <div className="clean-card p-12 flex flex-col items-center justify-center text-center animate-fade-in min-h-[400px]">
            <Sparkles className="w-16 h-16 text-blue-600 animate-pulse mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Profile Generation</h2>
            <p className="text-gray-500 max-w-md">Our AI is analyzing your background and configuring your personalized intelligence feed...</p>
            <div className="w-48 h-2 bg-gray-100 rounded-full mt-8 overflow-hidden">
               <div className="h-full bg-blue-600 animate-[pulse_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
