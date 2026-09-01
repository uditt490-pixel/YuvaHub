export function generateIcs(opportunity: any): string {
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    let deadline = new Date();
    if (opportunity.deadlineDate) {
        deadline = new Date(opportunity.deadlineDate);
    } else if (opportunity.deadline && typeof opportunity.deadline === 'string' && !opportunity.deadline.match(/rolling|active|open|days left/i)) {
        const parsed = new Date(opportunity.deadline);
        if (!isNaN(parsed.getTime())) {
            deadline = parsed;
        } else {
            deadline.setDate(deadline.getDate() + 1);
        }
    } else {
        deadline.setDate(deadline.getDate() + 1); // fallback
    }
    
    const end = deadline.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Default duration: 1 hour before deadline
    const startDate = new Date(deadline.getTime() - 60 * 60 * 1000);
    const start = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const uid = `${opportunity._id || opportunity.id || 'opp'}@yuvahub.xyz`;
    
    // Ensure the description includes the apply link (or source url)
    const applyUrl = opportunity.apply_link || opportunity.source_url || 'https://yuvahub.xyz';
    let rawDesc = `Apply here: ${applyUrl}\n\n${opportunity.description || ''}`;
    // Max line length for ICS is 75 octets, but for basic support simply escaping newlines works.
    const description = rawDesc.replace(/\n/g, '\\n').replace(/,/g, '\\,');
    
    const summary = (opportunity.title || 'Opportunity Deadline').replace(/,/g, '\\,');
    const location = (opportunity.location || '').replace(/,/g, '\\,');

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//YuvaHub//Calendar//EN',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
}
