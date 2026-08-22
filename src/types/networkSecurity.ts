export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type SecurityAction = 'BLOCKED' | 'FLAGGED' | 'ALLOWED' | 'CHALLENGED';
export type Protocol = 'TCP' | 'UDP' | 'ICMP' | 'HTTPS' | 'SSH';

export interface GeoLocation {
    lat: number;
    long: number;
    countryCode: string;
    cityName: string;
}

export interface SecurityEvent {
    id: string;
    timestamp: string;
    sourceIP: string;
    sourceGeo: GeoLocation;
    targetNodeId: string;
    threatType: string;
    severity: ThreatSeverity;
    actionTaken: SecurityAction;
    protocol: Protocol;
    payloadSizeKb: number;
}

export interface NetworkNode {
    id: string;
    name: string;
    type: 'GATEWAY' | 'EDGE_ROUTER' | 'DATABASE' | 'APPLICATION';
    ipAddress: string;
    status: 'ONLINE' | 'ISOLATED' | 'UNDER_ATTACK';
    throughputMbps: number;
    connections: number;
}

export interface AccessPolicy {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
    priority: number;
    targetTags: string[];
    rules: {
        ruleType: 'GEO_BLOCK' | 'RATE_LIMIT' | 'IP_DENY' | 'HEADER_INSPECT';
        parameters: Record<string, any>;
    }[];
}

export interface SecurityMetrics {
    activeThreatsProcessed: number;
    totalBandwidthBlockedTb: number;
    nodesUnderAttack: number;
    autoMitigationRate: number;
}
