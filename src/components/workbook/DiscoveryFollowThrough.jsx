import React from "react";
import { Link } from "react-router-dom";
import { useAnswers, answerKey } from "@/lib/workbook";
import { OPTIONS } from "./DiscoverySampler";

export default function DiscoveryFollowThrough() {
  const answers = useAnswers();
  const choice = (answers || {})[answerKey("M2-L1", 20)];
  const selected = OPTIONS.find((item) => item.id === choice);

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5" aria-label="Your guided exploration">
      <h3 className="text-[20px] font-semibold text-foreground">Work with something concrete</h3>
      {selected ? (
        <>
          <p className="text-[15px] text-muted-foreground">You explored: <strong className="text-foreground">{selected.field}</strong>. Your choice came forward from Lesson 1; you don't need to choose it again.</p>
          <p className="text-[16px] leading-relaxed text-foreground">{selected.fact}</p>
          <div className="rounded-lg bg-secondary p-4">
            <p className="font-medium text-foreground">A guided observation</p>
            <p className="mt-2 text-[16px] leading-relaxed text-foreground">{selected.task}</p>
          </div>
          <p className="text-[15px] text-foreground">As you investigate, distinguish <strong>what the source actually shows</strong> from <strong>what you're inferring</strong>. You may decide to look at another source before drawing a conclusion.</p>
          <a href={selected.source} target="_blank" rel="noopener noreferrer" className="inline-block text-[15px] text-accent-ink underline underline-offset-2">Open the official occupation profile ↗</a>
        </>
      ) : (
        <>
          <p className="text-[16px] leading-relaxed text-foreground">You haven't selected a discovery from Lesson 1 yet. That's fine: visit the sampler and explore one, or use an activity you've already encountered.</p>
          <Link to="/workbook" className="inline-block text-[15px] text-accent-ink underline underline-offset-2">Return to the workbook to find Lesson 1</Link>
        </>
      )}
      <p className="text-[14px] text-muted-foreground">Below, record only what you've actually observed. If you have only read the occupation profile, describe that rather than saying you completed the hands-on task.</p>
    </section>
  );
}
