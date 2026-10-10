import React, { useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import useCurriculum from "@/hooks/useCurriculum";
import { savedLineCount, sourcesFromAnswers } from "@/lib/discovery";
import { useDiscoveries } from "@/lib/discoveries";
import { useJournalEntries } from "@/lib/journal";
import { useCarried, useDecisions, useLifeMap, useStepState, useWorkbook } from "@/lib/workbook";
import { buildChoiceTally, buildTrail } from "@/lib/discoveryMap";
import MapTrail from "@/components/map/MapTrail";
import ChoiceTally from "@/components/map/ChoiceTally";
import RecordGathering from "@/components/map/RecordGathering";
import PrivacyNote from "@/components/workbook/PrivacyNote";

/**
 * The Discovery Map, kept compact and centred on work that actually exists:
 * what you saved, what you chose to keep, and the choices recorded along the way.
 * The course trail is here too, and it sits last.
 */
export default function DiscoveryMapPage() {
  const { modules, lessonsByOrder, lessonsByCode, loading } = useCurriculum();
  const { answers } = useWorkbook();
  const decisions = useDecisions();
  const states = useStepState();
  const carried = useCarried();
  const map = useLifeMap();
  const journal = useJournalEntries();
  const discoveries = useDiscoveries();
  const [showTrail, setShowTrail] = useState(false);

  if (loading) {
    return <p className="py-10 text-[16px] text-muted-faint">Opening your map…</p>;
  }

  const trail = buildTrail({ modules, lessonsByOrder, answers, decisions, states, carried });
  const { decisionRows, routeRows } = buildChoiceTally({ decisions, states, lessonsByCode });
  const eligible = sourcesFromAnswers(answers, lessonsByCode);
  const allLines = savedLineCount(answers);
  const mapLines = Object.values(map || {}).reduce((count, list) => count + (Array.isArray(list) ? list.length : 0), 0);

  const saved = [
    { label: "Lines saved in steps", value: allLines, to: "/", link: "Open the workbook" },
    { label: "Answers that feed your record", value: eligible.length, to: "/record", link: "Open the record" },
    { label: "Journal entries", value: journal.length, to: "/journal", link: "Open the journal" },
    { label: "Discoveries you chose to keep", value: discoveries.length, to: "/record", link: "Open the record" },
    { label: "Life Map lines", value: mapLines, to: "/map", link: "Open the Life Map" },
  ];

  const anythingSaved = allLines || journal.length || discoveries.length || mapLines;

  const sections = ["curiosity", "try_plan", "observed", "unknown", "conditions", "cost", "revised", "decide_next", "close"]
    .map((key) => ({ key, items: eligible.filter((item) => item.section === key) }))
    .filter((section) => section.items.length);

  return (
    <div className="space-y-7">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Discovery Map</p>
        <h1 className="mt-2">What you have saved, and what came of it</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          This page is drawn from work that already exists — lines you saved in steps, choices you recorded, entries you
          kept. There is nothing extra to fill in, and nothing here is a score.
        </p>
        <div className="mt-3 max-w-[68ch]">
          <PrivacyNote>Kept in this browser only, on this device.</PrivacyNote>
        </div>
      </header>

      {!anythingSaved ? (
        <section className="rounded-xl border border-dashed border-input bg-card p-5 sm:p-6">
          <h2 className="text-[18px]">Nothing saved yet</h2>
          <p className="mt-2 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
            The first line you save in a step appears here on its own, with no extra work. Three good places to start:
          </p>
          <ul className="mt-4 space-y-2 text-[16px]">
            <li>
              <Link to="/" className="font-medium text-accent-ink underline underline-offset-2">
                Open the workbook
              </Link>{" "}
              <span className="text-muted-faint">and save one line on any step.</span>
            </li>
            <li>
              <Link to="/journal" className="font-medium text-accent-ink underline underline-offset-2">
                Write in the journal
              </Link>{" "}
              <span className="text-muted-faint">about whatever you are carrying right now.</span>
            </li>
            <li>
              <Link to="/map" className="font-medium text-accent-ink underline underline-offset-2">
                Open the Life Map
              </Link>{" "}
              <span className="text-muted-faint">and put down what your weeks actually hold.</span>
            </li>
          </ul>
        </section>
      ) : (
        <>
          <section>
            <h2 className="workbook-label">What you have saved</h2>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {saved.map((row) => (
                <li key={row.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
                  <span className="text-[17px] text-foreground">{row.label}</span>
                  <span className="text-[15px] text-muted-faint">
                    {row.value}{" "}
                    <Link to={row.to} className="ml-2 font-medium text-accent-ink underline underline-offset-2">
                      {row.link}
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="workbook-label">Discoveries you chose to keep</h2>
            {discoveries.length ? (
              <ul className="mt-3 space-y-2">
                {discoveries.slice(0, 5).map((entry) => (
                  <li key={entry.id} className="rounded-lg border border-border bg-card p-3.5">
                    <p className="text-[16px] font-medium text-foreground">
                      {entry.title || moment(entry.created_date).format("D MMMM YYYY")}
                    </p>
                    {entry.body ? (
                      <p className="mt-1 line-clamp-2 whitespace-pre-wrap break-words text-[16px] leading-relaxed text-muted-foreground">
                        {entry.body}
                      </p>
                    ) : null}
                  </li>
                ))}
                <li className="text-[15px]">
                  <Link to="/record" className="font-medium text-accent-ink underline underline-offset-2">
                    See everything in your Discovery Record
                  </Link>
                </li>
              </ul>
            ) : (
              <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">
                None kept yet. A discovery is something you deliberately choose to carry forward, and it stays separate
                from the answers saved in your steps.{" "}
                <Link to="/record" className="font-medium text-accent-ink underline underline-offset-2">
                  Open the Discovery Record
                </Link>
              </p>
            )}
          </section>

          {sections.length ? (
            <section>
              <h2 className="workbook-label">Answers that feed your record</h2>
              <div className="mt-3">
                <RecordGathering sections={sections} />
              </div>
            </section>
          ) : null}
        </>
      )}

      {decisionRows.length || routeRows.length ? (
        <section>
          <h2 className="workbook-label">Choices you recorded</h2>
          <div className="mt-3">
            <ChoiceTally decisionRows={decisionRows} routeRows={routeRows} />
          </div>
        </section>
      ) : null}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="workbook-label">Your trail through the workbook</h2>
          <button
            type="button"
            aria-expanded={showTrail}
            onClick={() => setShowTrail((value) => !value)}
            className="text-[15px] font-medium text-accent-ink underline underline-offset-2"
          >
            {showTrail ? "Hide the trail" : "Show the trail"}
          </button>
        </div>
        {showTrail ? (
          <div className="mt-4">
            <MapTrail trail={trail} />
          </div>
        ) : (
          <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">
            Every module of Pilot 1 in order, with the steps you have touched. Open it when you want the whole path at
            once.
          </p>
        )}
      </section>
    </div>
  );
}