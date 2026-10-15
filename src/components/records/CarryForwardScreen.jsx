import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import { RECORD_TYPES, useLearnerRecords } from "@/lib/learnerRecords";

/**
 * A live-only module (Module 10) in the app: no steps, just a short self-paced
 * carry-forward screen until the live session. It reads the learner's own
 * records; it saves nothing itself.
 */
export default function CarryForwardScreen({ module }) {
  const { byType, loading } = useLearnerRecords();
  const saved = RECORD_TYPES.filter((def) => byType[def.type] && String(byType[def.type].body || "").trim());

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="workbook-label inline-flex items-center gap-1.5">
          <Users className="h-4 w-4" aria-hidden="true" />
          Live session
        </p>
        <h2 className="mt-2">{module ? module.title : "This module"} happens live, together</h2>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          This module isn&rsquo;t self-paced. It runs as a live session, because staying connected is something people
          work out together. Dates aren&rsquo;t set yet. Coming is optional, and not coming is a full ending too.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="workbook-label">In the meantime: carry forward</p>
        <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
          Look back over what you&rsquo;ve kept. You can change or delete any of it. Bring what you want to the live
          session, and leave the rest.
        </p>

        {loading ? (
          <p className="mt-4 text-[15px] text-muted-faint">Opening your records…</p>
        ) : saved.length ? (
          <ol className="mt-4 space-y-3">
            {saved.map((def) => (
              <li key={def.type} className="rounded-lg border border-border bg-secondary p-3">
                <p className="text-[13px] font-semibold text-accent-ink">{def.title}</p>
                <p className="mt-1 line-clamp-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground">
                  {byType[def.type].body}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-[15px] text-muted-foreground">
            Nothing saved yet. That&rsquo;s fine. You can start on My Records whenever you want, or not at all.
          </p>
        )}

        <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">
          Every next decision counts: Keep · Change · Test again · Pause · Stop · Another direction · Keep looking.
        </p>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          <Link
            to="/my-records"
            className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2"
          >
            Open My Records
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a href="mailto:Start@buildotherwise.org" className="text-[15px] text-muted-foreground hover:text-foreground">
            Questions about the live session: Start@buildotherwise.org
          </a>
        </div>
      </div>
    </section>
  );
}
