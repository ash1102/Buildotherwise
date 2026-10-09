/** This app's own MCP server address, resolved from wherever the app is being served. */
export function serverUrl() {
  return new URL("/api/mcp", window.location.origin).toString();
}