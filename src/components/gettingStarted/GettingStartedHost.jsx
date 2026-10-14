import React, { useCallback, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import useCurriculum from "@/hooks/useCurriculum";
import { GS_CODES, useGettingStartedSubmitted, useOpenGettingStartedListener } from "@/lib/gettingStarted";
import GettingStartedPopup from "./GettingStartedPopup";

/**
 * The workbook gate is the Getting Started page, not this popup.
 * This opens only when something asks for it. It does not open on its own,
 * and closing it does not count as finishing the five steps.
 */
export default function GettingStartedHost() {
  const { isAuthenticated } = useAuth();
  const submitted = useGettingStartedSubmitted();
  const { lessons } = useCurriculum();
  const [open, setOpen] = useState(false);

  const hasSteps = (lessons || []).some((lesson) => GS_CODES.includes(lesson.code));

  const reopen = useCallback(() => {
    if (!submitted) setOpen(true);
  }, [submitted]);
  useOpenGettingStartedListener(reopen);

  if (!open || !isAuthenticated || !hasSteps) return null;
  return <GettingStartedPopup lessons={lessons} onClose={() => setOpen(false)} />;
}
