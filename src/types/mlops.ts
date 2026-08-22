export type ModelStatus = 'STAGING' | 'DEPLOYED' | 'ARCHIVED' | 'TRAINING' | 'FAILED';
export type ModelFramework = 'PYTORCH' | 'TENSORFLOW' | 'ONNX' | 'HUGGINGFACE' | 'CUSTOM';
export type QuantizationType = 'FP32' | 'FP16' | 'INT8' | 'INT4';

export interface InferenceTelemetry {
    timestamp: string;
    p99LatencyMs: number;
    averageLatencyMs: number;
    tokensPerSecond: number;
    gpuUtilizationPercentage: number;
    requestsPerSecond: number;
    errorRatePercentage: number;
}

export interface DeploymentConfig {
    instanceType: string;
    gpuCount: number;
    quantization: QuantizationType;
    maxBatchSize: number;
    timeoutSeconds: number;
    cpuCores: number;
    memoryGb: number;
    environmentVariables: Record<string, string>;
}

export interface ModelVersion {
    id: string;
    modelId: string;
    name: string;
    version: string;
    framework: ModelFramework;
    status: ModelStatus;
    createdAt: string;
    authorEmail: string;
    fileSizeBytes: number;
    metrics: {
        trainingLoss: number;
        validationAccuracy: number;
    };
    deploymentConfig?: DeploymentConfig;
    activeEndpointUrl?: string;
    telemetryLogs?: InferenceTelemetry[];
}

export interface MlOpsOverviewMetrics {
    totalDeployedModels: number;
    totalGpuHoursCurrentMonth: number;
    averageClusterUtilization: number;
    totalInferenceRequestsToday: number;
}
