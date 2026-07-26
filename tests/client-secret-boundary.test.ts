import {
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { extname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");

const CLIENT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
]);

const FORBIDDEN_CLIENT_PATTERNS = [
  /process\.env\.GEMINI_API_KEY/g,
  /import\.meta\.env\.GEMINI_API_KEY/g,
  /generativelanguage\.googleapis\.com/gi,
  /from\s+["']@google\/(?:genai|generative-ai)["']/g,
];

function collectClientFiles(directory: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(directory)) {
    const absolutePath = join(directory, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      files.push(...collectClientFiles(absolutePath));
      continue;
    }

    if (
      CLIENT_EXTENSIONS.has(extname(entry)) &&
      !absolutePath.includes(`${join("src", "api")}`) &&
      !absolutePath.includes(`${join("src", "workers")}`) &&
      !absolutePath.includes(`${join("src", "consumers")}`) &&
      !absolutePath.endsWith("applicationGenerator.ts") &&
      !absolutePath.endsWith("embedding.ts") &&
      !absolutePath.endsWith("toxicity.ts") &&
      !absolutePath.includes(`${join("services", "agent")}`)
    ) {
      files.push(absolutePath);
    }
  }

  return files;
}

describe("Gemini client/server security boundary", () => {
  it("does not expose GEMINI_API_KEY through Vite configuration", () => {
    const config = readFileSync(
      join(projectRoot, "vite.config.ts"),
      "utf8",
    );

    expect(config).not.toMatch(/define\s*:\s*\{[\s\S]*GEMINI_API_KEY/);
    expect(config).not.toContain(
      "'process.env.GEMINI_API_KEY'",
    );
    expect(config).toContain(
      'loadEnv(mode, ".", ["VITE_", "SENTRY_"])',
    );
  });

  it("keeps browser AI requests behind the Express proxy", () => {
    const browserGeminiService = readFileSync(
      join(projectRoot, "src", "services", "gemini.ts"),
      "utf8",
    );

    expect(browserGeminiService).toContain(
      'fetch("/api/v1/ai/generate"',
    );
    expect(browserGeminiService).not.toMatch(
      /GoogleGenAI|GoogleGenerativeAI/,
    );
    expect(browserGeminiService).not.toMatch(
      /GEMINI_API_KEY|generativelanguage\.googleapis\.com/,
    );
  });

  it("finds no direct Gemini secret or SDK use in browser modules", () => {
    const violations: string[] = [];

    for (const filePath of collectClientFiles(
      join(projectRoot, "src"),
    )) {
      const contents = readFileSync(filePath, "utf8");

      for (const pattern of FORBIDDEN_CLIENT_PATTERNS) {
        pattern.lastIndex = 0;

        if (pattern.test(contents)) {
          violations.push(
            filePath.replace(`${projectRoot}/`, ""),
          );
        }
      }
    }

    expect([...new Set(violations)]).toEqual([]);
  });
});
