import React, { KeyboardEvent, MouseEvent } from "react";
import { Bookmark } from "lucide-react";
import { TypeBadge, Badge } from "./Badge";

// Loosen this to your real shape once you have a shared types file.
// Everything here is optional/fallback-safe since the current data
// isn't guaranteed to have all fields.
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
    const orgName = opp.org || opp.organization || "Company not specified";
    const title = opp.title || "Untitled opportunity";
    const deadlineLabel = opp.isRolling ? "Rolling" : opp.deadline || "TBA";
    const locationLabel = opp.location || "Location TBA";

    const handleActivate = () => {
        onViewDetails?.(opp.id, opp.title);
    };

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        // Don't navigate if the user was selecting text on the card
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;
        handleActivate();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        // Space/Enter activate the card like a real link/button would
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleActivate();
        }
    };

    const handleBookmarkClick = (e: MouseEvent) => {
        e.stopPropagation(); // don't also trigger the card click
        onToggleBookmark?.(opp.id);
    };

    return (
        <div
            role="link"
            tabIndex={0}
            aria-label={`${title} at ${orgName}, ${opp.type || "opportunity"}, deadline ${deadlineLabel}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className="flex h-full w-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-white transition-all duration-200 ease-out hover:-translate-y-[3px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
            <div className={`relative flex h-[132px] items-center justify-center overflow-hidden p-4 sm:p-5 ${getThumbStyle(opp.type)}`}>
                <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
                    <div className="flex max-w-[78%] flex-wrap items-center gap-1.5">
                        <TypeBadge type={opp.type} />
                        {opp.verified !== false && <Badge variant="verified">Verified</Badge>}
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
    );
}