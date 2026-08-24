import { DataNode, PipelineEdge, JobRunTelemetry, TransformationStep, DataMeshOverview } from '../types/dataMesh';

export class DataMeshService {
    public static async getOverviewMetrics(): Promise<DataMeshOverview> {
        await new Promise(r => setTimeout(r, 400));
        return {
            activePipelines: 42,
            totalGbProcessedToday: 8945.2,
            failedJobsLast24h: 3,
            averagePipelineLatencyMs: 1240.5
        };
    }

    public static async getPipelineTopology(): Promise<{ nodes: DataNode[], edges: PipelineEdge[] }> {
        await new Promise(r => setTimeout(r, 700));
        const nodes: DataNode[] = [
            { id: 'node_src_prod', name: 'Postgres (Primary)', provider: 'AuroraDB', type: 'INGEST', status: 'ACTIVE', bytesProcessedMb: 14500, recordsPerMinute: 84000 },
            { id: 'node_src_events', name: 'User Telemetry', provider: 'KafkaStream', type: 'INGEST', status: 'ACTIVE', bytesProcessedMb: 42000, recordsPerMinute: 450000 },
            { id: 'node_xf_clean', name: 'PII Sanitization', provider: 'Spark', type: 'TRANSFORM', status: 'ACTIVE', bytesProcessedMb: 52000, recordsPerMinute: 530000 },
            { id: 'node_jn_user', name: 'User Profile Merge', provider: 'dbt', type: 'JOIN', status: 'ACTIVE', bytesProcessedMb: 12000, recordsPerMinute: 84000 },
            { id: 'node_dst_dw', name: 'Enterprise DW', provider: 'Snowflake', type: 'DESTINATION', status: 'ACTIVE' },
            { id: 'node_dst_cache', name: 'Real-time Redis', provider: 'ElastiCache', type: 'DESTINATION', status: 'PAUSED' }
        ];

        const edges: PipelineEdge[] = [
            { id: 'e_1', sourceId: 'node_src_prod', targetId: 'node_xf_clean', frequency: 'REALTIME', latencySeconds: 1.2 },
            { id: 'e_2', sourceId: 'node_src_events', targetId: 'node_xf_clean', frequency: 'REALTIME', latencySeconds: 0.5 },
            { id: 'e_3', sourceId: 'node_xf_clean', targetId: 'node_jn_user', frequency: 'BATCH', latencySeconds: 45 },
            { id: 'e_4', sourceId: 'node_jn_user', targetId: 'node_dst_dw', frequency: 'HOURLY', latencySeconds: 120 },
            { id: 'e_5', sourceId: 'node_src_events', targetId: 'node_dst_cache', frequency: 'REALTIME', latencySeconds: 0.1 }
        ];

        return { nodes, edges };
    }

    public static async getTransformations(nodeId: string): Promise<TransformationStep[]> {
        await new Promise(r => setTimeout(r, 600));
        if (nodeId !== 'node_xf_clean') return [];

        return [
            { id: 'step_1', operationType: 'FILTER', description: 'Remove missing timestamp records', enabled: true },
            { id: 'step_2', operationType: 'MAP', description: 'Hash User Email & Social Security', enabled: true },
            {
                id: 'step_3', operationType: 'SQL_MERGE', description: 'Execute normalization rules', enabled: true, sqlQuery:
                    `WITH NormalizedEvents AS (
  SELECT 
    event_id,
    COALESCE(user_id, 'anonymous') as uid,
    LOWER(event_type) as type,
    CAST(event_value AS DECIMAL(10,2)) as value
  FROM source_stream
  WHERE event_timestamp > current_date - 1
)
SELECT * FROM NormalizedEvents;`
            }
        ];
    }

    public static async getTelemetryJobs(): Promise<JobRunTelemetry[]> {
        await new Promise(r => setTimeout(r, 550));
        return [
            { jobId: 'job_459012', pipelineId: 'node_jn_user', startTime: new Date(Date.now() - 3600000).toISOString(), endTime: new Date(Date.now() - 3400000).toISOString(), state: 'SUCCESS', recordsProcessed: 4509120, totalSizeMb: 1245 },
            { jobId: 'job_459013', pipelineId: 'node_xf_clean', startTime: new Date(Date.now() - 1500000).toISOString(), endTime: new Date(Date.now() - 1000000).toISOString(), state: 'SUCCESS', recordsProcessed: 1450000, totalSizeMb: 520 },
            { jobId: 'job_459014', pipelineId: 'node_dst_dw', startTime: new Date(Date.now() - 800000).toISOString(), state: 'RUNNING', recordsProcessed: 590000, totalSizeMb: 210 },
            { jobId: 'job_459015', pipelineId: 'node_dst_cache', startTime: new Date(Date.now() - 180000).toISOString(), endTime: new Date(Date.now() - 150000).toISOString(), state: 'FAILED', recordsProcessed: 124, totalSizeMb: 0.5, errorLog: 'redis_connection_timeout: Socket closed unexpectedly during multi-key SET operation.' }
        ];
    }
}
