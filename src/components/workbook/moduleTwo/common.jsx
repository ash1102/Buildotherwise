import React, { useEffect } from "react";
import { plainValue } from "@/lib/moduleOne";
import { EARLIER_M2, METHOD_BY_ID, planHasContent, planSentences, readKey, readPlan, syncSummary } from "@/lib/moduleTwo";
import { OPTIONS as OLD_SAMPLER } from "../DiscoverySampler";
import { Quote } from "../moduleOne/parts";

/** Keeps M2-L1's plain-sentence plan in step, wherever the plan was edited from. */
export function usePlanSync(answers) {
  useEffect(() => {
    const plan = readPlan(answers);
    if (!planHasContent(plan) && !readKey(answers, "M2-L1", "plan")) return;
    syncSummary("M2-L1", "Find Something to Try", "plan", "My saved experiment plan", planSentences(plan), answers);
  }, [answers]);
}

/** Answers saved in the earlier version of a Module 2 lesson. Read-only. */
export function EarlierM2({ code, answers }) {
  const rows = (EARLIER_M2[code] || [])
    .map((item) => ({ ...item, value: plainValue((answers || {})[item.key]).trim() }))
    .filter((item) => item.value);
  if (code === "M2-L1") {
    const old = OLD_SAMPLER.find((option) => option.id === (answers || {})["M2-L1#20"]);
    if (old) rows.unshift({ key: "M2-L1#20", label: "A starting point you picked in the earlier version", value: old.field });
  }
  if (!rows.length) return null;
  return (
    <details className="rounded-xl border border-border bg-card p-4">
      <summary className="cursor-pointer text-[15px] font-medium text-foreground">
        Answers you saved in an earlier version of this lesson ({rows.length})
      </summary>
      <div className="mt-3 space-y-3">
        {rows.map((row) => (
          <Quote key={row.key} label={row.label}>
            {row.value}
          </Quote>
        ))}
        <p className="text-[14px] text-muted-faint">Kept as you wrote them. They’re also in your journal.</p>
      </div>
    </details>
  );
}

/** The saved plan, read back exactly. Lines nobody filled in are left out. */
export function PlanCard({ plan, label = "Your starting plan", empty }) {
  if (!planHasContent(plan)) {
    return <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">{empty}</p>;
  }
  const rows = [
    { label: "What you’ll explore", value: plan.explore },
    { label: "From the Exploration Gallery", value: plan.possibility && plan.category ? `${plan.category.title} · ${plan.possibility.title}` : "" },
    { label: "How", value: plan.method ? `${METHOD_BY_ID[plan.method].label}: ${METHOD_BY_ID[plan.method].short}` : "" },
    { label: "One manageable step", value: plan.step },
    { label: "When", value: plan.when },
    { label: "What might make it difficult", value: plan.obstacles.join(", ") },
    { label: "A smaller or more accessible version", value: plan.smaller },
  ].filter((row) => row.value);
  return (
    <div className="rounded-xl border border-primary/40 bg-card p-4 sm:p-5">
      <p className="workbook-label">{label}</p>
      <dl className="mt-3 space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-[13px] text-muted-foreground">{row.label}</dt>
            <dd className="mt-0.5 whitespace-pre-wrap break-words text-[16px] leading-relaxed text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
