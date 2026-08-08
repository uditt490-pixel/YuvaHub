/**
 * Environment Variable Startup Validator (Issue #588)
 * Validates required environment variables during server initialization.
 */

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  errors: string[];
}

export const REQUIRED_ENV_VARS = [
  { key: "MONGODB_URI", description: "MongoDB connection URI for persistent database storage" },
  { key: "JWT_SECRET", description: "Secret key for signing JWT authentication tokens" },
  { key: "GEMINI_API_KEY", description: "Google Gemini AI service API key for AI assistant features" },
];

/**
 * Validates process environment variables.
 * @param env Environment object (defaults to process.env)
 * @returns EnvValidationResult containing boolean valid flag and arrays of missing/error strings
 */
export function validateEnv(env: Record<string, string | undefined> = process.env): EnvValidationResult {
  const missing: string[] = [];
  const errors: string[] = [];

  for (const item of REQUIRED_ENV_VARS) {
    const val = env[item.key];
    if (!val || val.trim() === "") {
      missing.push(`${item.key}: ${item.description}`);
    }
  }

  // Redis configuration (required if Redis is explicitly enabled)
  const isRedisEnabled =
    env.ENABLE_REDIS === "true" ||
    env.REDIS_ENABLED === "true" ||
    env.REQUIRE_REDIS === "true";

  if (isRedisEnabled) {
    const redisUrl = env.REDIS_URL;
    if (!redisUrl || redisUrl.trim() === "") {
      missing.push("REDIS_URL: Redis connection URL (Required when Redis is enabled via ENABLE_REDIS/REDIS_ENABLED/REQUIRE_REDIS)");
    }
  }

  return {
    valid: missing.length === 0 && errors.length === 0,
    missing,
    errors,
  };
}

/**
 * Executes startup validation and terminates process if required variables are missing.
 * @param env Environment object
 * @param shouldExit Whether process.exit(1) should be called on validation failure
 */
export function validateStartupEnv(
  env: Record<string, string | undefined> = process.env,
  shouldExit: boolean = true
): EnvValidationResult {
  const result = validateEnv(env);

  if (!result.valid) {
    console.error("========================================================================");
    console.error(" ❌ FATAL CONFIGURATION ERROR: MISSING REQUIRED ENVIRONMENT VARIABLES ");
    console.error("========================================================================");
    console.error("The server cannot start because required environment variables are missing:\n");
    result.missing.forEach((item) => {
      console.error(`  ✖ ${item}`);
    });
    console.error("\nPlease configure these variables in your .env file or deployment environment.");
    console.error("========================================================================");

    if (shouldExit && env.NODE_ENV !== "test" && env.SKIP_ENV_VALIDATION !== "true") {
      process.exit(1);
    }
  }

  return result;
}
