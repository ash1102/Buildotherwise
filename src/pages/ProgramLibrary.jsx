import React, { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCurriculum from "@/hooks/useCurriculum";
import { KIND_LABELS, loadLibraryResources, moduleTitle } from "@/lib/library";
import { downloadText } from "@/lib/download";
import LibraryCard from "@/components/library/LibraryCard";
import DashedMotif from "@/components/workbook/DashedMotif";
import PrivacyNote from "@/components/workbook/PrivacyNote";

export default function ProgramLibrary() {
  const { modules, loading: curriculumLoading } = useCurriculum();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState("all");

  useEffect(() => {
    let active = true;
    loadLibraryResources()
      .then((items) => {
        if (active) setResources(items);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const readings = useMemo(() => resources.filter((item) => item.audience !== "program_team"), [resources]);
  const research = useMemo(() => resources.filter((item) => item.audience === "program_team"), [resources]);

  const moduleOrders = useMemo(
    () => [...new Set(readings.map((item) => item.module_order))].sort((a, b) => a - b),
    [readings]
  );
  const shownOrders = activeModule === "all" ? moduleOrders : moduleOrders.filter((order) => String(order) === activeModule);

  const download = () => {
    const lines = resources.map((item) => {
      const where = item.module_order === undefined || item.module_order === null ? "Program research" : moduleTitle(modules, item.module_order);
      return `## ${item.title}\n_${KIND_LABELS[item.kind] || "Reading"} · ${where}${item.lesson_code ? ` · ${item.lesson_code}` : ""}_\n\n${
        item.body || item.summary || ""
      }\n${item.source_label ? `\nSource: ${item.source_label}\n` : ""}`;
    });
    downloadText("entrepalooza-program-library.md", `# Program Library\n\n${lines.join("\n\n")}`);
  };

  const busy = loading || curriculumLoading;

  return (
    <div className="space-y-12">
      <header className="border-b border-natural pb-7">
        <div className="flex items-start gap-4">
          <DashedMotif size="lg" />
          <div>
            <p className="workbook-label">Program Library</p>
            <h1 className="mt-2 font-heading text-3xl sm:text-4xl">Everything you have read, in one place</h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              The readings and notes that sit alongside the steps, kept in the curriculum's own words. Nothing here needs
              filling in — it is material to come back to.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={download} className="rounded-full border-natural bg-white">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Download the library
          </Button>
          <PrivacyNote>Readings only. Your answers stay with the step you wrote them in.</PrivacyNote>
        </div>
      </header>

      <section>
        <div className="no-print flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={activeModule === "all"}
            onClick={() => setActiveModule("all")}
            className={`rounded-full border px-3 py-1.5 text-[12.5px] transition ${
              activeModule === "all"
                ? "border-teal-deep bg-teal-deep text-ivory"
                : "border-natural bg-white text-ink-soft hover:border-teal-deep/50"
            }`}
          >
            Everything
          </button>
          {moduleOrders.map((order) => (
            <button
              key={order}
              type="button"
              aria-pressed={String(order) === activeModule}
              onClick={() => setActiveModule(String(order))}
              className={`rounded-full border px-3 py-1.5 text-[12.5px] transition ${
                String(order) === activeModule
                  ? "border-teal-deep bg-teal-deep text-ivory"
                  : "border-natural bg-white text-ink-soft hover:border-teal-deep/50"
              }`}
            >
              {order === 0 ? "Getting Started" : `Module ${order}`}
            </button>
          ))}
        </div>

        {busy ? (
          <p className="py-8 text-[14px] text-ink-faint">Opening the library…</p>
        ) : readings.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-natural-deep bg-white/60 p-6 text-[14px] leading-relaxed text-ink-soft">
            No readings have been imported yet. When they are, each one appears here under the step it belongs to.
          </p>
        ) : (
          <div className="mt-7 space-y-9">
            {shownOrders.map((order) => (
              <section key={order}>
                <h2 className="font-heading text-xl">{moduleTitle(modules, order)}</h2>
                <div className="mt-3 space-y-4">
                  {readings
                    .filter((item) => item.module_order === order)
                    .map((item) => (
                      <LibraryCard key={item.id} resource={item} />
                    ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      {research.length ? (
        <section className="rounded-lg border border-dashed border-natural-deep bg-white/60 p-6">
          <p className="workbook-label">Program research</p>
          <h2 className="mt-2 font-heading text-xl">Research behind the curriculum</h2>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">
            The program team's own research notes, listed here so you can see what the curriculum is built on. They are
            design documents, not lessons, and the full versions stay with the program creator.
          </p>
          <ul className="mt-5 space-y-4">
            {research.map((item) => (
              <li key={item.id} className="border-t border-natural pt-4">
                <h3 className="font-heading text-[17px]">{item.title}</h3>
                {item.summary ? <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{item.summary}</p> : null}
                {item.source_label ? <p className="mt-1.5 text-[12px] text-ink-faint">{item.source_label}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}