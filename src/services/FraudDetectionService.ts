// ═══════════════════════════════════════════════════════════════════
// Enterprise Fraud Detection & Risk Intelligence — Service Layer
// ═══════════════════════════════════════════════════════════════════

import {
  Transaction, TransactionStatus, RiskLevel, AnomalyFlag, AnomalyType,
  UserRiskProfile, RiskFactor, ThreatIntelligence, ThreatType, FeedSource,
  IOC, FraudRule, RuleAction, FraudAlert, AlertSeverity, DashboardMetrics
} from '../types/fraudDetection';

const NAMES = ['Arjun Mehta','Priya Singh','Rohit Sharma','Sneha Patel','Vikram Rao','Ananya Gupta','Karan Joshi','Meera Nair','Rajesh Kumar','Pooja Desai','Amit Verma','Neha Reddy','Suresh Iyer','Kavita Sharma','Deepak Mishra','Rina Bose','Sanjay Kulkarni','Lata Menon','Gaurav Bhatt','Swati Saxena'];
const COUNTRIES = ['IN','US','GB','DE','AE','SG','JP','BR','NG','AU'];
const CITIES = ['Mumbai','Delhi','London','Dubai','New York','Tokyo','São Paulo','Singapore','Lagos','Sydney'];
const MERCHANTS = ['e-commerce','travel','gaming','crypto','utilities','retail','food','subscriptions','healthcare','education'];
const THREAT_TITLES = ['Credential stuffing campaign targeting Indian banks','Synthetic identity fraud ring detected in APAC','Phishing infrastructure targeting payment gateways','Bot network conducting card testing attacks','Money laundering via shell merchant accounts','Insider threat at payment processor detected','Account takeover wave via social engineering','Darkweb marketplace selling compromised credentials'];

