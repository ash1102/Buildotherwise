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
          <p className="text-[15px] text-muted-foreground">Your selected starting point: <strong className="text-foreground">{selected.field}</strong>. This choice came forward from Lesson 1. It does not mean you completed the activity, and you can change it.</p>
          <p className="text-[16px] leading-relaxed text-foreground">{selected.fact}</p>
          <div className="rounded-lg bg-secondary p-4">
            <p className="font-medium text-foreground">An encounter you can choose</p>
            <p className="mt-2 text-[16px] leading-relaxed text-foreground">{selected.task}</p>
          </div>
          <p className="text-[15px] text-foreground">As you explore, distinguish <strong>what you actually did, observed, or learned from a source</strong> from <strong>what you are inferring</strong>. Notice which parts draw your attention and what you still want to find out.</p>
          {selected.source ? <a href={selected.source} target="_blank" rel="noopener noreferrer" className="inline-block text-[15px] text-accent-ink underline underline-offset-2">Open the source ↗</a> : null}
        </>
      ) : (
        <>
          <p className="text-[16px] leading-relaxed text-foreground">You haven't selected a discovery from Lesson 1 yet. That's fine: visit the sampler and explore one, or use an activity you've already encountered.</p>
          <Link to="/workbook" className="inline-block text-[15px] text-accent-ink underline underline-offset-2">Return to the workbook to find Lesson 1</Link>
        </>
      )}
      <p className="text-[14px] text-muted-foreground">Below, record only what you've actually observed. Say whether you read, watched, talked with someone, visited, or did an activity yourself. Each gives different information; name what you actually encountered.</p>
    </section>
  );
}
