import React, { useEffect, useState } from 'react';
import { fetchTestimonialInbox, updateTestimonialStatus, highlightTestimonial } from '../../services/apiClient';
import { Testimonial } from '../../models/testimonialSchema';
import { Check, X, EyeOff, Star, StarOff, Loader2 } from 'lucide-react';

export default function TestimonialInbox() {
  const [received, setReceived] = useState<Testimonial[]>([]);
  const [given, setGiven] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');

  useEffect(() => {
    loadInbox();
  }, []);

  const loadInbox = async () => {
    setLoading(true);
    const data = await fetchTestimonialInbox();
    if (data && data.data) {
      setReceived(data.data.received || []);
      setGiven(data.data.given || []);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateTestimonialStatus(id, status);
      await loadInbox();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleHighlight = async (id: string, isHighlighted: boolean) => {
    try {
      await highlightTestimonial(id, isHighlighted);
      await loadInbox();
    } catch (e: any) {
      alert(e.message || "Failed to update highlight");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#b56b37]" /></div>;
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e8ded1] mt-8">
      <h3 className="text-xl font-serif font-bold text-[#231f20] mb-4">Testimonials Inbox</h3>
      
      <div className="flex gap-4 mb-6 border-b border-[#e8ded1] pb-2">
        <button 
          onClick={() => setActiveTab('received')}
          className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeTab === 'received' ? 'border-[#b56b37] text-[#b56b37]' : 'border-transparent text-[#8c7569]'}`}
        >
          Received ({received.length})
        </button>
        <button 
          onClick={() => setActiveTab('given')}
          className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeTab === 'given' ? 'border-[#b56b37] text-[#b56b37]' : 'border-transparent text-[#8c7569]'}`}
        >
          Given ({given.length})
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'received' ? (
          received.length === 0 ? <p className="text-sm text-[#8c7569]">No testimonials received yet.</p> :
          received.map(t => (
            <div key={t.id} className="p-4 bg-[#fcf9f2] rounded-xl border border-[#e8ded1]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-sm text-[#231f20]">{t.authorName || t.authorId}</p>
                  <p className="text-xs text-[#b56b37] capitalize">{t.relationship}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${t.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : t.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                    {t.status}
                  </span>
                  {t.status === 'approved' && (
                    <button onClick={() => handleHighlight(t.id!, !t.isHighlighted)} className="p-1 hover:bg-[#e8ded1] rounded-md transition-colors" title={t.isHighlighted ? "Remove highlight" : "Highlight (Pin)"}>
                      {t.isHighlighted ? <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> : <StarOff className="w-4 h-4 text-[#8c7569]" />}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-[#603620] mb-3">"{t.content}"</p>
              
              <div className="flex gap-2">
                {t.status === 'pending' && (
                  <>
                    <button onClick={() => handleStatusChange(t.id!, 'approved')} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100">
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => handleStatusChange(t.id!, 'rejected')} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100">
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}
                {t.status === 'approved' && (
                  <button onClick={() => handleStatusChange(t.id!, 'hidden')} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-100">
                    <EyeOff className="w-3.5 h-3.5" /> Hide
                  </button>
                )}
                {t.status === 'hidden' && (
                  <button onClick={() => handleStatusChange(t.id!, 'approved')} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100">
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          given.length === 0 ? <p className="text-sm text-[#8c7569]">No testimonials given yet.</p> :
          given.map(t => (
            <div key={t.id} className="p-4 bg-[#fcf9f2] rounded-xl border border-[#e8ded1]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-sm text-[#231f20]">To: {t.recipientId}</p>
                  <p className="text-xs text-[#b56b37] capitalize">{t.relationship}</p>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${t.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : t.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-sm text-[#603620]">"{t.content}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
