/** Confirmation tokens are accepted only from the URL fragment, never the query string. */
export function tokenFromLocationHash(hash: string): string | null {
  return new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash).get("token");
}