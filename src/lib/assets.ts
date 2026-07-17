/** Resolve a public asset against Vite's base URL. */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}
