import React from 'react'; 
import { FileText, Sparkles, ArrowLeft } from 'lucide-react'; 
 
interface ResumeBuilderProps { 
  onBack?: () => void; 
} 
 
const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ onBack }) => { 
  return ( 
    <div className="min-h-full w-full flex items-center justify-center px-4 py-10"> 
      <div className="w-full max-w-3xl"> 
        <div className="relative overflow-hidden rounded-3xl border border-[#e8ded1] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl"> 
          {/* Decorative background */} 
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-100 dark:bg-blue-900/30 blur-3xl" /> 
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-purple-100 dark:bg-purple-900/30 blur-3xl" /> 
 
          <div className="relative px-6 py-12 sm:px-10 sm:py-16 text-center"> 
            {/* Icon */} 
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"> 
              <FileText className="h-10 w-10" /> 
            </div> 
 
            {/* Coming Soon badge */} 
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"> 
              <Sparkles className="h-4 w-4" /> 
              Coming Soon 
            </div> 
 
            {/* Heading */} 
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl"> 
              Resume Builder 
            </h1> 
 
            {/* Description */} 
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300 sm:text-lg"> 
              Create professional, job-ready resumes with ease. Our Resume 
              Builder is coming soon to help you showcase your skills, 
              experience, and achievements. 
            </p> 
 
            {/* CTA */} 
            <button 
              type="button" 
              onClick={onBack} 
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800" 
            > 
              <ArrowLeft className="h-4 w-4" /> 
              Back to Home 
            </button> 
 
            {/* Future feature hint */} 
            <p className="mt-6 text-xs text-gray-400 dark:text-gray-500"> 
              Stay tuned for the complete Resume Builder experience. 
            </p> 
          </div> 
        </div> 
      </div> 
    </div> 
  ); 
}; 
 
export default ResumeBuilder; 