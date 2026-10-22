import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Composer({ value, onChange, onSend, busy }) {
  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="mt-4">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        aria-label="Your message to the reflection agent"
        placeholder="Write what you want to reflect on, or bring an entry in first."
        className="resize-y bg-card text-[14px]"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[12px] text-ink-faint">Ctrl or ⌘ + Enter sends</span>
        <Button
          type="button"
          onClick={onSend}
          disabled={busy || !value.trim()}
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {busy ? "Reflecting…" : "Send"}
        </Button>
      </div>
    </div>
  );
}