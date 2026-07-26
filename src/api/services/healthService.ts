import { dbCommand, dbQuery } from "../db.js";

export type DatabaseHealth = "connected" | "disconnected";

export interface HealthSnapshot {
  status: "ok" | "degraded";
  service: "YuvaHub API";
  timestamp: string;
  database: DatabaseHealth;
  uptimeSeconds: number;
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
