import { SecurityEvent, NetworkNode, AccessPolicy, SecurityMetrics } from '../types/networkSecurity';

export class NetworkSecurityService {
    public static async getMetrics(): Promise<SecurityMetrics> {
        await new Promise(r => setTimeout(r, 450));
        return {
            activeThreatsProcessed: 14592,
            totalBandwidthBlockedTb: 4.2,
            nodesUnderAttack: 1,
            autoMitigationRate: 99.98
        };
    }

    public static async getNodes(): Promise<NetworkNode[]> {
        await new Promise(r => setTimeout(r, 600));
        return [
            { id: 'node-gw-01', name: 'US-East API Gateway', type: 'GATEWAY', ipAddress: '192.168.1.1', status: 'ONLINE', throughputMbps: 450, connections: 12050 },
            { id: 'node-gw-02', name: 'EU-West Auth Edge', type: 'EDGE_ROUTER', ipAddress: '192.168.1.5', status: 'UNDER_ATTACK', throughputMbps: 21500, connections: 845012 },
            { id: 'node-db-01', name: 'Core Transaction DB', type: 'DATABASE', ipAddress: '10.0.0.5', status: 'ISOLATED', throughputMbps: 12, connections: 45 },
            { id: 'node-app-01', name: 'Frontend Kubernetes Node', type: 'APPLICATION', ipAddress: '10.0.1.20', status: 'ONLINE', throughputMbps: 85, connections: 340 }
        ];
    }

    public static async getRecentEvents(): Promise<SecurityEvent[]> {
        await new Promise(r => setTimeout(r, 800));
        const events: SecurityEvent[] = [];

        // Generate deterministic massive log of DDOS attacks
        const attackTypes = ['DDoS Volumetric', 'SQL Injection', 'Cross-Site Scripting', 'Brute Force SSH'];

        for (let i = 0; i < 15; i++) {
            const isCritical = i % 4 === 0;
            events.push({
                id: `evt-${1000 + i}`,
                timestamp: new Date(Date.now() - (i * 45000)).toISOString(),
                sourceIP: `185.${i * 10}.12.${i * 2}`,
                sourceGeo: {
                    lat: 51.0 + (i * 0.5),
                    long: 9.0 - (i * 0.2),
                    countryCode: i % 3 === 0 ? 'RU' : i % 2 === 0 ? 'CN' : 'UA',
                    cityName: 'Unknown Region'
                },
                targetNodeId: isCritical ? 'node-gw-02' : 'node-gw-01',
                threatType: attackTypes[i % attackTypes.length],
                severity: isCritical ? 'CRITICAL' : (i % 2 === 0 ? 'HIGH' : 'MEDIUM'),
                actionTaken: 'BLOCKED',
                protocol: isCritical ? 'UDP' : 'HTTPS',
                payloadSizeKb: isCritical ? 145000 : 2.4
            });
        }

        return events;
    }

    public static async getPolicies(): Promise<AccessPolicy[]> {
        await new Promise(r => setTimeout(r, 550));
        return [
            {
                id: 'pol-01', name: 'Global Rate Limiting', description: 'Prevent API abuse by limiting anonymous requests.', isEnabled: true, priority: 10, targetTags: ['edge', 'api'], rules: [{ ruleType: 'RATE_LIMIT', parameters: { maxRequests: 100, windowSecs: 60 } }]
            },
            {
                id: 'pol-02', name: 'Strict Geo-Fencing', description: 'Block all incoming TCP traffic from strictly sanctioned geographic territories.', isEnabled: true, priority: 1, targetTags: ['all'], rules: [{ ruleType: 'GEO_BLOCK', parameters: { blockedCodes: ['IR', 'KP', 'CU', 'SY'] } }]
            },
            {
                id: 'pol-03', name: 'SQL Injection Dynamic Filter', description: 'Inspects HTTP headers for malformed drop table syntaxes via WAF.', isEnabled: false, priority: 5, targetTags: ['database', 'api'], rules: [{ ruleType: 'HEADER_INSPECT', parameters: { regexMatch: '(?i)(drop|delete|truncate)' } }]
            }
        ];
    }

    public static async togglePolicy(policyId: string, enabled: boolean): Promise<boolean> {
        await new Promise(r => setTimeout(r, 500));
        return true;
    }
}
