export function generateOpportunityAlertHtml(title: string, org: string, category: string, link: string, desc: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #2563eb; margin: 0 0 6px 0; font-size: 20px; font-weight: 800;">[YuvaHub] Match Found!</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 0;">New matching ${category || "opportunity"} matches your skills.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 16px 0;" />
      <h3 style="color: #0f172a; margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">${title}</h3>
      <p style="margin: 0 0 14px 0; color: #475569; font-size: 13px; font-weight: 500;">at <strong>${org}</strong></p>
      <p style="color: #334155; line-height: 1.5; font-size: 14px; background-color: #f8fafc; padding: 14px; border-radius: 8px; border-left: 4px solid #3b82f6;">
        ${desc || "No description provided."}
      </p>
      <div style="margin-top: 24px; text-align: center;">
        <a href="${link || "https://yuvahub.xyz"}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
          Apply Now
        </a>
      </div>
      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          <a href="https://yuvahub.xyz/settings" target="_blank" style="color: #64748b; text-decoration: underline;">Manage Alert Settings</a> | 
          <a href="https://yuvahub.xyz/settings?action=unsubscribe" target="_blank" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `;
}

export function generateDeadlineReminderHtml(title: string, org: string, deadline: string, diffDays: number): string {
  const urgencyColor = diffDays === 0 ? "#dc2626" : (diffDays === 1 || diffDays === 2) ? "#ea580c" : "#d97706";
  const daysText = diffDays === 0 ? "TODAY" : diffDays === 1 ? "tomorrow (~24h)" : diffDays === 2 ? "in 48 hours (~2 days)" : `in ${diffDays} days`;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
        <h2 style="color: ${urgencyColor}; margin: 0; font-size: 20px; font-weight: 800;">⏰ Deadline Alert</h2>
        <span style="background-color: ${urgencyColor}15; color: ${urgencyColor}; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">${diffDays === 2 ? "48-HOUR REMINDER" : diffDays <= 1 ? "URGENT DEADLINE" : "CLOSING SOON"}</span>
      </div>
      <p style="color: #64748b; font-size: 14px; margin-top: 12px; margin-bottom: 20px;">An opportunity you bookmarked on YuvaHub is closing soon.</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 16px 0;">
        <h3 style="color: #0f172a; margin: 0 0 6px 0; font-size: 16px; font-weight: 700;">${title}</h3>
        <p style="margin: 0 0 14px 0; color: #475569; font-size: 13px; font-weight: 500;">Organization: <strong>${org || 'YuvaHub Partner'}</strong></p>
        
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 14px;">
          <span style="font-size: 11px; color: #92400e; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Time Remaining</span>
          <span style="font-size: 16px; color: ${urgencyColor}; font-weight: 800;">Closing ${daysText} (${deadline})</span>
        </div>
      </div>

      <div style="margin-top: 24px; text-align: center;">
        <a href="https://yuvahub.xyz" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
          View Bookmarked Opportunity
        </a>
      </div>

      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0;">
          You received this email based on your bookmarked deadline reminders on YuvaHub.
        </p>
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          <a href="https://yuvahub.xyz/settings" target="_blank" style="color: #64748b; text-decoration: underline;">Manage Alert Settings</a> | 
          <a href="https://yuvahub.xyz/settings?action=unsubscribe" target="_blank" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `;
}

