import {
  SecurityEvent,
  SecurityPolicyRule,
  ZeroTrustAnalytics,
  ZeroTrustFilter,
  QuarantinePayload
} from '../types/zeroTrustSecurity';

export class ZeroTrustSecurityService {
  private static eventStore: SecurityEvent[] = [
    {
      id: 'sec-001',
      eventId: 'ZT-EVT-9041',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      sourceIp: '185.220.101.5',
      location: 'Frankfurt, Germany (Tor Exit Node)',
      userPrincipal: 'service-account-tpo@yuva.hub',
      userRole: 'Enterprise API Client',
      targetResource: '/api/v2/enterprise/campus-roster/export',
      gateProtocol: 'JWT_ZERO_TRUST',
      threatSeverity: 'CRITICAL_BREACH',
      riskScore: 98,
      status: 'QUARANTINED',
      anomaliesDetected: [
        'Known malicious Tor exit relay signature detected',
        'Anomalous spike in bulk export volume (+450%)',
        'JWT token issued in Mumbai used from European IP in < 5 mins (Impossible Travel)'
      ],
      userAgent: 'python-requests/2.31.0 (Automated Scraper Bot)',
      mitigationTaken: 'Automated IP Quarantine & Token Invalidation',
      mitigatedBy: 'Zero-Trust AI Guard Engine'
    },
    {
      id: 'sec-002',
      eventId: 'ZT-EVT-9042',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      sourceIp: '103.21.244.12',
      location: 'Bengaluru, India (Campus LAN)',
      userPrincipal: 'aravind.k@iitb.ac.in',
      userRole: 'Campus Placement Admin',
      targetResource: '/enterprise/dashboard/placement-telemetry',
      gateProtocol: 'BIOMETRIC_PASSKEY',
      threatSeverity: 'LOW',
      riskScore: 8,
      status: 'GRANTED',
      anomaliesDetected: ['Zero anomalies detected; hardware FIDO2 WebAuthn confirmed'],
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    {
      id: 'sec-003',
      eventId: 'ZT-EVT-9043',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      sourceIp: '45.154.255.89',
      location: 'Saint Petersburg, Russia',
      userPrincipal: 'recruiter.guest@external-vendor.com',
      userRole: 'Recruiter Guest',
      targetResource: '/api/v1/auth/exchange-token',
      gateProtocol: 'OAUTH2_PKCE',
      threatSeverity: 'HIGH',
      riskScore: 84,
      status: 'DENIED',
      anomaliesDetected: [
        'Invalid PKCE code_verifier hash mismatch',
        'High frequency brute-force token generation attempts'
      ],
      userAgent: 'curl/8.4.0',
      mitigationTaken: 'Request Denied & Rate Limited',
      mitigatedBy: 'WAF Rate Limiter'
    },
    {
      id: 'sec-004',
      eventId: 'ZT-EVT-9044',
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
      sourceIp: '14.139.128.18',
      location: 'New Delhi, India (DTU Subnet)',
      userPrincipal: 'tpo.lead@dtu.ac.in',
      userRole: 'Institutional Dean',
      targetResource: '/enterprise/settings/rbac-policies',
      gateProtocol: 'MTLS_HANDSHAKE',
      threatSeverity: 'LOW',
      riskScore: 12,
      status: 'GRANTED',
      anomaliesDetected: ['Valid institutional client certificate verified via DigiCert Root CA'],
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0'
    },
    {
      id: 'sec-005',
      eventId: 'ZT-EVT-9045',
      timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
      sourceIp: '198.51.100.24',
      location: 'Singapore (AWS AP-Southeast-1)',
      userPrincipal: 'ci-runner@github-actions.internal',
      userRole: 'CI/CD Automation',
      targetResource: '/api/v1/internal/health-metrics',
      gateProtocol: 'EPHEMERAL_SSH',
      threatSeverity: 'MEDIUM',
      riskScore: 54,
      status: 'UNDER_REVIEW',
      anomaliesDetected: ['Certificate nearing expiration (< 2 hours validity remaining)'],
      userAgent: 'OpenSSH_9.6p1 Ubuntu-3ubuntu13.4'
    }
  ];

  private static policyStore: SecurityPolicyRule[] = [
    {
      id: 'pol-001',
      ruleName: 'Strict Geolocation & Tor Node Block',
      description: 'Block all incoming requests originating from known Tor relays, proxies, and sanctioned IP zones.',
      gateProtocol: 'IP_GEO_FENCE',
      enforceMfa: true,
      maxRiskThreshold: 75,
      autoQuarantine: true,
      enabled: true,
      matchedCount: 382
    },
    {
      id: 'pol-002',
      ruleName: 'FIDO2 Hardware Key Enforcement for TPO Admins',
      description: 'Require WebAuthn/Passkey biometric confirmation for all destructive placement actions.',
      gateProtocol: 'BIOMETRIC_PASSKEY',
      enforceMfa: true,
      maxRiskThreshold: 40,
      autoQuarantine: false,
      enabled: true,
      matchedCount: 1420
    },
    {
      id: 'pol-003',
      ruleName: 'Mutual TLS for Enterprise Integrations',
      description: 'Enforce mTLS client certificates for all server-to-server institutional sync webhooks.',
      gateProtocol: 'MTLS_HANDSHAKE',
      enforceMfa: false,
      maxRiskThreshold: 50,
      autoQuarantine: true,
      enabled: true,
      matchedCount: 8900
    }
  ];

  public static async getSecurityEvents(filters?: Partial<ZeroTrustFilter>): Promise<SecurityEvent[]> {
    await new Promise((r) => setTimeout(r, 300));
    let result = [...this.eventStore];

    if (!filters) return result;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.eventId.toLowerCase().includes(q) ||
          e.userPrincipal.toLowerCase().includes(q) ||
          e.sourceIp.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.targetResource.toLowerCase().includes(q)
      );
    }

