import React, { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCurriculum from "@/hooks/useCurriculum";
import {
  KIND_LABELS,
  loadLibraryResources,
  loadOutsideResources,
  loadReadingSteps,
  moduleTitle,
} from "@/lib/library";
import { downloadText } from "@/lib/download";
import LibraryCard from "@/components/library/LibraryCard";
import LibraryFilters from "@/components/library/LibraryFilters";
import OutsideSourceCard from "@/components/library/OutsideSourceCard";
import PrivacyNote from "@/components/workbook/PrivacyNote";

export default function ProgramLibrary() {
  const { modules, lessonsByCode, loading: curriculumLoading } = useCurriculum();
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [activeModule, setActiveModule] = useState("all");
  const [activeStep, setActiveStep] = useState("all");
  const [steps, setSteps] = useState([]);
  const [resources, setResources] = useState(null);
  const [outside, setOutside] = useState([]);
  const [outsideKind, setOutsideKind] = useState("all");
  const [loading, setLoading] = useState(true);

  /** Typing settles first, so each search is one request rather than one per keystroke. */
  useEffect(() => {
    const timer = setTimeout(() => setTerm(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const moduleOrder = activeModule === "all" ? null : Number(activeModule);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadLibraryResources({
      search: term,
      moduleOrder,
      lessonCode: activeStep === "all" ? null : activeStep,
    })
      .then((items) => {
        if (active) setResources(items);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [term, moduleOrder, activeStep]);

  /** Choosing a module clears the step narrowing and offers that module's own steps. */
  useEffect(() => {
    let active = true;
    setActiveStep("all");
    if (moduleOrder === null) {
      setSteps([]);
      return () => {
        active = false;
      };
    }
    loadReadingSteps(moduleOrder).then((codes) => {
      if (active) setSteps(codes);
    });
    return () => {
      active = false;
    };
  }, [moduleOrder]);

  useEffect(() => {
    let active = true;
    loadOutsideResources().then((items) => {
      if (active) setOutside(items);
    });
    return () => {
      active = false;
    };
  }, []);

  const groups = useMemo(() => {
    const grouped = new Map();
    (resources || []).forEach((item) => {
      const key = item.module_order === undefined || item.module_order === null ? null : item.module_order;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(item);
    });
    return [...grouped.entries()].sort((a, b) => (a[0] ?? 999) - (b[0] ?? 999));
  }, [resources]);

  const moduleOrders = useMemo(
    () => [...new Set((resources || []).map((item) => item.module_order).filter((order) => order !== null && order !== undefined))].sort((a, b) => a - b),
    [resources]
  );

  const narrowed = term.trim().length > 0 || activeModule !== "all" || activeStep !== "all";

  const download = () => {
    const readingLines = (resources || []).map((item) => {
      const where =
        item.module_order === undefined || item.module_order === null ? "Program research" : moduleTitle(modules, item.module_order);
      return `## ${item.title}\n_${KIND_LABELS[item.kind] || "Reading"} · ${where}${item.lesson_code ? ` · ${item.lesson_code}` : ""}_\n\n${
        item.body || item.summary || ""
      }\n${item.source_label ? `\nSource: ${item.source_label}\n` : ""}`;
    });
    const briefLines = [].map((brief) => {
      const head = `## ${brief.title}\n_Build Otherwise research note · summary only_\n\n${brief.summary || ""}`;
      const status = brief.review_status ? `\n\nLimit: ${brief.review_status}` : "";
      return `${head}${status}\n`;
    });
    const outsideLines = outside.map((item) => {
      const byline = [item.creator, item.publisher, item.year].filter(Boolean).join(" · ");
      return `## ${item.title}\n_${KIND_LABELS[item.kind] || "Outside source"}${byline ? ` · ${byline}` : ""}_\n\n${item.summary || ""}${
        item.url ? `\n\n${item.url}` : ""
      }\n`;
    });
    downloadText(
      "entrepalooza-program-library.md",
      `# Program Library\n\n${[...readingLines, ...outsideLines, ...briefLines].join("\n\n")}`
    );
  };

  const busy = curriculumLoading || resources === null;

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Program Library</p>
        <h1 className="mt-2">Everything you have read, in one place</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          The readings and notes that sit alongside the steps, kept in the curriculum's own words. Nothing here needs
          filling in. It is material to come back to.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={download} className="rounded-md border-input bg-card">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Download the library
          </Button>
        </div>
        <div className="mt-3">
          <PrivacyNote>Readings only. Your answers stay with the step you wrote them in.</PrivacyNote>
        </div>
      </header>

      <section className="space-y-7">
        <div>
          <h2 className="workbook-label">Participant readings</h2>
          <h3 className="mt-1.5 text-[20px]">Find what the step asked you to read</h3>
        </div>

        <LibraryFilters
          search={search}
          onSearchChange={setSearch}
          moduleOrders={moduleOrders}
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          steps={steps}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          stepLabel={(code) => (lessonsByCode[code] ? lessonsByCode[code].title : code)}
          busy={loading && resources !== null}
        />

        {busy ? (
          <p className="py-8 text-[14px] text-ink-faint">Opening the library…</p>
        ) : resources.length === 0 ? (
          <p className="rounded-lg border border-dashed border-natural-deep bg-card/60 p-6 text-[14px] leading-relaxed text-ink-soft">
            {narrowed
              ? "No readings match that yet. Try fewer words, or choose Everything to see the whole library."
              : "No readings have been imported yet. When they are, each one appears here under the step it belongs to."}
          </p>
        ) : (
          <div className="space-y-9">
            {groups.map(([order, items]) => (
              <section key={order}>
                <h2 className="font-heading text-xl">{order === null ? "Program research" : moduleTitle(modules, order)}</h2>
                <div className="mt-3 space-y-4">
                  {items.map((item) => (
                    <LibraryCard key={item.id} resource={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <section id="evidence" className="space-y-7 scroll-mt-24 border-t border-border pt-8">
        <div>
          <h2 className="workbook-label">Evidence</h2>
          <h3 className="mt-1.5 text-[22px]">What this program draws on, and what it doesn't prove</h3>
          <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-ink-soft">
            Entrepalooza is built on research. That isn't the same as being proven. Here is the difference, so you can
            judge for yourself.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="workbook-card p-5">
            <h4 className="font-heading text-[17px]">What the research does here</h4>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-ink-soft">
              <li>Explains why the program is designed the way it is: trying things early, small tries you can learn from, choosing your own direction, and learning alongside other people.</li>
              <li>Points to studies and talks from other settings, so you can check the thinking yourself.</li>
              <li>Includes research that cuts against the design, not only research that agrees with it.</li>
            </ul>
          </div>
          <div className="workbook-card p-5">
            <h4 className="font-heading text-[17px]">What it can't do</h4>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-ink-soft">
              <li>Show that Entrepalooza works. The first pilot hasn't run, so there are no results to report.</li>
              <li>Predict what happens for any one person. Studies describe groups, often in other countries and with different goals.</li>
              <li>Turn this into treatment. Entrepalooza is an educational program, not therapy or a recovery program.</li>
            </ul>
          </div>
        </div>

      {outside.length ? (
        <section className="space-y-5">
          <div>
            <h3 className="workbook-label">Outside studies and talks</h3>
            <h4 className="mt-1.5 text-[19px]">Other people's work, linked to where it lives</h4>
            <p className="mt-2 max-w-[68ch] text-[13.5px] leading-relaxed text-ink-soft">
              All of it is optional. Each piece says why it's here and where it stops applying. Take what's useful and
              question the rest.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Show outside sources by type">
            {[
              ["all", "Everything"],
              ["article", "Articles"],
              ["study", "Studies"],
              ["talk", "Talks"],
            ]
              .filter(([key]) => key === "all" || outside.some((item) => item.kind === key))
              .map(([key, label]) => (
                <Button
                  key={key}
                  type="button"
                  size="sm"
                  variant={outsideKind === key ? "default" : "outline"}
                  aria-pressed={outsideKind === key}
                  onClick={() => setOutsideKind(key)}
                  className="rounded-md"
                >
                  {label}
                </Button>
              ))}
          </div>
          <div className="space-y-4">
            {outside
              .filter((item) => outsideKind === "all" || item.kind === outsideKind)
              .map((item) => (
                <OutsideSourceCard
                  key={item.id}
                  resource={item}
                  moduleLabel={
                    item.module_order === undefined || item.module_order === null
                      ? null
                      : moduleTitle(modules, item.module_order)
                  }
                />
              ))}
          </div>
        </section>
      ) : null}

      {false ? (
        <section className="rounded-lg border border-dashed border-natural-deep bg-card/60 p-6">
          <h3 className="workbook-label">Build Otherwise's own research notes</h3>
          <h4 className="mt-1.5 font-heading text-[19px]">How the curriculum was checked against research</h4>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">
            These are working design documents, not lessons. You'll see a short summary of each and the limit it states
            for itself. The full documents stay private while they're reviewed.
          </p>
          <ul className="mt-5 space-y-4">
            {research.map((brief) => (
              <ResearchBriefCard key={brief.id} brief={brief} />
            ))}
          </ul>
        </section>
      ) : null}
      </section>
    </div>
  );
}