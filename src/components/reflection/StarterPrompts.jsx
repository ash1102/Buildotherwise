import React from "react";

export default function StarterPrompts({ prompts, onPick }) {
  return (
    <section className="space-y-3">
      <p className="workbook-label">Ways to start</p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="rounded-full border border-natural-deep bg-card px-3.5 py-2 text-left text-[13px] leading-snug text-ink-soft transition hover:border-teal-deep/40 hover:text-teal-deep"
          >
            {prompt}
          </button>
        ))}
      </div>
      <p className="text-[12.5px] text-ink-faint">Choosing one puts it in the message box, ready to send.</p>
    </section>
  );
}