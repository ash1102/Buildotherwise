import React from "react";
import { Lock } from "lucide-react";

/**
 * The one short storage line, shown once near the writing rather than repeated
 * under every field. The wording matches the implementation exactly.
 */
export default function PrivacyNote({ children }) {
  return (
    <p className="flex items-start gap-2 text-[14px] leading-relaxed text-muted-faint">
      <span
        role="img"
        aria-label="Entrepalooza storage note"
        title="Added by Entrepalooza, about where your words are kept."
        className="mt-1 inline-flex shrink-0"
      >
        <Lock className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
      </span>
      <span>
        {children || "Saved to your account. Other participants can’t see it. Ashley runs the app, so she can see what’s stored."}
      </span>
    </p>
  );
}