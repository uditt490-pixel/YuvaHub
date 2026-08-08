import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const envExample = readFileSync(resolve(root, ".env.example"), "utf8");

const ignoredDirectories = new Set([
  ".git",
  "coverage",
  "dist",
  "node_modules",
]);

const supportedExtensions = new Set([
  ".cjs",
  ".js",
  ".mjs",
  ".ts",
  ".tsx",
]);

const viteBuiltIns = new Set(["DEV", "MODE", "PROD", "SSR", "BASE_URL"]);

const intentionallyUndocumented = new Set([
  // Dynamic keys are documented using their supported prefix.
]);

function walk(directory: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue;

    const path = join(directory, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      files.push(...walk(path));
    } else if (supportedExtensions.has(extname(entry))) {
      files.push(path);
    }
  }

  return files;
}

function documentedVariables(): Set<string> {
  return new Set(
    [...envExample.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map(
      (match) => match[1],
    ),
  );
}

function directlyUsedVariables(): Set<string> {
  const variables = new Set<string>();

  for (const file of walk(root)) {
    const content = readFileSync(file, "utf8");

    for (const match of content.matchAll(
      /process\.env\.([A-Z][A-Z0-9_]*)/g,
    )) {
      variables.add(match[1]);
    }

    for (const match of content.matchAll(
      /import\.meta\.env\.([A-Z][A-Z0-9_]*)/g,
    )) {
      if (!viteBuiltIns.has(match[1])) {
        variables.add(match[1]);
      }
    }
  }

  return variables;
}

function assignedValue(variable: string): string | undefined {
  return envExample
    .match(new RegExp(`^${variable}=(.*)$`, "m"))?.[1]
    ?.trim();
}

describe(".env.example", () => {
  it("documents every directly accessed environment variable", () => {
    const documented = documentedVariables();
    const missing = [...directlyUsedVariables()]
      .filter((variable) => !intentionallyUndocumented.has(variable))
      .filter((variable) => !documented.has(variable))
      .sort();

    expect(missing).toEqual([]);
  });

  it("documents dynamic scraper URL configuration", () => {
    expect(envExample).toContain("SCRAPER_URL_<NORMALIZED_SOURCE_NAME>");
    expect(envExample).toContain("SCRAPER_URL_DEVPOST=");
  });

  it("includes the variables requested by issue #385", () => {
    expect(envExample).toContain("NODE_ENV=");
    expect(envExample).toContain("LOG_LEVEL=");
    expect(envExample).toContain("CORS_ORIGINS=");
  });

  it("keeps server secrets blank", () => {
    const secrets = [
      "MONGODB_URI",
      "MONGODB_COMMAND_URI",
      "MONGODB_QUERY_URI",
      "JWT_SECRET",
      "JWT_REFRESH_SECRET",
      "GEMINI_API_KEY",
      "REDIS_URL",
      "RABBITMQ_URL",
      "MEILI_MASTER_KEY",
      "FIREBASE_SERVICE_ACCOUNT_BASE64",
      "FIREBASE_SERVICE_ACCOUNT_KEY",
      "CLOUDINARY_API_SECRET",
      "SMTP_USER",
      "SMTP_PASS",
      "SENTRY_AUTH_TOKEN",
    ];

    for (const secret of secrets) {
      expect(assignedValue(secret), secret).toBe("");
    }
  });

  it("does not expose known server secrets through Vite", () => {
    const forbidden = [
      "VITE_MONGODB_URI",
      "VITE_JWT_SECRET",
      "VITE_JWT_REFRESH_SECRET",
      "VITE_GEMINI_API_KEY",
      "VITE_REDIS_URL",
      "VITE_RABBITMQ_URL",
      "VITE_FIREBASE_SERVICE_ACCOUNT_BASE64",
      "VITE_CLOUDINARY_API_SECRET",
      "VITE_SMTP_PASS",
      "VITE_SENTRY_AUTH_TOKEN",
    ];

    for (const variable of forbidden) {
      expect(envExample).not.toContain(`${variable}=`);
    }
  });

  it("does not use credential-like placeholder values", () => {
    expect(envExample).not.toMatch(
      /=\s*(your_|YOUR_|replace_me|changeme|example_secret)/,
    );
  });
});
