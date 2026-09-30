// Resolve the app's @ alias in Node's isolated test processes. No app server or .env loading.
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const base = path.resolve("src", specifier.slice(2));
      const file = [base, `${base}.ts`, `${base}.tsx`].find(existsSync);
      if (file) return nextResolve(pathToFileURL(file).href, context);
    }
    return nextResolve(specifier, context);
  },
});
