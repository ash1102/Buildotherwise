import { GS_CODES, gettingStartedFinished, gettingStartedResumePath } from "./gettingStartedProgress";

/**
 * Home, a module, or a workbook lesson (anything that is not O.1–O.5).
 * Getting Started steps, the consent page, and the rest of the site stay put.
 */
export function pathRequiresGettingStarted(returnTo) {
  let pathname = "/";
  try {
    pathname = new URL(returnTo || "/", "https://entrepalooza.local").pathname || "/";
  } catch {
    return true;
  }
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
  if (pathname === "/" || pathname === "/module" || pathname.startsWith("/module/")) return true;
  if (pathname.startsWith("/lesson/")) {
    let code = pathname.slice("/lesson/".length);
    try {
      code = decodeURIComponent(code);
    } catch {
      /* keep the raw segment */
    }
    return !GS_CODES.includes(code);
  }
  return false;
}

/**
 * Where to go once sign-in has a user. Admins keep returnTo.
 * A non-admin who still has an open Getting Started step is sent there when
 * returnTo would open the workbook. Other returnTo values are kept.
 */
export function postAuthDestination({ user, returnTo, lessons, answers, states }) {
  const dest = returnTo || "/";
  if (user?.role === "admin") return dest;
  if (!pathRequiresGettingStarted(dest)) return dest;
  if (gettingStartedFinished(lessons, answers, states)) return dest;
  return gettingStartedResumePath(lessons, answers, states);
}
