/**
 * stipendNormalizer.ts
 * 
 * Parses and standardizes various stipend and salary formats into a 
 * consistent structure for accurate filtering and sorting.
 */

export interface NormalizedStipend {
    currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'UNKNOWN';
    min: number;
    max: number;
    interval: 'hourly' | 'monthly' | 'yearly' | 'one-time' | 'UNKNOWN';
}

/**
 * Normalizes a raw stipend string into a structured object.
 * Handles formats like: "$5k/mo", "₹40000 per month", "50000 INR yearly", "20/hr"
 * 
 * @param rawStipend - The raw string extracted from the job posting.
 * @returns A NormalizedStipend object.
 */
export function normalizeStipend(rawStipend: string): NormalizedStipend {
    if (!rawStipend || typeof rawStipend !== 'string') {
        return { currency: 'UNKNOWN', min: 0, max: 0, interval: 'UNKNOWN' };
    }

    const lowerStipend = rawStipend.toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ');

    let currency: NormalizedStipend['currency'] = 'UNKNOWN';
    let min = 0;
    let max = 0;
    let interval: NormalizedStipend['interval'] = 'UNKNOWN';

    // 1. Determine Currency
    if (lowerStipend.includes('₹') || lowerStipend.includes('inr') || lowerStipend.includes('rs')) {
        currency = 'INR';
    } else if (lowerStipend.includes('$') || lowerStipend.includes('usd')) {
        currency = 'USD';
    } else if (lowerStipend.includes('€') || lowerStipend.includes('eur')) {
        currency = 'EUR';
    } else if (lowerStipend.includes('£') || lowerStipend.includes('gbp')) {
        currency = 'GBP';
    }

    // 2. Determine Interval
    if (lowerStipend.includes('hr') || lowerStipend.includes('hour') || lowerStipend.includes('/hr')) {
        interval = 'hourly';
    } else if (lowerStipend.includes('mo') || lowerStipend.includes('month') || lowerStipend.includes('/mo')) {
        interval = 'monthly';
    } else if (lowerStipend.includes('yr') || lowerStipend.includes('year') || lowerStipend.includes('/yr') || lowerStipend.includes('annum')) {
        interval = 'yearly';
    } else if (lowerStipend.includes('one-time') || lowerStipend.includes('lump')) {
        interval = 'one-time';
    }

    // 3. Extract Numeric Values (Handles "5k", "5000", "5000-6000", "5k to 10k")
    const numberPattern = /(\d+(?:\.\d+)?)(k|l|lakh|m|million)?/g;
    const matches = [...lowerStipend.matchAll(numberPattern)];

    const values = matches.map(match => {
        let val = parseFloat(match[1]);
        const suffix = match[2];
        if (suffix === 'k') val *= 1000;
        if (suffix === 'l' || suffix === 'lakh') val *= 100000;
        if (suffix === 'm' || suffix === 'million') val *= 1000000;
        return val;
    });

    if (values.length >= 2) {
        min = Math.min(values[0], values[1]);
        max = Math.max(values[0], values[1]);
    } else if (values.length === 1) {
        min = values[0];
        max = values[0];
    }

    return { currency, min, max, interval };
}