    if (filters.threatSeverity && filters.threatSeverity !== 'ALL') {
      result = result.filter((e) => e.threatSeverity === filters.threatSeverity);
    }

    if (filters.gateProtocol && filters.gateProtocol !== 'ALL') {
      result = result.filter((e) => e.gateProtocol === filters.gateProtocol);
    }

    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((e) => e.status === filters.status);
    }

    if (filters.minRiskScore && filters.minRiskScore > 0) {
      result = result.filter((e) => e.riskScore >= filters.minRiskScore!);
    }

    if (filters.sortBy) {
      result.sort((a, b) => {
        let valA = 0;
        let valB = 0;
        if (filters.sortBy === 'riskScore') {
          valA = a.riskScore;
          valB = b.riskScore;
        } else if (filters.sortBy === 'timestamp') {
          valA = new Date(a.timestamp).getTime();
          valB = new Date(b.timestamp).getTime();
        }
        return filters.sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  }

  public static async getPolicies(): Promise<SecurityPolicyRule[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...this.policyStore];
  }

  public static async togglePolicy(ruleId: string, enabled: boolean): Promise<SecurityPolicyRule> {
    await new Promise((r) => setTimeout(r, 250));
    const index = this.policyStore.findIndex((p) => p.id === ruleId);
    if (index === -1) throw new Error('Policy not found');
    this.policyStore[index].enabled = enabled;
    return this.policyStore[index];
  }

  public static async executeQuarantine(payload: QuarantinePayload): Promise<SecurityEvent> {
    await new Promise((r) => setTimeout(r, 400));
    const index = this.eventStore.findIndex((e) => e.id === payload.eventId);
    if (index === -1) throw new Error('Event record not found');

    const updated: SecurityEvent = {
      ...this.eventStore[index],
      status: 'QUARANTINED',
      threatSeverity: 'CRITICAL_BREACH',
      mitigationTaken: `EMERGENCY QUARANTINE (${payload.quarantineDurationHours}h): ${payload.reason}`,
      mitigatedBy: payload.authorizedBy
    };

    this.eventStore[index] = updated;
    return updated;
  }

  public static async getAnalytics(): Promise<ZeroTrustAnalytics> {
    await new Promise((r) => setTimeout(r, 250));
    const events = this.eventStore;
    const quarantinedCount = events.filter((e) => e.status === 'QUARANTINED').length;
    const avgRisk = events.reduce((acc, e) => acc + e.riskScore, 0) / (events.length || 1);

    return {
      totalRequestsToday: 148520,
      blockedAttacks: 342,
      activeQuarantines: quarantinedCount,
      averageRiskScore: Math.round(avgRisk * 10) / 10,
      soc2ComplianceScore: 99.8,
      threatDistribution: [
        { severity: 'CRITICAL_BREACH', count: 1, percentage: 20 },
        { severity: 'HIGH', count: 1, percentage: 20 },
        { severity: 'MEDIUM', count: 1, percentage: 20 },
        { severity: 'LOW', count: 2, percentage: 40 }
      ],
      protocolVelocity: [
        { protocol: 'BIOMETRIC_PASSKEY', requestCount: 84200, blockRate: 0.1 },
        { protocol: 'MTLS_HANDSHAKE', requestCount: 42100, blockRate: 0.4 },
        { protocol: 'JWT_ZERO_TRUST', requestCount: 15300, blockRate: 2.1 },
        { protocol: 'OAUTH2_PKCE', requestCount: 6920, blockRate: 1.8 }
      ]
    };
  }

  public static exportCSV(events: SecurityEvent[]): string {
    const headers = [
      'Event ID',
      'Timestamp',
      'Source IP',
      'Location',
      'User Principal',
      'Role',
      'Target Resource',
      'Protocol',
      'Severity',
      'Risk Score',
      'Status'
    ];

    const rows = events.map((e) => [
      e.eventId,
      e.timestamp,
      e.sourceIp,
      `"${e.location}"`,
      `"${e.userPrincipal}"`,
      `"${e.userRole}"`,
      `"${e.targetResource}"`,
      e.gateProtocol,
      e.threatSeverity,
      e.riskScore,
      e.status
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
