import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { rememberWelcomeReturn } from "@/lib/welcomeReturn";
import useCurriculum from "@/hooks/useCurriculum";
import { useAuth } from "@/lib/AuthContext";
import { gettingStartedFinished, gettingStartedResumePath } from "@/lib/gettingStartedProgress";
import { useWorkbook } from "@/lib/workbook";
import { useSyncStatus } from "@/lib/accountSync";

/** Admins walk into the workbook. Everyone else finishes Getting Started first. */
export function useWorkbookGate() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { lessons, loading, error } = useCurriculum();
  const { answers, states } = useWorkbook();
  const sync = useSyncStatus();
  const admin = Boolean(isAuthenticated && user?.role === "admin");
  // On a new device, wait for the account copy before deciding where someone is.
  const pending = isLoadingAuth || loading || (isAuthenticated && (sync === "loading" || sync === "idle"));
  const stepsDone = gettingStartedFinished(lessons, answers, states);
  return {
    admin,
    pending,
    error,
    hasLessons: (lessons || []).length > 0,
    finished: admin || stepsDone,
    stepsDone,
    resumePath: gettingStartedResumePath(lessons, answers, states),
  };
}

/** Sends someone to the welcome and remembers the module or step they asked for, so they can be returned to it. */
export function GettingStartedRedirect({ to }) {
  const location = useLocation();
  rememberWelcomeReturn(location.pathname + location.search);
  return <Navigate to={to} replace />;
}

/**
 * Stands in front of the workbook and the module pages.
 * Sends someone to the Getting Started step they have not finished.
 */
export default function WorkbookGate({ children }) {
  const gate = useWorkbookGate();

  if (gate.pending) {
    return <p className="py-10 text-[16px] text-muted-faint">Opening the workbook…</p>;
  }

  if (gate.error && !gate.hasLessons && !gate.admin) {
    return <p className="py-10 text-[16px] text-muted-foreground">The workbook didn’t load. Refresh the page.</p>;
  }

  if (!gate.finished) {
    return <GettingStartedRedirect to={gate.resumePath} />;
  }

  return children;
}
