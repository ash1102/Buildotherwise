import { pathRequiresGettingStarted } from "./postAuthPath";

/**
 * Where to send someone after the Getting Started welcome (O.1) if they first asked for a
 * specific module or step. Navigation state only: a path, kept for this browser tab, never
 * written to the account or the workbook store, and never anything the person typed.
 */
const KEY = "ep.afterWelcome";

/** A same-origin workbook path (module or step), or null. The dashboard is the default, so "/" is null too. */
export function cleanWelcomeReturn(raw) {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return null;
  let url;
  try {
    url = new URL(raw, "https://entrepalooza.local");
  } catch {
    return null;
  }
  if (url.origin !== "https://entrepalooza.local") return null;
  const pathname = url.pathname.length > 1 && url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;
  if (pathname === "/" || pathname === "/module" || pathname === "/module/getting-started") return null;
  if (!pathRequiresGettingStarted(pathname)) return null;
  return pathname + url.search;
}

function tabStorage() {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

/** Remember the module or step someone asked for before the welcome sent them to O.1. */
export function rememberWelcomeReturn(raw, storage = tabStorage()) {
  const path = cleanWelcomeReturn(raw);
  if (!path || !storage) return;
  try {
    storage.setItem(KEY, path);
  } catch {
    /* the dashboard is the fallback */
  }
}

/** Where to go after the welcome: the remembered module or step, else the dashboard. Clears the memory. */
export function takeWelcomeDestination(storage = tabStorage()) {
  if (!storage) return "/";
  let raw = null;
  try {
    raw = storage.getItem(KEY);
    storage.removeItem(KEY);
  } catch {
    return "/";
  }
  return cleanWelcomeReturn(raw) || "/";
}
