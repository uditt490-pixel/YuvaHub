import React, { useState } from 'react';
import UploadStep from './UploadStep';
import ExperienceStep from './ExperienceStep';
import ReviewStep from './ReviewStep';

// Define the steps of the wizard
const steps = [
  { id: 'upload', label: 'Upload Existing Resume' },
  { id: 'experience', label: 'Work Experience & Projects' },
  { id: 'review', label: 'Review & Export' },
];

const Wizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<string>('upload');
  const [resumeData, setResumeData] = useState<any>(null);

  const next = () => {
    const idx = steps.findIndex((s) => s.id === currentStep);
    if (idx < steps.length - 1) setCurrentStep(steps[idx + 1].id);
  };

  const prev = () => {
    const idx = steps.findIndex((s) => s.id === currentStep);
    if (idx > 0) setCurrentStep(steps[idx - 1].id);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'upload':
        return <UploadStep onData={(data) => { setResumeData(data); next(); }} />;
      case 'experience':
        return (
          <ExperienceStep
            resumeData={resumeData}
            onNext={next}
            onPrev={prev}
            onUpdate={(updated) => setResumeData(updated)}
          />
        );
      case 'review':
        return <ReviewStep resumeData={resumeData} onPrev={prev} />;
      default:
        return null;
    }
  };

  return (
    <div className="wizard-container p-6 max-w-4xl mx-auto bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-xl shadow-lg backdrop-filter backdrop-blur-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Resume Builder Wizard</h1>
      <div className="stepper flex justify-center mb-8 space-x-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${step.id === currentStep ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} `}
          >
            {step.label}
          </div>
        ))}
      </div>
      {renderStep()}
    </div>
  );
};

export default Wizard;
