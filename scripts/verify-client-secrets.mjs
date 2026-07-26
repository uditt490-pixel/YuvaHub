import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import {
  basename,
  extname,
  join,
  relative,
  resolve,
} from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const distDir = resolve(projectRoot, "dist");

const TEXT_EXTENSIONS = new Set([
  ".html",
  ".js",
  ".mjs",
  ".css",
  ".json",
  ".map",
  ".txt",
  ".svg",
]);

const SERVER_ARTIFACTS = new Set([
  "server.cjs",
  "server.cjs.map",
  "server.js",
  "server.js.map",
  "server.mjs",
  "server.mjs.map",
]);

const forbiddenPatterns = [
  {
    label: "server-only environment variable name",
    pattern: /GEMINI_API_KEY/g,
  },
  {
    label: "direct Google Generative Language API endpoint",
    pattern: /generativelanguage\.googleapis\.com/gi,
  },
  {
    label: "Google Gemini SDK in the browser bundle",
    pattern: /@google\/(?:genai|generative-ai)/g,
  },
];

const configuredSecret = process.env.GEMINI_API_KEY?.trim();

if (configuredSecret && configuredSecret.length >= 8) {
  forbiddenPatterns.push({
    label: "configured Gemini API key value",
    pattern: new RegExp(
      configuredSecret.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "g",
    ),
  });
}

function shouldScan(filePath) {
  const fileName = basename(filePath).toLowerCase();

  if (SERVER_ARTIFACTS.has(fileName)) {
    return false;
  }

  return TEXT_EXTENSIONS.has(extname(fileName));
}

function collectFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory)) {
    const absolutePath = join(directory, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      files.push(...collectFiles(absolutePath));
      continue;
    }

    if (shouldScan(absolutePath)) {
      files.push(absolutePath);
    }
  }

  return files;
}

if (!existsSync(distDir)) {
  console.error(
    "[client-secret-check] dist/ does not exist. Run the frontend build first.",
  );
  process.exit(1);
}

const clientFiles = collectFiles(distDir);
const violations = [];

for (const filePath of clientFiles) {
  const contents = readFileSync(filePath, "utf8");

  for (const { label, pattern } of forbiddenPatterns) {
    pattern.lastIndex = 0;

    if (pattern.test(contents)) {
      violations.push({
        file: relative(projectRoot, filePath),
        label,
      });
    }
  }
}

if (violations.length > 0) {
  console.error(
    "[client-secret-check] Potential Gemini exposure detected in browser assets:",
  );

  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.label}`);
  }

  process.exit(1);
}

console.log(
  `[client-secret-check] Passed: scanned ${clientFiles.length} browser build files.`,
);
console.log(
  "[client-secret-check] Server bundles were excluded from this browser-only scan.",
);
console.log(
  "[client-secret-check] No Gemini key, direct Google AI endpoint, or Gemini SDK reference was found in client assets.",
);
