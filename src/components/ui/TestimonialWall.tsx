import React, { useState, useEffect } from 'react';
import { fetchPublicTestimonials, createTestimonial } from '../../services/apiClient';
import { Testimonial } from '../../models/testimonialSchema';
import { Quote, Send, Loader2, Star } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface Props {
  targetUid: string;
}

export default function TestimonialWall({ targetUid }: Props) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [content, setContent] = useState('');
  const [relationship, setRelationship] = useState('peer');
  const { user } = useAppContext();

  useEffect(() => {
    loadTestimonials();
  }, [targetUid]);

  const loadTestimonials = async () => {
    setLoading(true);
    const data = await fetchPublicTestimonials(targetUid);
    if (data && data.data) {
      setTestimonials(data.data);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!content || content.length < 50) {
      return alert("Testimonial must be at least 50 characters.");
    }
    try {
      await createTestimonial({
        recipientId: targetUid,
        content,
        relationship,
        authorName: user?.displayName || user?.email || 'Anonymous'
      });
      alert("Testimonial submitted and pending approval!");
      setWriting(false);
      setContent('');
    } catch (e: any) {
      alert(e.message || "Failed to submit");
    }
  };

  if (loading) {
    return <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-blue" /></div>;
  }

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-serif font-bold text-text-primary dark:text-white flex items-center gap-2">
          <Quote className="w-6 h-6 text-primary-blue" />
          Testimonials
        </h3>
        {user && user.uid !== targetUid && !writing && (
          <button 
            onClick={() => setWriting(true)}
            className="text-xs font-bold px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-[#603620] transition-colors"
          >
            Write Testimonial
          </button>
        )}
      </div>

      {writing && (
        <div className="bg-background dark:bg-gray-800 p-5 rounded-2xl border border-border-theme dark:border-gray-700 mb-8">
          <h4 className="font-bold text-sm mb-3 dark:text-white">Write a recommendation</h4>
          <select 
            value={relationship} 
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full mb-3 bg-surface dark:bg-gray-900 border border-border-theme dark:border-gray-700 rounded-lg p-2 text-sm dark:text-white"
          >
            <option value="peer">Peer / Classmate</option>
            <option value="teammate">Project Teammate</option>
            <option value="mentor">Mentor</option>
            <option value="mentee">Mentee</option>
            <option value="manager">Manager / Supervisor</option>
          </select>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your testimonial here (min 50 chars)..."
            className="w-full h-24 mb-3 bg-surface dark:bg-gray-900 border border-border-theme dark:border-gray-700 rounded-lg p-3 text-sm resize-none dark:text-white"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setWriting(false)} className="px-4 py-2 text-xs font-bold text-text-muted hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 text-xs font-bold bg-primary-blue text-white rounded-lg flex items-center gap-1 hover:bg-[#603620] transition-colors">
              <Send className="w-3.5 h-3.5" /> Submit
            </button>
          </div>
        </div>
      )}

      {testimonials.length === 0 ? (
        <div className="text-center py-10 bg-background dark:bg-gray-800/50 rounded-3xl border border-dashed border-border-theme dark:border-gray-700">
          <p className="text-sm text-text-muted dark:text-gray-400">No testimonials yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map(t => (
            <div key={t.id} className={`p-5 rounded-2xl border ${t.isHighlighted ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30' : 'bg-surface dark:bg-gray-800 border-border-theme dark:border-gray-700'} shadow-sm`}>
              {t.isHighlighted && <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 mb-2 uppercase tracking-wider"><Star className="w-3 h-3 fill-amber-500" /> Highlighted</div>}
              <p className="text-sm text-text-secondary dark:text-gray-300 italic mb-4">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-secondary dark:bg-gray-700 flex items-center justify-center font-bold text-primary-blue">
                  {(t.authorName || 'U')[0]}
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary dark:text-white">{t.authorName || 'Anonymous'}</p>
                  <p className="text-[10px] text-text-muted dark:text-gray-400 capitalize">{t.relationship}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
