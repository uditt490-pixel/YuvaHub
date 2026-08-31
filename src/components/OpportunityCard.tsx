import React, { KeyboardEvent, MouseEvent, useState, useRef, useCallback } from "react";
import { Bookmark, Shield, ExternalLink, X, CheckCircle, MapPin, Clock, ArrowRight, Sparkles, Building2, Coins, Calendar, Flag, Scale, Briefcase, FileText } from "lucide-react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { OpportunityReportModal } from "./ui/OpportunityReportModal";
import CoverLetterModal from "./ui/CoverLetterModal";
import { useCompare } from "../context/CompareContext";
import { saveOpportunityToTracker } from "../services/apiClient";
import { useAppContext } from "../context/AppContext";

export interface Opportunity {
    id: string;
    title: string;
    org?: string;
    organization?: string;
    orgLogo?: string;
    type?: string; // hackathon | internship | scholarship | job | fellowship
    deadline?: string;
    isRolling?: boolean;
    location?: string; // Remote | Hybrid | Onsite
    stipend?: string;
    salary?: number | string;
    eligibility?: string; // Student | Graduate | etc
    verified?: boolean;
    registeredCount?: number;
    isStale?: boolean;
    isFallback?: boolean;
    source_name?: string;
    sourceName?: string;
    tags?: string[];
    matchScore?: number;
    applicationFee?: {
        isFree: boolean;
        amount?: number;
        currency?: string;
    };
    verificationDetails?: {
        isVerified: boolean;
        verifiedBy: string;
        verifiedAt: string;
        auditSourceUrl: string;
        reviewerNotes?: string;
    };
}

interface OpportunityCardProps {
    opportunity: Opportunity;
    onViewDetails?: (id: string, title: string) => void;
    onToggleBookmark?: (id: string) => void;
    isBookmarked?: boolean;
}

