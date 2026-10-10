import React from "react";
import { Link } from "react-router-dom";
import useCurriculum from "@/hooks/useCurriculum";
import { useCarried, useDecisions, useLifeMap, useStepState, useWorkbook } from "@/lib/workbook";
import { useJournalEntries } from "@/lib/journal";
import { useDiscoveries } from "@/lib/discoveries";
import { buildChoiceTally, buildGathering, buildTrail } from "@/lib/discoveryMap";
import PrivacyNote from "@/components/workbook/PrivacyNote";
import DashedMotif from "@/components/workbook/DashedMotif";
import MapTrail from "@/components/map/MapTrail";
import ChoiceTally from "@/components/map/ChoiceTally";
import RecordGathering from "@/components/map/RecordGathering";

function SectionHeading({ label, title, intro }) {
  return (
    <div className="border-b border-natural pb-4">
      <p className="workbook-label">{label}</p>
      <h2 className="mt-1.5 font-heading text-xl sm:text-2xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-soft">{intro}</p>
    </div>
  );
}

export default function DiscoveryMapPage() {
  const { modules, lessonsByOrder, lessonsByCode, loading } = useCurriculum();
  const { answers } = useWorkbook();
  const decisions = useDecisions();
  const states = useStepState();
  const carried = useCarried();
  const map = useLifeMap();
  const journal = useJournalEntries();
  const discoveries = useDiscoveries();

  if (loading) {
    return <p className="py-10 text-[14px] text-ink-faint">Drawing your map…</p>;
  }

  const trail = buildTrail({ modules, lessonsByOrder, answers, decisions, states, carried });
  /** Getting Started has its own container, so it is kept out of the module trail. */
  const introRows = trail.filter((row) => row.module.kind === "orientation");
  const moduleRows = trail.filter((row) => row.module.kind !== "orientation");
  const { decisionRows, routeRows } = buildChoiceTally({ decisions, states, lessonsByCode });
  const gathering = buildGathering({ answers, discoveries, journal, map });

  const stepCount = trail.reduce((count, row) => count + row.steps.length, 0);
  const written = trail.reduce((count, row) => count + row.written, 0);
  const nothingYet = !written && !journal.length && !discoveries.length;

  return (
    <div className="space-y-10">
      <header className="border-b border-natural pb-6">
        <div className="flex items-start gap-4">
          <DashedMotif size="lg" />
          <div>
            <p className="workbook-label">Discovery Map</p>
            <h1 className="mt-2 font-heading text-3xl sm:text-4xl">Your path through the workbook</h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              This map draws itself from what you already saved — every line written, every choice recorded, and
              everything you carried forward. There is nothing extra to fill in here.
            </p>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-faint">
              It is not a score. Steps you paused, passed on, or left open show as themselves.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <PrivacyNote>
            {written
              ? `${written} of ${stepCount} steps carry something you saved. Kept in this browser only.`
              : `All ${stepCount} steps are still open. Kept in this browser only.`}
          </PrivacyNote>
        </div>
      </header>

      {nothingYet ? (
        <div className="rounded-lg border border-dashed border-teal-deep/35 bg-white/60 p-6">
          <p className="font-heading text-[16px] leading-snug text-ink">Nothing recorded yet.</p>
          <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
            The path below is already drawn. The first line you save in a step appears on it, with no extra work.{" "}
            <Link to="/" className="text-teal-deep underline decoration-natural underline-offset-2">
              Open the workbook
            </Link>
          </p>
        </div>
      ) : null}

      {introRows.length ? (
        <section>
          <SectionHeading
            label="Start here"
            title="Getting Started"
            intro="Its own short sequence rather than a module. It sits before Module 1 and stays open to you at any time."
          />
          <div className="mt-6">
            <MapTrail trail={introRows} />
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeading
          label="The trail"
          title="Where you have been, and what is next"
          intro="Every module of Pilot 1, in order. Open any of them to pick it up again."
        />
        <div className="mt-6">
          <MapTrail trail={moduleRows} />
        </div>
      </section>

      <section>
        <SectionHeading
          label="The choices"
          title="What you decided, and how you took part"
          intro="Decisions and routes you recorded, gathered from the steps themselves."
        />
        <div className="mt-6">
          <ChoiceTally decisionRows={decisionRows} routeRows={routeRows} />
        </div>
      </section>

      <section>
        <SectionHeading
          label="The gathering"
          title="What the map is drawn from"
          intro="Each step feeds the Discovery Record as you go, so nothing is entered twice."
        />
        <div className="mt-6">
          <RecordGathering sections={gathering.sections} figures={gathering.figures} />
        </div>
      </section>
    </div>
  );
}