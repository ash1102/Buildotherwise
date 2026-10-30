import React from "react";
import { Navigate } from "react-router-dom";
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
    // Phase 1: Getting Started no longer holds the workbook shut. The welcome stays available at /getting-started.
    finished: true,
    stepsDone,
    resumePath: gettingStartedResumePath(lessons, answers, states),
  };
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
    return <Navigate to={gate.resumePath} replace />;
  }

  return children;
}
