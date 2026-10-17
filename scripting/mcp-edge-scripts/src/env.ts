const ENV_PATTERNS = [
  /process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g,
  /process\.env\[\s*["'`]([A-Za-z_][A-Za-z0-9_]*)["'`]\s*\]/g,
  /Deno\.env\.get\(\s*["'`]([A-Za-z_][A-Za-z0-9_]*)["'`]\s*\)/g,
];

// Bundled libraries read these to tune their own behavior, such as Express's
// dependencies checking DEBUG and NODE_ENV. Nobody needs to set them.
const LIBRARY_ENV_NAMES = new Set([
  "DEBUG",
  "NODE_DEBUG",
  "NODE_ENV",
  "NO_DEPRECATION",
  "TRACE_DEPRECATION",
]);

// Names the code reads with a literal key. A dynamic lookup such as
// process.env[key] can't be found this way, so it's never reported.
export function envNamesIn(code: string): string[] {
  const names = new Set<string>();
  for (const pattern of ENV_PATTERNS) {
    for (const match of code.matchAll(pattern)) {
      const name = match[1];
      if (name && !LIBRARY_ENV_NAMES.has(name)) {
        names.add(name);
      }
    }
  }

  return [...names].sort();
}

export function missingEnv(
  code: string,
  available: Iterable<string>,
  ignore: Iterable<string> = [],
): string[] {
  const known = new Set([...available, ...ignore]);

  return envNamesIn(code).filter((name) => !known.has(name));
}
