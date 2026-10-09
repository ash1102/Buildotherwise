import React from "react";
import { Lock } from "lucide-react";

/**
 * Wording here matches the implementation exactly: everything typed is held in
 * this browser, and nothing leaves it unless the person submits or shares it.
 * The mark is labelled so it reads as this app's own storage note.
 */
export default function PrivacyNote({ children }) {
  return (
    <p className="flex items-start gap-2 text-[13px] leading-relaxed text-teal-deep/75">
      <span
        role="img"
        aria-label="Entrepalooza storage note"
        title="Added by Entrepalooza, about where your words are kept."
        className="mt-0.5 inline-flex shrink-0"
      >
        <Lock className="h-3.5 w-3.5 text-copper" aria-hidden="true" />
      </span>
      <span>
        {children ||
          "Kept in this browser only. Nothing you type here is sent to Entrepalooza unless you choose to share it."}
      </span>
    </p>
  );
}