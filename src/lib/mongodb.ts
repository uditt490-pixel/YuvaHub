import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";

const commandUri = process.env.MONGODB_COMMAND_URI || uri;

const queryUri = process.env.MONGODB_QUERY_URI || uri;

const dbName = process.env.MONGODB_DB_NAME || "yuvahub";

let commandClient: MongoClient | null = null;
let queryClient: MongoClient | null = null;

let commandDb: Db | null = null;
let queryDb: Db | null = null;

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

const POOL_CONFIG = {
  maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || "50", 10),
  minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || "5", 10),
  maxIdleTimeMS: 120000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

function exponentialBackoff(attempt: number): number {
  return Math.min(BASE_DELAY_MS * Math.pow(2, attempt), 30000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry(
  client: MongoClient,
  label: string,
  uriPreview: string,
): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await client.connect();
      console.log(`[MongoDB] ${label} DB connected`);
      return;
    } catch (err) {
      const delay = exponentialBackoff(attempt);
      console.error(
        `[MongoDB] ${label} connection attempt ${attempt}/${MAX_RETRIES} failed. Retrying in ${delay}ms...`,
        (err as Error).message,
      );
      if (attempt < MAX_RETRIES) {
        await sleep(delay);
      } else {
        throw new Error(
          `[MongoDB] ${label} connection failed after ${MAX_RETRIES} attempts. URI: ${uriPreview}`,
        );
      }
    }
  }
}

async function connectCommandDB(): Promise<Db> {
  if (commandDb) {
    return commandDb;
  }

  if (!commandUri) {
    throw new Error(
      "MongoDB command URI missing. Set MONGODB_URI or MONGODB_COMMAND_URI environment variable.",
    );
  }

  commandClient = new MongoClient(commandUri, POOL_CONFIG);

  await connectWithRetry(commandClient, "Command", commandUri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"));

  commandDb = commandClient.db(process.env.MONGODB_COMMAND_DB || dbName);

  return commandDb;
}

async function connectQueryDB(): Promise<Db> {
  if (queryDb) {
    return queryDb;
  }

  if (!queryUri) {
    throw new Error(
      "MongoDB query URI missing. Set MONGODB_URI or MONGODB_QUERY_URI environment variable.",
    );
  }

  queryClient = new MongoClient(queryUri, POOL_CONFIG);

  await connectWithRetry(queryClient, "Query", queryUri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"));

  queryDb = queryClient.db(process.env.MONGODB_QUERY_DB || dbName);

  return queryDb;
}

export async function getCommandDB() {
  return connectCommandDB();
}

export async function getQueryDB() {
  return connectQueryDB();
}

export async function closeMongoConnections() {
  if (commandClient) {
    await commandClient.close();
    commandClient = null;
    commandDb = null;
  }

  if (queryClient) {
    await queryClient.close();
    queryClient = null;
    queryDb = null;
  }
}

export { POOL_CONFIG, MAX_RETRIES, exponentialBackoff };
