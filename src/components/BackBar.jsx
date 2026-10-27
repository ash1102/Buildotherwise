import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/** Pages that already have their own way back (or are a tab root) get no bar here. */
const OWN_BACK_LINK = [/^\/module\//, /^\/lesson\//, /^\/journal\/reflect/, /^\/aspect\//, /^\/getting-started/, /^\/preview/];
const TAB_ROOTS = ["/", "/journal", "/map", "/my-records"];
const NO_NAV_PAGES = ["/login", "/register", "/forgot-password", "/reset-password", "/oauth/consent"];

export function needsBackBar(pathname) {
  if (TAB_ROOTS.includes(pathname) || NO_NAV_PAGES.includes(pathname)) return false;
  return !OWN_BACK_LINK.some((pattern) => pattern.test(pathname));
}

/** Where Back goes when there is no earlier page in the app, such as after opening a link directly. */
function fallbackFor(pathname) {
  if (pathname.startsWith("/record")) return "/my-records";
  return "/";
}

/** A consistent Back control at the top of a non-root page. */
export default function BackBar() {
  const navigate = useNavigate();
  const { pathname, key } = useLocation();

  const goBack = () => {
    // React Router gives the first page of a session the key "default": nothing earlier in the app to return to.
    if (key !== "default") navigate(-1);
    else navigate(fallbackFor(pathname), { replace: true });
  };

  return (
    <div className="no-print mb-4">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-md px-2 text-[15px] font-medium text-accent-ink transition hover:bg-secondary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </button>
    </div>
  );
}
