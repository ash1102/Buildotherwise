import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import useCurriculum from "@/hooks/useCurriculum";
import {
  GS_CODES,
  markSeen,
  readSeen,
  useGettingStartedSubmitted,
  useOpenGettingStartedListener,
} from "@/lib/gettingStarted";
import GettingStartedPopup from "./GettingStartedPopup";

/**
 * Opens Getting Started by itself on someone's first visit after logging in. After
 * that it only opens when asked (the home page button). Once submitted it never
 * opens again.
 */
export default function GettingStartedHost() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const submitted = useGettingStartedSubmitted();
  const { lessons, loading } = useCurriculum();
  const [open, setOpen] = useState(false);

  const hasSteps = (lessons || []).some((lesson) => GS_CODES.includes(lesson.code));
  const skipHere = pathname.startsWith("/preview") || pathname.startsWith("/login") || pathname.startsWith("/register");

  useEffect(() => {
    if (!isAuthenticated || loading || !hasSteps || submitted || skipHere) return;
    if (!readSeen()) {
      markSeen();
      setOpen(true);
    }
  }, [isAuthenticated, loading, hasSteps, submitted, skipHere]);

  const reopen = useCallback(() => {
    if (!submitted) setOpen(true);
  }, [submitted]);
  useOpenGettingStartedListener(reopen);

  if (!open || !isAuthenticated || !hasSteps) return null;
  return <GettingStartedPopup lessons={lessons} onClose={() => setOpen(false)} />;
}
