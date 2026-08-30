import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, Heart, Zap, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function Support() {
  const { setActiveTab } = useAppContext();
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.email && formState.message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans pb-20 selection:bg-[#f3e4bd] selection:text-text-secondary">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-4 pt-10 pb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f3e4bd] border border-border-theme text-text-secondary text-xs font-bold uppercase tracking-widest rounded-full">
          <Heart className="w-3.5 h-3.5 text-primary-blue" /> Student Support Desk
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight text-text-primary">
          Get in Touch with <span className="italic text-primary-blue">YuvaHub</span>
        </h1>
        <p className="text-sm text-text-secondary max-w-xl mx-auto">
          Have questions about listings, account access, or AI tools? Send us a message and our team will assist you promptly.
        </p>
      </div>

      {/* Support Form Container */}
      <div className="max-w-2xl mx-auto bg-surface p-8 sm:p-10 rounded-3xl border border-border-theme shadow-md space-y-6">
        {submitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#63703d]/10 text-[#63703d] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-[#63703d]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-text-primary">Message Sent Successfully!</h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Thank you for contacting YuvaHub support. A ticket confirmation has been sent to your email.
            </p>
            <button
              onClick={() => { setSubmitted(false); setFormState({ name: '', email: '', message: '' }); }}
              className="px-6 py-2.5 bg-[#603620] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary-blue transition-all cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Your Name</label>
              <input 
                type="text"
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="Enter your full name"
                className="w-full text-xs px-4 py-3 bg-background border border-border-theme rounded-xl text-text-primary outline-none focus:border-primary-blue"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Email Address</label>
              <input 
                type="email"
                required
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                placeholder="Enter your student email"
                className="w-full text-xs px-4 py-3 bg-background border border-border-theme rounded-xl text-text-primary outline-none focus:border-primary-blue"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Message / Query</label>
              <textarea 
                rows={4}
                required
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                placeholder="How can we help you?"
                className="w-full text-xs px-4 py-3 bg-background border border-border-theme rounded-xl text-text-primary outline-none focus:border-primary-blue resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-primary-blue hover:bg-[#603620] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              Submit Ticket <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
