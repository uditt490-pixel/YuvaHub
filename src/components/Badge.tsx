import React from "react";

type BadgeVariant = "type" | "status" | "verified" | "neutral";

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
    type: "bg-blue-50 text-blue-700 border border-blue-200",
    status: "bg-green-50 text-green-700 border border-green-200",
    verified: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    neutral: "bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]",
};

// Deterministic per-type color so the same type always looks the same
// across the whole app (hackathon = purple, internship = blue, etc).
const TYPE_COLOR_MAP: Record<string, string> = {
    hackathon: "bg-white text-purple-700 border border-purple-200",
    internship: "bg-white text-blue-700 border border-blue-200",
    scholarship: "bg-white text-amber-700 border border-amber-200",
    job: "bg-white text-teal-700 border border-teal-200",
};

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
    const base =
        "inline-flex items-center justify-center rounded-full px-[9px] py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] leading-4";
    return (
        <span className={`${base} ${VARIANT_STYLES[variant]} ${className}`}>
            {children}
        </span>
    );
}

export function TypeBadge({ type }: { type?: string }) {
    if (!type) return null;
    const key = type.toLowerCase();
    const style = TYPE_COLOR_MAP[key] || VARIANT_STYLES.type;
    return (
        <span className={`inline-flex items-center justify-center rounded-full px-[9px] py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] leading-4 ${style}`}>
            {type}
        </span>
    );
}