import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { queryClientInstance } from "@/lib/query-client";

const THRESHOLD = 72;
const MAX_PULL = 110;

/**
 * Pull down from the top of the page to reload the data on screen. It only starts when
 * the page is scrolled to the top and is ignored inside open dialogs and the journal panel.
 */
export default function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let startY = 0;
    let tracking = false;
    let distance = 0;

    const isBlocked = (target) =>
      document.body.style.overflow === "hidden" ||
      Boolean(target?.closest?.('[role="dialog"], [role="alertdialog"]'));

    const onStart = (event) => {
      if (window.scrollY > 0 || event.touches.length !== 1 || isBlocked(event.target)) {
        tracking = false;
        return;
      }
      startY = event.touches[0].clientY;
      distance = 0;
      tracking = true;
    };

    const onMove = (event) => {
      if (!tracking) return;
      const dy = event.touches[0].clientY - startY;
      if (dy <= 0 || window.scrollY > 0) {
        distance = 0;
        setPull(0);
        return;
      }
      distance = Math.min(dy * 0.5, MAX_PULL);
      setPull(distance);
    };

    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      if (distance >= THRESHOLD) {
        setRefreshing(true);
        setPull(THRESHOLD);
        Promise.resolve(queryClientInstance.invalidateQueries()).finally(() => {
          setRefreshing(false);
          setPull(0);
        });
      } else {
        setPull(0);
      }
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd);
    document.addEventListener("touchcancel", onEnd);
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  if (pull <= 0 && !refreshing) return null;

  return (
    <div
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-x-0 z-40 flex justify-center"
      style={{ top: "calc(env(safe-area-inset-top) + 4.5rem)" }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-primary shadow-md"
        style={{
          transform: `translateY(${pull / 2}px)`,
          opacity: Math.min(pull / THRESHOLD, 1),
        }}
      >
        <RefreshCw
          className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          style={refreshing ? undefined : { transform: `rotate(${pull * 3}deg)` }}
        />
      </div>
    </div>
  );
}