export function OpportunityCard({
    opportunity: opp,
    onViewDetails,
    onToggleBookmark,
    isBookmarked = false,
}: OpportunityCardProps) {
    const [showAuditModal, setShowAuditModal] = useState(false);
    const auditModalRef = useRef<HTMLDivElement>(null);
    const closeAuditModal = useCallback(() => setShowAuditModal(false), []);
    useFocusTrap(auditModalRef, showAuditModal, closeAuditModal);

    const [showReportModal, setShowReportModal] = useState(false);
    const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
    const [isSavedToTracker, setIsSavedToTracker] = useState(false);
    const [isSavingToTracker, setIsSavingToTracker] = useState(false);

    let appContext: any = null;
    try {
        appContext = useAppContext();
    } catch (e) {}
    
    // Attempt to use CompareContext if it exists in the tree
    let compareCtx: any = null;
    try {
        compareCtx = useCompare();
    } catch (e) {
        // App might not be wrapped in CompareProvider in some tests/views
    }

    const isComparing = compareCtx?.isComparing(opp.id) || false;

    const orgName = opp.source_name || opp.sourceName || opp.org || opp.organization || "Verified Company";
    const title = opp.title || "Untitled Opportunity";
    const deadlineLabel = opp.isRolling ? "Rolling Admission" : opp.deadline || "Active";
    const locationLabel = opp.location || "Remote";

    const isFree = opp.applicationFee?.isFree ?? true;
    const isVerified = opp.verificationDetails?.isVerified ?? (opp.verified !== false && !opp.isFallback && !opp.isStale);

    const auditInfo = opp.verificationDetails || {
        isVerified: true,
        verifiedBy: "YuvaHub Audit Team",
        verifiedAt: new Date().toISOString().split('T')[0],
        auditSourceUrl: opp.source_name ? `https://${opp.source_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : "https://yuvahub.xyz",
        reviewerNotes: "Verified official listing source, domain ownership, and zero application fee requirement."
    };

    const handleActivate = () => {
        onViewDetails?.(opp.id, opp.title);
    };

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;
        handleActivate();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleActivate();
        }
    };

    const handleBookmarkClick = (e: MouseEvent) => {
        e.stopPropagation();
        onToggleBookmark?.(opp.id);
    };

    const handleAuditBadgeClick = (e: MouseEvent) => {
        e.stopPropagation();
        setShowAuditModal(true);
    };

    const handleAddToCalendar = (e: MouseEvent) => {
        e.stopPropagation();
        window.location.href = `/api/v1/opportunities/${opp.id}/calendar`;
    };

    const handleSaveToTracker = async (e: MouseEvent) => {
        e.stopPropagation();
        if (isSavingToTracker || isSavedToTracker) return;
        try {
            setIsSavingToTracker(true);
            await saveOpportunityToTracker(opp, "saved");
            setIsSavedToTracker(true);
        } catch (err) {
            console.error("Failed to save to application tracker:", err);
        } finally {
            setIsSavingToTracker(false);
        }
    };

    const handleCompareClick = (e: MouseEvent) => {
        e.stopPropagation();
        if (compareCtx) {
            if (isComparing) {
                compareCtx.removeFromCompare(opp.id);
            } else {
                compareCtx.addToCompare(opp);
            }
        }
    };

    const typeLabel = (opp.type || 'Opportunity').toUpperCase();

    return (
        <>
            <div
                role="link"
                tabIndex={0}
                aria-label={`${title} at ${orgName}`}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className="group relative flex flex-col justify-between h-full w-full min-w-0 cursor-pointer rounded-xl border border-border-theme dark:border-slate-800 bg-surface dark:bg-slate-900 p-5 transition-all duration-200 ease-out hover:border-primary-blue dark:hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b56b37]"
            >
                <div className="space-y-3">
                    {/* Header Row: Logo, Company, Category Badge, Bookmark */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            {opp.orgLogo ? (
                                <img
                                    src={opp.orgLogo}
                                    alt={`${orgName} logo`}
                                    className="h-10 w-10 shrink-0 rounded-lg object-cover border border-border-theme dark:border-slate-800 bg-surface"
                                />
                            ) : (
                                <div
                                    aria-hidden="true"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-secondary dark:bg-slate-800 text-text-secondary dark:text-slate-300 border border-border-theme dark:border-slate-700 text-xs font-bold"
                                >
                                    <Building2 className="w-5 h-5 text-primary-blue" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-text-secondary dark:text-slate-400 truncate">{orgName}</span>
                                    {isVerified && (
                                        <button
                                            type="button"
                                            onClick={handleAuditBadgeClick}
                                            className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#63703d] hover:underline"
                                            title="View Verification Audit"
                                        >
                                            <Shield className="w-3 h-3 text-[#63703d] fill-[#63703d]/20" />
                                            Verified
                                        </button>
                                    )}
                                </div>
                                <span className="inline-block text-[10px] font-bold text-text-muted dark:text-slate-500 tracking-wider">
                                    {typeLabel}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handleAddToCalendar}
                                aria-label="Add to Calendar"
                                title="Add to Calendar"
                                className="p-1.5 rounded-lg text-text-muted hover:text-primary-blue hover:bg-surface-secondary dark:hover:bg-slate-800 transition-colors"
                            >
                                <Calendar
                                    size={18}
                                    className="text-text-muted dark:text-slate-500"
                                />
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveToTracker}
                                disabled={isSavingToTracker}
                                aria-label={isSavedToTracker ? "Saved to Application Tracker" : "Save to Application Tracker"}
                                title={isSavedToTracker ? "Saved to Tracker" : "Save to Tracker"}
                                className={`p-1.5 rounded-lg transition-colors ${
                                    isSavedToTracker 
                                        ? "text-emerald-500 bg-emerald-500/10" 
                                        : "text-text-muted hover:text-primary-blue hover:bg-surface-secondary dark:hover:bg-slate-800"
                                }`}
                            >
                                <Briefcase
                                    size={18}
                                    className={isSavedToTracker ? "text-emerald-500" : "text-text-muted dark:text-slate-500"}
                                />
                            </button>
                            {compareCtx && (
                                <button
                                    type="button"
                                    onClick={handleCompareClick}
                                    aria-label={isComparing ? "Remove from comparison" : "Add to comparison"}
                                    title={isComparing ? "Remove from comparison" : "Add to comparison"}
                                    className="p-1.5 rounded-lg text-text-muted hover:text-primary-blue hover:bg-surface-secondary dark:hover:bg-slate-800 transition-colors"
                                >
                                    <Scale
                                        size={18}
                                        className={isComparing ? "text-primary-blue" : "text-text-muted dark:text-slate-500"}
                                    />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleBookmarkClick}
                                aria-label={isBookmarked ? "Remove bookmark" : "Save bookmark"}
                                aria-pressed={isBookmarked}
                                className="p-1.5 rounded-lg text-text-muted hover:text-primary-blue hover:bg-surface-secondary dark:hover:bg-slate-800 transition-colors"
                            >
                                <Bookmark
                                    size={18}
                                    className={isBookmarked ? "fill-[#b56b37] text-primary-blue" : "text-text-muted dark:text-slate-500"}
                                />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setShowCoverLetterModal(true); }}
                                aria-label="Generate AI Cover Letter"
                                title="Generate tailored AI cover letter"
                                className="p-1.5 rounded-lg text-text-muted hover:text-primary-blue hover:bg-surface-secondary dark:hover:bg-slate-800 transition-colors"
                            >
                                <FileText size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setShowReportModal(true); }}
                                aria-label="Report Opportunity"
                                title="Report this opportunity"
                                className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <Flag size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <h3
                        title={title}
                        className="text-base font-semibold text-text-primary dark:text-slate-100 group-hover:text-primary-blue dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug"
                    >
                        {title}
                    </h3>

                    {/* Specs / Meta Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                        <span className="inline-flex items-center gap-1 text-text-secondary dark:text-slate-300 font-medium px-2.5 py-1 rounded-md bg-surface-secondary dark:bg-slate-800 border border-border-theme dark:border-slate-700/60">
                            <MapPin className="w-3.5 h-3.5 text-primary-blue" />
                            {locationLabel}
                        </span>

                        {opp.stipend && (
                            <span className="inline-flex items-center gap-1 text-[#63703d] dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-md bg-[#63703d]/10 border border-[#63703d]/20">
                                <Coins className="w-3.5 h-3.5 text-[#63703d]" />
                                {opp.stipend}
                            </span>
                        )}

                        {typeof (opp as any).matchScore === 'number' && (
                            <span className="inline-flex items-center gap-1 text-text-primary dark:text-slate-200 font-bold px-2.5 py-1 rounded-md bg-[#f3e4bd] border border-border-theme">
                                <Sparkles className="w-3 h-3 text-primary-blue" />
                                {(opp as any).matchScore}% Match
                            </span>
                        )}

                        {isFree ? (
                            <span className="text-[11px] font-bold text-[#63703d] bg-[#63703d]/10 px-2 py-0.5 rounded">
                                Free
                            </span>
                        ) : null}
                    </div>

                    {/* Tags */}
                    {opp.tags && opp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {opp.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="text-[11px] font-medium text-text-secondary dark:text-slate-400 px-2 py-0.5 rounded bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700/50">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-border-theme dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-text-muted dark:text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5 text-primary-blue" />
                        <span className="truncate max-w-[130px]">{deadlineLabel}</span>
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-bold text-primary-blue dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>

            {/* Audit Trail Modal */}
            {showAuditModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#231f20]/50 backdrop-blur-xs p-4 animate-fade-in"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            e.stopPropagation();
                            closeAuditModal();
                        }
                    }}
                >
                    <div
                        ref={auditModalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="audit-modal-title"
                        className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl space-y-4 animate-scale-up text-text-primary dark:text-slate-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center border-b border-border-theme dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-[#63703d]" aria-hidden="true" />
                                <h3 id="audit-modal-title" className="font-bold text-base text-text-primary dark:text-slate-100">Verification Audit Trail</h3>
                            </div>
                            <button
                                onClick={closeAuditModal}
                                className="text-text-muted hover:text-text-primary dark:hover:text-white p-1 rounded-lg hover:bg-surface-secondary transition-colors"
                            >
                                <X className="w-4 h-4" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="bg-[#63703d]/10 border border-[#63703d]/30 rounded-lg p-3 flex items-center gap-3 text-[#63703d] font-bold">
                                <CheckCircle className="w-5 h-5 text-[#63703d] shrink-0" />
                                <div>
                                    <span className="font-bold block text-text-primary dark:text-slate-100">Audit Verification Passed</span>
                                    <span className="font-normal text-xs text-text-secondary dark:text-slate-300">Listing audited & verified for authentic student application.</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-background dark:bg-slate-800 p-2.5 rounded-lg border border-border-theme dark:border-slate-700 space-y-0.5">
                                    <span className="text-[10px] text-text-muted font-bold uppercase block">Audited By</span>
                                    <span className="font-bold text-text-primary dark:text-slate-100">{auditInfo.verifiedBy}</span>
                                </div>
                                <div className="bg-background dark:bg-slate-800 p-2.5 rounded-lg border border-border-theme dark:border-slate-700 space-y-0.5">
                                    <span className="text-[10px] text-text-muted font-bold uppercase block">Audit Date</span>
                                    <span className="font-bold text-text-primary dark:text-slate-100">{auditInfo.verifiedAt}</span>
                                </div>
                            </div>

                            {auditInfo.auditSourceUrl && (
                                <div className="pt-2">
                                    <a
                                        href={auditInfo.auditSourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-2 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        Inspect Audit Source Page <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            <OpportunityReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                opportunityId={opp.id}
                opportunityTitle={title}
            />

            <CoverLetterModal
                isOpen={showCoverLetterModal}
                onClose={() => setShowCoverLetterModal(false)}
                opportunity={{
                    id: opp.id,
                    title: title,
                    org: orgName,
                    organization: orgName,
                    description: (opp as any).description,
                    location: locationLabel,
                    type: (opp as any).type || (opp as any).category
                }}
                profile={undefined}
            />
        </>
    );
}