function genId(p: string) { return `${p}-${Math.random().toString(36).substring(2, 10)}`; }
function rand(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function randf(a: number, b: number, d = 2) { return parseFloat((Math.random() * (b - a) + a).toFixed(d)); }
function pick<T>(a: T[]) { return a[Math.floor(Math.random() * a.length)]; }
function dateStr(daysAgo: number) { const d = new Date(); d.setDate(d.getDate() - rand(0, daysAgo)); d.setHours(rand(0,23), rand(0,59)); return d.toISOString(); }

const ANOMALY_TYPES: AnomalyType[] = ['velocity_breach','geo_mismatch','device_change','amount_anomaly','time_anomaly','behavior_shift','ip_reputation','network_anomaly'];
const ALERT_SEVERITIES: AlertSeverity[] = ['P0','P1','P2','P3'];
const RISK_LEVELS: RiskLevel[] = ['critical','high','medium','low','minimal'];
const STATUSES: TransactionStatus[] = ['approved','flagged','blocked','pending_review','reversed'];

function genAnomalyFlags(): AnomalyFlag[] {
  const count = rand(0, 3);
  return Array.from({ length: count }, () => ({
    id: genId('anom'),
    type: pick(ANOMALY_TYPES),
    description: `Anomaly detected: ${pick(ANOMALY_TYPES).replace(/_/g, ' ')}`,
    severity: pick(ALERT_SEVERITIES),
    confidence: randf(60, 99),
    detectedAt: dateStr(7),
    mitigated: Math.random() > 0.5
  }));
}

function genTransactions(count: number): Transaction[] {
  return Array.from({ length: count }, (_, i) => {
    const riskScore = randf(0, 100);
    const riskLevel: RiskLevel = riskScore > 80 ? 'critical' : riskScore > 60 ? 'high' : riskScore > 40 ? 'medium' : riskScore > 20 ? 'low' : 'minimal';
    const status: TransactionStatus = riskScore > 80 ? 'blocked' : riskScore > 60 ? 'flagged' : riskScore > 40 ? 'pending_review' : pick(['approved','approved','approved','reversed']);
    const userIdx = rand(0, NAMES.length - 1);
    const countryIdx = rand(0, COUNTRIES.length - 1);
    const anomalyFlags = genAnomalyFlags();
    return {
      id: `txn-${String(i + 1).padStart(5, '0')}`,
      userId: `usr-${String(userIdx + 1).padStart(3, '0')}`,
      userName: NAMES[userIdx],
      amount: randf(10, 50000),
      currency: 'INR',
      type: pick(['payment','transfer','withdrawal','refund','deposit'] as const),
      status,
      riskScore,
      riskLevel,
      merchantCategory: pick(MERCHANTS),
      ipAddress: `${rand(10,223)}.${rand(0,255)}.${rand(0,255)}.${rand(1,254)}`,
      deviceFingerprint: genId('dev'),
      geoLocation: { country: COUNTRIES[countryIdx], city: CITIES[countryIdx], lat: randf(-30, 50), lng: randf(-100, 130) },
      anomalyFlags,
      timestamp: dateStr(30),
      processedAt: dateStr(29),
      rulesTriggered: anomalyFlags.map(() => `rule-${rand(1, 20)}`),
      notes: riskScore > 70 ? 'Requires manual review' : undefined
    };
  });
}

function genUserProfiles(): UserRiskProfile[] {
  return NAMES.map((name, i) => {
    const riskScore = randf(5, 95);
    const riskLevel: RiskLevel = riskScore > 80 ? 'critical' : riskScore > 60 ? 'high' : riskScore > 40 ? 'medium' : riskScore > 20 ? 'low' : 'minimal';
    return {
      userId: `usr-${String(i + 1).padStart(3, '0')}`,
      userName: name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      overallRiskScore: riskScore,
      riskLevel,
      totalTransactions: rand(50, 2000),
      flaggedTransactions: rand(0, 50),
      blockedTransactions: rand(0, 10),
      totalAmount30d: randf(5000, 500000),
      averageTransactionAmount: randf(100, 5000),
      maxSingleTransaction: randf(1000, 100000),
      countriesAccessed: [pick(COUNTRIES), pick(COUNTRIES)],
      devicesUsed: rand(1, 5),
      accountAge: rand(30, 1500),
      lastActivity: dateStr(3),
      previousIncidents: rand(0, 5),
      kycVerified: Math.random() > 0.3,
      riskFactors: Array.from({ length: rand(0, 4) }, () => ({
        id: genId('rf'),
        category: pick(['velocity','geography','device','behavior','identity']),
        description: `Risk factor: ${pick(['unusual login pattern','new device detected','high-value transaction','cross-border activity','rapid succession'])}`,
        impact: randf(10, 40),
        detectedAt: dateStr(30),
        status: pick(['active','mitigated','expired'] as const)
      })),
      trendScores: Array.from({ length: 30 }, () => randf(10, 90))
    };
  });
}

function genThreats(): ThreatIntelligence[] {
  const sources: FeedSource[] = ['internal','osint','darkweb','partner','government','threat_intel'];
  return THREAT_TITLES.map((title, i) => ({
    id: genId('threat'),
    title,
    description: `Automated threat intelligence: ${title}. Confidence level assessed by cross-referencing multiple feeds.`,
    threatType: pick(['phishing','credential_stuffing','account_takeover','identity_theft','synthetic_fraud','money_laundering','bot_attack','insider_threat'] as ThreatType[]),
    severity: pick(ALERT_SEVERITIES),
    confidence: randf(55, 99),
    source: pick(sources),
    iocs: Array.from({ length: rand(1, 5) }, () => ({
      type: pick(['ip','domain','hash','email','url','file_name'] as const),
      value: pick(['192.168.1.1','malware-c2.evil.com','a1b2c3d4e5f6','attacker@darkweb.onion','https://phish.example.com/login','emotet_sample.exe']),
      confidence: randf(50, 99),
      firstSeen: dateStr(60),
      lastSeen: dateStr(1)
    })),
    affectedSystems: [`svc-${rand(1,10)}`, `svc-${rand(1,10)}`],
    publishedAt: dateStr(14),
    expiresAt: dateStr(-30),
    references: [`https://cve.mitre.org/CVE-${rand(2020,2025)}-${rand(1000,9999)}`],
    mitigations: ['Block identified IOCs at network edge', 'Update detection signatures', 'Alert affected account holders'],
    isActive: Math.random() > 0.3
  }));
}

function genAlerts(): FraudAlert[] {
  return Array.from({ length: 12 }, (_, i) => ({
    id: genId('alert'),
    title: pick(['Suspicious login from new device','Velocity limit exceeded','Unusual transaction pattern','High-risk merchant interaction','Cross-border anomaly','Potential account compromise','Suspicious refund chain','Unusual withdrawal pattern']),
    description: `Automated alert triggered by fraud detection engine. Multiple risk signals correlated.`,
    severity: pick(ALERT_SEVERITIES),
    status: pick(['open','open','investigating','resolved','dismissed'] as const),
    relatedTransactions: [`txn-${String(rand(1, 200)).padStart(5, '0')}`],
    relatedUsers: [`usr-${String(rand(1, 20)).padStart(3, '0')}`],
    riskScore: randf(30, 98),
    createdAt: dateStr(14),
    updatedAt: dateStr(1),
    assignee: pick(['fraud-team','ops-lead','security-analyst','compliance-officer']),
    resolution: pick([undefined, 'False positive confirmed','User contacted and verified','Account frozen pending review','Transaction reversed successfully'])
  }));
}

function genRules(): FraudRule[] {
  return Array.from({ length: 10 }, (_, i) => {
    const action: RuleAction = pick(['block','flag','challenge','monitor','notify']);
    return {
      id: `rule-${i + 1}`,
      name: pick(['Velocity Check','Amount Threshold','Geo Anomaly','Device Trust Score','Time Window Analysis','IP Reputation Filter','Merchant Risk Category','Velocity Limit','Cross-border Check','Behavioral Baseline']),
      description: `Automated fraud detection rule for ${action} action`,
      condition: pick(['amount > 10000', 'transactions > 5 in 1 min', 'new_device AND high_amount', 'geo_distance > 500km', 'ip_blacklisted', 'velocity > 10/min']),
      action,
      severity: pick(ALERT_SEVERITIES),
      enabled: Math.random() > 0.2,
      triggerCount: rand(0, 500),
      falsePositiveRate: randf(0, 15),
      lastTriggered: Math.random() > 0.3 ? dateStr(7) : undefined,
      createdAt: dateStr(180),
      updatedAt: dateStr(30)
    };
  });
}

function genMetrics(): DashboardMetrics {
  return {
    totalTransactions24h: rand(8000, 25000),
    flaggedTransactions24h: rand(100, 800),
    blockedTransactions24h: rand(20, 150),
    totalVolume24h: randf(5000000, 20000000),
    avgRiskScore: randf(20, 45),
    activeAlerts: rand(5, 25),
    criticalAlerts: rand(1, 5),
    blockedAmount24h: randf(100000, 2000000),
    fraudRate: randf(0.1, 3.5),
    systemAccuracy: randf(95, 99.5),
    avgResponseTimeMs: rand(10, 80),
    rulesTriggered24h: rand(200, 1500)
  };
}

// ─── Main Service ────────────────────────────────────────────────

export class FraudDetectionService {
  private static txns = genTransactions(200);
  private static profiles = genUserProfiles();
  private static threats = genThreats();
  private static alerts = genAlerts();
  private static rules = genRules();

  static async getMetrics(): Promise<DashboardMetrics> {
    await new Promise(r => setTimeout(r, 250));
    return genMetrics();
  }

  static async getTransactions(filters: { statusFilter: TransactionStatus | 'all'; riskFilter: RiskLevel | 'all'; searchQuery: string; timeRange: string }): Promise<Transaction[]> {
    await new Promise(r => setTimeout(r, 300));
    let result = [...this.txns];
    if (filters.statusFilter !== 'all') result = result.filter(t => t.status === filters.statusFilter);
    if (filters.riskFilter !== 'all') result = result.filter(t => t.riskLevel === filters.riskFilter);
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(t => t.id.toLowerCase().includes(q) || t.userName.toLowerCase().includes(q) || t.merchantCategory.toLowerCase().includes(q));
    }
    return result;
  }

  static async getUserProfiles(): Promise<UserRiskProfile[]> {
    await new Promise(r => setTimeout(r, 300));
    return [...this.profiles];
  }

  static async getThreats(): Promise<ThreatIntelligence[]> {
    await new Promise(r => setTimeout(r, 300));
    return [...this.threats];
  }

  static async getAlerts(): Promise<FraudAlert[]> {
    await new Promise(r => setTimeout(r, 250));
    return [...this.alerts];
  }

  static async getRules(): Promise<FraudRule[]> {
    await new Promise(r => setTimeout(r, 200));
    return [...this.rules];
  }

  static async toggleRule(id: string, enabled: boolean): Promise<FraudRule | undefined> {
    await new Promise(r => setTimeout(r, 150));
    const rule = this.rules.find(r => r.id === id);
    if (rule) rule.enabled = enabled;
    return rule;
  }

  static async dismissAlert(id: string): Promise<FraudAlert | undefined> {
    await new Promise(r => setTimeout(r, 150));
    const alert = this.alerts.find(a => a.id === id);
    if (alert) alert.status = 'dismissed';
    return alert;
  }

  static async blockTransaction(id: string): Promise<Transaction | undefined> {
    await new Promise(r => setTimeout(r, 200));
    const txn = this.txns.find(t => t.id === id);
    if (txn) { txn.status = 'blocked'; txn.riskScore = 100; txn.riskLevel = 'critical'; }
    return txn;
  }
}
