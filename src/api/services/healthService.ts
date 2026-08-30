import { dbCommand, dbQuery } from "../db.js";

export type DatabaseHealth = "connected" | "disconnected";
export type ServiceHealth = "connected" | "disconnected" | "disabled";

export interface HealthSnapshot {
  status: "ok" | "degraded";
  service: "YuvaHub API";
  timestamp: string;
  database: DatabaseHealth;
  uptimeSeconds: number;
}

export interface StartupHealthReport {
  database: DatabaseHealth;
  redis: ServiceHealth;
  rabbitmq: ServiceHealth;
  aiProvider: ServiceHealth;
  firebase: ServiceHealth;
  timestamp: string;
}

type DatabaseLike = {
  isMock?: boolean;
  command?: (command: Record<string, unknown>) => Promise<unknown>;
};

export interface HealthDependencies {
  getCommandDatabase?: () => DatabaseLike | null;
  getQueryDatabase?: () => DatabaseLike | null;
  now?: () => Date;
  uptime?: () => number;
}

export interface StartupHealthDependencies {
  getCommandDatabase?: () => DatabaseLike | null;
  getQueryDatabase?: () => DatabaseLike | null;
  redisClient?: { status?: string; ping?: () => Promise<string> } | null;
  rabbitmqConnection?: { close?: () => Promise<void> } | null;
  geminiApiKey?: string;
  firebaseInitialized?: boolean;
  now?: () => Date;
}

const isLiveDatabase = (database: DatabaseLike | null): boolean =>
  Boolean(database && database.isMock !== true);

export async function checkDatabaseHealth(
  commandDatabase: DatabaseLike | null,
  queryDatabase: DatabaseLike | null,
): Promise<DatabaseHealth> {
  if (
    !isLiveDatabase(commandDatabase) ||
    !isLiveDatabase(queryDatabase)
  ) {
    return "disconnected";
  }

  try {
    if (typeof commandDatabase?.command === "function") {
      await commandDatabase.command({ ping: 1 });
    }

    if (
      queryDatabase !== commandDatabase &&
      typeof queryDatabase?.command === "function"
    ) {
      await queryDatabase.command({ ping: 1 });
    }

    return "connected";
  } catch {
    return "disconnected";
  }
}

/**
 * Check Redis connectivity. Returns 'disabled' when no client is provided,
 * 'connected' when the client is ready and responds to PING, or
 * 'disconnected' on failure.
 */
export async function checkRedisHealth(
  client: { status?: string; ping?: () => Promise<string> } | null | undefined,
): Promise<ServiceHealth> {
  if (!client) return "disabled";
  try {
    if (client.status === "ready" && typeof client.ping === "function") {
      await client.ping();
    } else if (client.status !== "ready") {
      return "disconnected";
    }
    return "connected";
  } catch {
    return "disconnected";
  }
}

/**
 * Check RabbitMQ connectivity. Returns 'disabled' when no connection is
 * provided, 'connected' when the channel is open, or 'disconnected' on
 * failure.
 */
export async function checkRabbitMQHealth(
  connection: { createChannel?: () => Promise<any>; close?: () => Promise<void> } | null | undefined,
): Promise<ServiceHealth> {
  if (!connection) return "disabled";
  try {
    if (typeof connection.createChannel === "function") {
      const channel = await connection.createChannel();
      await channel.close();
    }
    return "connected";
  } catch {
    return "disconnected";
  }
}

/**
 * Check AI provider (Gemini) availability. Returns 'connected' when the API
 * key is configured, or 'disconnected' when missing.
 */
export function checkAIProviderHealth(
  geminiApiKey: string | undefined,
): ServiceHealth {
  if (!geminiApiKey || geminiApiKey.trim() === "") return "disconnected";
  return "connected";
}

/**
 * Check Firebase Admin SDK initialization. Returns 'connected' when
 * initialized, 'disabled' when not configured, or 'disconnected' on
 * failure.
 */
export function checkFirebaseHealth(
  initialized: boolean | undefined,
): ServiceHealth {
  if (initialized === undefined) return "disabled";
  return initialized ? "connected" : "disconnected";
}

export async function getHealthSnapshot(
  dependencies: HealthDependencies = {},
): Promise<HealthSnapshot> {
  const commandDatabase =
    dependencies.getCommandDatabase?.() ?? dbCommand;
  const queryDatabase =
    dependencies.getQueryDatabase?.() ?? dbQuery;

  const database = await checkDatabaseHealth(
    commandDatabase,
    queryDatabase,
  );

  return {
    status: database === "connected" ? "ok" : "degraded",
    service: "YuvaHub API",
    timestamp: (dependencies.now?.() ?? new Date()).toISOString(),
    database,
    uptimeSeconds: Math.max(
      0,
      Math.floor(dependencies.uptime?.() ?? process.uptime()),
    ),
  };
}

/**
 * Run startup health checks for all configured services and return a
 * summary report. Each service is checked independently — failures in
 * optional services (Redis, RabbitMQ, Firebase) are reported but do not
 * block startup.
 */
export async function runStartupHealthChecks(
  dependencies: StartupHealthDependencies = {},
): Promise<StartupHealthReport> {
  const commandDatabase =
    dependencies.getCommandDatabase?.() ?? dbCommand;
  const queryDatabase =
    dependencies.getQueryDatabase?.() ?? dbQuery;

  const [database, redis, rabbitmq] = await Promise.all([
    checkDatabaseHealth(commandDatabase, queryDatabase),
    checkRedisHealth(dependencies.redisClient),
    checkRabbitMQHealth(dependencies.rabbitmqConnection),
  ]);

  const aiProvider = checkAIProviderHealth(dependencies.geminiApiKey);
  const firebase = checkFirebaseHealth(dependencies.firebaseInitialized);

  return {
    database,
    redis,
    rabbitmq,
    aiProvider,
    firebase,
    timestamp: (dependencies.now?.() ?? new Date()).toISOString(),
  };
}

/**
 * Log the startup health check summary to the console. Returns the report
 * for further use.
 */
export async function logStartupHealthReport(
  dependencies: StartupHealthDependencies = {},
): Promise<StartupHealthReport> {
  const report = await runStartupHealthChecks(dependencies);

  const divider = "=".repeat(60);
  console.log(divider);
  console.log("  STARTUP HEALTH CHECK SUMMARY");
  console.log(divider);

  const services: Array<[string, string]> = [
    ["MongoDB", report.database],
    ["Redis", report.redis],
    ["RabbitMQ", report.rabbitmq],
    ["AI Provider (Gemini)", report.aiProvider],
    ["Firebase", report.firebase],
  ];

  for (const [name, status] of services) {
    const icon = status === "connected" ? "✅" : status === "disabled" ? "⏭️ " : "❌";
    console.log(`  ${icon} ${name}: ${status}`);
  }

  const allRequired = report.database === "connected" && report.aiProvider === "connected";
  const overallStatus = allRequired ? "✅ READY" : "⚠️  DEGRADED";
  console.log(divider);
  console.log(`  Overall: ${overallStatus}`);
  console.log(divider);

  return report;
}
