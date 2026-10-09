import React from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  setDiscoveryNote,
  useDecisions,
  useDiscoveryNotes,
  useLifeMap,
  useWorkbook,
} from "@/lib/workbook";
import { entriesFromAnswers, tryLogValues } from "@/lib/discovery";
import { downloadText } from "@/lib/download";
import PrivacyNote from "@/components/workbook/PrivacyNote";
import DashedMotif from "@/components/workbook/DashedMotif";

const GROUP_LABELS = {
  curiosity: "Where your attention went",
  try_plan: "The try plan and its stop rule",
  observed: "What you observed, and what you made of it",
  unknown: "Still unknown",
  conditions: "Conditions worth keeping or changing",
  cost: "What it cost",
  revised: "Revised statements",
  decide_next: "Next action and review point",
  close: "What you are keeping from Pilot 1",
};

function RecordGroup({ title, items, empty }) {
  return (
    <section className="rounded-lg border border-natural bg-white p-5 sm:p-6">
      <p className="workbook-label">{title}</p>
      {items.length ? (
        <dl className="mt-3 space-y-3">
          {items.map((item) => (
            <div key={`${item.key}-${item.label}`}>
              <dt className="text-[12.5px] text-ink-faint">{item.label}</dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-[14px] leading-relaxed text-ink-soft">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-2 text-[13.5px] text-ink-faint">{empty}</p>
      )}
    </section>
  );
}

export default function DiscoveryRecordPage() {
  const { answers } = useWorkbook();
  const decisions = useDecisions();
  const map = useLifeMap();
  const notes = useDiscoveryNotes();

  const fromAnswers = entriesFromAnswers(answers);
  const pick = (section) => fromAnswers.filter((item) => item.section === section);
  const tryLog = tryLogValues(answers).filter((item) => item.value);
  const mapCount = Object.values(map || {}).reduce((count, list) => count + (Array.isArray(list) ? list.length : 0), 0);
  const decided = Object.entries(decisions || {}).filter(([, value]) => value);

  const download = () => {
    const blocks = [];
    blocks.push(`## Current life context\n${notes.context || "(nothing written yet)"}`);
    Object.entries(GROUP_LABELS).forEach(([section, label]) => {
      const items = pick(section);
      blocks.push(`## ${label}\n${items.length ? items.map((item) => `- ${item.label}: ${item.value}`).join("\n") : "- (nothing yet)"}`);
    });
    if (tryLog.length) {
      blocks.push(`## Try log\n${tryLog.map((item) => `- ${item.label}: ${item.value}`).join("\n")}`);
    }
    if (decided.length) {
      blocks.push(`## Next decisions\n${decided.map(([code, value]) => `- ${code}: ${value}`).join("\n")}`);
    }
    downloadText("entrepalooza-discovery-record.md", `# Builder Discovery Record\n\n${blocks.join("\n\n")}`);
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-natural pb-6">
        <div className="flex items-start gap-4">
          <DashedMotif size="lg" />
          <div>
            <p className="workbook-label">Builder Discovery Record</p>
            <h1 className="mt-2 font-heading text-3xl sm:text-4xl">One running record, filled in as you go</h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              Nothing on this page is entered twice. Every line comes from an activity you already did, so the record keeps
              up with you instead of asking again.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={download} className="rounded-full border-natural bg-white">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Download
          </Button>
          <Button type="button" variant="outline" onClick={() => window.print()} className="rounded-full border-natural bg-white">
            <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
            Print
          </Button>
          <PrivacyNote>{mapCount ? `${mapCount} lines on your Life Map feed the context below.` : null}</PrivacyNote>
        </div>
      </header>

      <section className="rounded-lg border border-natural bg-white p-5 sm:p-6">
        <p className="workbook-label">Current life context</p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
          A few lines about the life this work sits inside — what already takes your time, what you are protecting, and what
          is in reach right now. Your Life Map has {mapCount} {mapCount === 1 ? "line" : "lines"} in it so far.
        </p>
        <Textarea
          value={notes.context || ""}
          onChange={(event) => setDiscoveryNote("context", event.target.value)}
          rows={3}
          placeholder="What your weeks actually look like right now."
          className="mt-3 min-h-[5rem] border-natural bg-ivory/60 text-[14px]"
        />
      </section>

      <RecordGroup title={GROUP_LABELS.curiosity} items={pick("curiosity")} empty="Notice what holds your attention in Module 1 and it will appear here." />

      <RecordGroup
        title={GROUP_LABELS.try_plan}
        items={[...pick("try_plan"), ...tryLog]}
        empty="Design one small try in Module 2 and the plan, boundary and stop rule will appear here."
      />

      <RecordGroup
        title={GROUP_LABELS.observed}
        items={[...pick("observed"), ...pick("unknown")]}
        empty="After your try, this fills in from your short review."
      />

      <RecordGroup
        title={GROUP_LABELS.conditions}
        items={[...pick("conditions"), ...pick("cost")]}
        empty="Change one condition in Module 3 and the result and cost will land here."
      />

      <RecordGroup
        title={GROUP_LABELS.revised}
        items={pick("revised")}
        empty="Revise a statement with evidence in Module 4 and the earlier and later wording both stay visible."
      />

      <section className="rounded-lg border border-copper/30 bg-copper-wash/50 p-5 sm:p-6">
        <p className="workbook-label text-copper">Next decisions you have recorded</p>
        {decided.length ? (
          <ul className="mt-3 space-y-2">
            {decided.map(([code, value]) => (
              <li key={code} className="flex flex-wrap items-baseline gap-2 text-[14px]">
                <span className="text-teal-deep">{code}</span>
                <span className="font-medium text-ink">{value}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[13.5px] text-ink-faint">
            No decisions recorded yet. Every one you make — including pause, stop and continue looking — is a complete
            answer and shows up here.
          </p>
        )}
      </section>

      <RecordGroup title={GROUP_LABELS.close} items={pick("close")} empty="The Pilot 1 close in Module 5 fills this in." />
    </div>
  );
}