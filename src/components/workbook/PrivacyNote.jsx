import React from "react";
import { Lock } from "lucide-react";

/**
 * Wording here matches the implementation exactly: everything typed is held in
 * this browser, and nothing leaves it unless the person submits or shares it.
 */
export default function PrivacyNote({ children }) {
  return (
    <p className="flex items-start gap-2 text-[13px] leading-relaxed text-teal-deep/75">
      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-copper" aria-hidden="true" />
      <span>
        {children ||
          "Kept in this browser only. Nothing you type here is sent to Entrepalooza unless you choose to share it."}
      </span>
    </p>
  );
}