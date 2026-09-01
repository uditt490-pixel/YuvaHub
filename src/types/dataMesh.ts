export type NodeType = 'INGEST' | 'TRANSFORM' | 'JOIN' | 'ANALYTICS' | 'DESTINATION';
export type JobState = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'RETRYING';
export type SyncFrequency = 'REALTIME' | 'HOURLY' | 'DAILY' | 'BATCH';

export interface DataNode {
    id: string;
    name: string;
    provider: string; // e.g. "Kafka", "Snowflake", "Postgres"
    type: NodeType;
    status: 'ACTIVE' | 'PAUSED' | 'ERROR';
    bytesProcessedMb?: number;
    recordsPerMinute?: number;
}

export interface PipelineEdge {
    id: string;
    sourceId: string;
    targetId: string;
    frequency: SyncFrequency;
    latencySeconds: number;
}

export interface JobRunTelemetry {
    jobId: string;
    pipelineId: string;
    startTime: string;
    endTime?: string;
    state: JobState;
    recordsProcessed: number;
    totalSizeMb: number;
    errorLog?: string;
}

export interface TransformationStep {
    id: string;
    operationType: 'FILTER' | 'MAP' | 'AGGREGATE' | 'CAST' | 'SQL_MERGE';
    description: string;
    sqlQuery?: string;
    enabled: boolean;
}

export interface DataMeshOverview {
    activePipelines: number;
    totalGbProcessedToday: number;
    failedJobsLast24h: number;
    averagePipelineLatencyMs: number;
}
