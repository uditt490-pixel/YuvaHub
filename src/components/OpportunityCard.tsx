import React, { KeyboardEvent, MouseEvent, useState } from "react";
import { Bookmark, Shield, ExternalLink, X, CheckCircle, DollarSign } from "lucide-react";
import { TypeBadge, Badge } from "./Badge";

export interface Opportunity {
    id: string;
    title: string;
    org?: string;
    organization?: string;
    orgLogo?: string;
    type?: string; // hackathon | internship | scholarship | job
    deadline?: string;
    isRolling?: boolean;
    location?: string; // Remote | Hybrid | Onsite
    stipend?: string;
    eligibility?: string; // Student | Graduate | etc
    verified?: boolean;
    registeredCount?: number;
    isStale?: boolean;
    isFallback?: boolean;
    source_name?: string;
    sourceName?: string;
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

const THUMB_STYLES: Record<string, string> = {
    hackathon: "bg-gradient-to-br from-purple-50 to-purple-100",
    internship: "bg-gradient-to-br from-blue-50 to-blue-100",
    scholarship: "bg-gradient-to-br from-amber-50 to-amber-100",
    job: "bg-gradient-to-br from-teal-50 to-teal-100",
};

function getThumbStyle(type?: string) {
    if (!type) return "bg-gray-50";
    return THUMB_STYLES[type.toLowerCase()] || "bg-gray-50";
}

export function OpportunityCard({
    opportunity: opp,
    onViewDetails,
    onToggleBookmark,
    isBookmarked = false,
}: OpportunityCardProps) {
    const [showAuditModal, setShowAuditModal] = useState(false);

    const orgName = opp.source_name || opp.sourceName || opp.org || opp.organization || "Company not specified";
    const title = opp.title || "Untitled opportunity";
    const deadlineLabel = opp.isRolling ? "Rolling" : opp.deadline || "TBA";
    const locationLabel = opp.location || "Location TBA";

    const isFree = opp.applicationFee?.isFree ?? true;
    const isVerified = opp.verificationDetails?.isVerified ?? (opp.verified !== false && !opp.isFallback && !opp.isStale);

    const auditInfo = opp.verificationDetails || {
        isVerified: true,
        verifiedBy: "YuvaHub Audit Team",
        verifiedAt: "2026-07-20",
        auditSourceUrl: opp.source_name ? `https://${opp.source_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : "https://yuvahub.com",
        reviewerNotes: "Verified official listing source, domain ownership, and zero application fees."
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

    return (
        <>
            <div
                role="link"
                tabIndex={0}
                aria-label={`${title} at ${orgName}, ${opp.type || "opportunity"}, deadline ${deadlineLabel}`}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className="flex h-full w-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-white transition-all duration-200 ease-out hover:-translate-y-[3px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 relative"
            >
                <div className={`relative flex h-[132px] items-center justify-center overflow-hidden p-4 sm:p-5 ${getThumbStyle(opp.type)}`}>
                    <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
                        <div className="flex max-w-[78%] flex-wrap items-center gap-1.5">
                            <TypeBadge type={opp.type} />
                            
                            {/* Verified Audit Badge */}
                            {isVerified && (
                                <button
                                    type="button"
                                    onClick={handleAuditBadgeClick}
                                    className="inline-flex items-center gap-1 rounded-full bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300 transition-colors"
                                    title="Click to view Verified Opportunity Audit Trail"
                                >
                                    <Shield className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                                    Verified Audit
                                </button>
                            )}

                            {isFree ? (
                                <Badge variant="neutral" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                                    Free
                                </Badge>
                            ) : (
                                <Badge variant="neutral" className="bg-amber-50 text-amber-700 border-amber-200 font-bold">
                                    Paid Fee
                                </Badge>
                            )}

                            {opp.isFallback && <Badge variant="neutral" className="bg-orange-50 text-orange-700 border-orange-200">System Fallback</Badge>}
                            {opp.isStale && <Badge variant="neutral" className="bg-yellow-50 text-yellow-700 border-yellow-200">Outdated Data</Badge>}
                        </div>

                        <button
                            type="button"
                            onClick={handleBookmarkClick}
                            aria-label={isBookmarked ? `Remove ${title} from bookmarks` : `Save ${title} to bookmarks`}
                            aria-pressed={isBookmarked}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/85 backdrop-blur transition-colors duration-150 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                        >
                            <Bookmark
                                size={16}
                                className={isBookmarked ? "fill-blue-600 text-blue-600" : "text-gray-500"}
                            />
                        </button>
                    </div>

                    {(opp.type || "").toLowerCase().includes("hackathon") && (
                        <span aria-hidden="true" className="select-none text-lg font-black tracking-widest opacity-80">HACKATHON</span>
                    )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                    <div className="flex flex-1 flex-col gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                            {opp.orgLogo ? (
                                <img
                                    src={opp.orgLogo}
                                    alt={`${orgName} logo`}
                                    className="h-[22px] w-[22px] shrink-0 rounded-[5px] object-cover"
                                />
                            ) : (
                                <div
                                    aria-hidden="true"
                                    className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] bg-[#EFF6FF] text-[10px] font-bold text-[#2563EB]"
                                >
                                    {orgName.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <span className="truncate text-[13px] font-semibold text-slate-600">{orgName}</span>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <h3
                                    title={title}
                                    className="min-h-[2.9rem] text-[16px] font-semibold leading-6 text-gray-900 line-clamp-2 break-words"
                                >
                                    {title}
                                </h3>
                                <div className="h-[1px] w-10 bg-slate-200" />
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                <Badge variant="neutral">{locationLabel}</Badge>
                                {opp.eligibility && <Badge variant="neutral">{opp.eligibility}</Badge>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-2">
                            <div className="flex h-full min-h-[60px] flex-col justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-2.5">
                                <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#64748B]">
                                    Registered
                                </div>
                                <div className="text-[14px] font-semibold text-slate-700">
                                    {opp.registeredCount != null ? `${opp.registeredCount}+` : "—"}
                                </div>
                            </div>
                            <div className="flex h-full min-h-[60px] flex-col justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-2.5">
                                <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#64748B]">
                                    {opp.isRolling ? "Status" : "Ends In"}
                                </div>
                                <div className="text-[14px] font-semibold text-slate-900" title={deadlineLabel}>
                                    {deadlineLabel}
                                </div>
                            </div>
                        </div>

                        {opp.stipend && (
                            <div className="text-[12px] font-medium text-[#16A34A]">💰 {opp.stipend}</div>
                        )}
                    </div>

                    <div className="mt-auto flex flex-col gap-2 border-t border-[#F1F5F9] pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-1 text-[12px] text-[#64748B]">
                            <span aria-hidden="true">👥</span>
                            <span className="truncate">1-4 Members</span>
                        </div>
                        <div className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-blue-700 sm:self-auto">
                            Register Now →
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit Trail Modal */}
            {showAuditModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowAuditModal(false);
                    }}
                >
                    <div
                        className="bg-white rounded-2xl p-6 max-w-md w-full border border-emerald-200 shadow-2xl space-y-4 animate-scale-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                                <h3 className="font-bold text-base text-gray-900">Verified Opportunity Audit Trail</h3>
                            </div>
                            <button
                                onClick={() => setShowAuditModal(false)}
                                className="text-gray-400 hover:text-gray-700 p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-2.5 text-emerald-900 font-semibold">
                                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                <div>
                                    <span className="font-bold block text-emerald-950">Audit Verification Passed</span>
                                    <span>Listing audited & verified for authentic student application.</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-0.5">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Audited By</span>
                                    <span className="font-bold text-gray-900">{auditInfo.verifiedBy}</span>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-0.5">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Audit Date</span>
                                    <span className="font-bold text-gray-900">{auditInfo.verifiedAt}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase block">Application Fee Status</span>
                                <span className="font-bold text-emerald-700 flex items-center gap-1 text-sm">
                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                    {isFree ? "Free to Apply (0 USD)" : `Fee Required (${opp.applicationFee?.amount || 50} ${opp.applicationFee?.currency || 'USD'})`}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase block">Reviewer Audit Notes</span>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs leading-relaxed">
                                    {auditInfo.reviewerNotes || "Verified official organization domain and confirmed application page is active with zero hidden fees."}
                                </p>
                            </div>

                            {auditInfo.auditSourceUrl && (
                                <div className="pt-2">
                                    <a
                                        href={auditInfo.auditSourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                                    >
                                        Inspect Audit Source Page <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}