export function generateWeeklyDigestHtml(userName: string, opps: Array<{ title: string; org: string; deadline: string }>): string {
  const oppListHtml = opps.map(opp => `
    <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 14px; margin-bottom: 12px;">
      <h4 style="margin: 0 0 4px 0; color: #0f172a; font-size: 15px; font-weight: 700;">${opp.title}</h4>
      <p style="margin: 0 0 6px 0; color: #475569; font-size: 13px;">${opp.org ? `at <strong>${opp.org}</strong>` : ''}</p>
      <span style="font-size: 12px; color: #dc2626; font-weight: 600;">📅 Deadline: ${opp.deadline}</span>
    </div>
  `).join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
        <h2 style="color: #2563eb; margin: 0; font-size: 20px; font-weight: 800;">📋 Weekly Bookmarks Summary Digest</h2>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Hello ${userName || 'Student'}, here are your bookmarked opportunities expiring this week.</p>
      </div>

      <div style="margin: 20px 0;">
        ${oppListHtml || '<p style="color: #64748b; font-size: 14px;">No upcoming deadlines for your bookmarks this week.</p>'}
      </div>

      <div style="margin-top: 24px; text-align: center;">
        <a href="https://yuvahub.xyz" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
          Open YuvaHub Dashboard
        </a>
      </div>

      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0;">
          You received this weekly digest because you have active bookmarks on YuvaHub.
        </p>
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          <a href="https://yuvahub.xyz/settings" target="_blank" style="color: #64748b; text-decoration: underline;">Manage Alert Settings</a> | 
          <a href="https://yuvahub.xyz/settings?action=unsubscribe" target="_blank" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `;
}

export function generateScholarshipAlertHtml(title: string, provider: string, link: string, desc: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #059669; margin: 0 0 6px 0; font-size: 20px; font-weight: 800;">🎓 Scholarship Alert</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 0;">A new scholarship matches your eligibility profile.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 16px 0;" />
      <h3 style="color: #0f172a; margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">${title}</h3>
      <p style="margin: 0 0 14px 0; color: #475569; font-size: 13px; font-weight: 500;">Provider: <strong>${provider}</strong></p>
      <p style="color: #334155; line-height: 1.5; font-size: 14px; background-color: #f0fdf4; padding: 14px; border-radius: 8px; border-left: 4px solid #10b981;">
        ${desc || "No description provided."}
      </p>
      <div style="margin-top: 24px; text-align: center;">
        <a href="${link || "https://yuvahub.xyz"}" target="_blank" style="background-color: #059669; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
          Check Eligibility
        </a>
      </div>
      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          <a href="https://yuvahub.xyz/settings" target="_blank" style="color: #64748b; text-decoration: underline;">Manage Alert Settings</a> | 
          <a href="https://yuvahub.xyz/settings?action=unsubscribe" target="_blank" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `;
}

export function generateHackathonAlertHtml(title: string, organization: string, deadline: string, link: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #7c3aed; margin: 0 0 6px 0; font-size: 20px; font-weight: 800;">🏆 Hackathon Alert</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 0;">Assemble your team! A new hackathon has opened registrations.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 16px 0;" />
      <h3 style="color: #0f172a; margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">${title}</h3>
      <p style="margin: 0 0 14px 0; color: #475569; font-size: 13px; font-weight: 500;">Organizer: <strong>${organization}</strong></p>
      <p style="margin: 0 0 14px 0; color: #6d28d9; font-size: 14px; font-weight: 600;">Registration Deadline: ${deadline || "TBD"}</p>
      <div style="margin-top: 24px; text-align: center;">
        <a href="${link || "https://yuvahub.xyz"}" target="_blank" style="background-color: #7c3aed; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
          Register Now
        </a>
      </div>
      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          <a href="https://yuvahub.xyz/settings" target="_blank" style="color: #64748b; text-decoration: underline;">Manage Alert Settings</a> | 
          <a href="https://yuvahub.xyz/settings?action=unsubscribe" target="_blank" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `;
}

export function generateAdminAlertHtml(workerName: string, jobId: string, domain: string, errorMessage: string, retryCount: number): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #ef4444; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #dc2626; margin: 0 0 6px 0; font-size: 20px; font-weight: 800;">🚨 Critical System Alert</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 0;">A background worker job has exhausted all retries and failed permanently.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 16px 0;" />
      
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <h3 style="color: #991b1b; margin: 0 0 8px 0; font-size: 15px; font-weight: 700;">Worker: ${workerName}</h3>
        <table style="width: 100%; font-size: 13px; color: #475569; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-weight: 600; width: 30%;">Job ID:</td>
            <td style="padding: 4px 0;"><code>${jobId}</code></td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Target Domain:</td>
            <td style="padding: 4px 0;">${domain || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Retry Attempts:</td>
            <td style="padding: 4px 0;">${retryCount}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Timestamp:</td>
            <td style="padding: 4px 0;">${new Date().toISOString()}</td>
          </tr>
        </table>
      </div>

      <h4 style="color: #0f172a; margin: 0 0 8px 0; font-size: 14px; font-weight: 700;">Failure Reason</h4>
      <p style="color: #b91c1c; line-height: 1.5; font-size: 13px; background-color: #fee2e2; padding: 12px; border-radius: 6px; font-family: monospace;">
        ${errorMessage || "Unknown Error"}
      </p>
      
      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          This is an automated administrative alert from YuvaHub.
        </p>
      </div>
    </div>
  `;
}
