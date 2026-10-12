import React from "react";
import { TAG_LABELS } from "@/lib/preview/tags";

const TONES = {
  ok: "border-primary/40 bg-primary-wash text-foreground",
  warn: "border-accent-soft bg-accent-wash text-foreground",
  muted: "border-border bg-secondary text-muted-faint",
};

/**
 * Says where a block's words came from. Shown to everyone, because a reviewer
 * cannot judge wording they cannot tell apart.
 */
export default function ContentTag({ tag, compact = false }) {
  const meta = TAG_LABELS[tag];
  if (!meta) return null;
  return (
    <span
      title={meta.long}
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-medium ${TONES[meta.tone]}`}
    >
      {compact ? meta.short.split(" — ")[0].split(": ")[0] : meta.short}
    </span>
  );
}