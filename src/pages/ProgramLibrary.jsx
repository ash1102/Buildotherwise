import React, { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCurriculum from "@/hooks/useCurriculum";
import {
  KIND_LABELS,
  loadLibraryResources,
  loadReadingSteps,
  loadResearchBriefs,
  moduleTitle,
} from "@/lib/library";
import { downloadText } from "@/lib/download";
import LibraryCard from "@/components/library/LibraryCard";
import LibraryFilters from "@/components/library/LibraryFilters";
import ResearchBriefCard from "@/components/library/ResearchBriefCard";
import DashedMotif from "@/components/workbook/DashedMotif";
import PrivacyNote from "@/components/workbook/PrivacyNote";

export default function ProgramLibrary() {
  const { modules, lessonsByCode, loading: curriculumLoading } = useCurriculum();
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [activeModule, setActiveModule] = useState("all");
  const [activeStep, setActiveStep] = useState("all");
  const [steps, setSteps] = useState([]);
  const [resources, setResources] = useState(null);
  const [research, setResearch] = useState([]);
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
    loadResearchBriefs().then((items) => {
      if (active) setResearch(items);
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
    const briefLines = research.map((brief) => {
      const head = `## ${brief.title}\n_Program research · summary_\n\n${brief.summary || ""}`;
      const source = brief.source_label ? `\n\nSource: ${brief.source_label}` : "";
      const status = brief.review_status ? `\n\nReview status: ${brief.review_status}` : "";
      return `${head}${source}${status}\n`;
    });
    downloadText("entrepalooza-program-library.md", `# Program Library\n\n${[...readingLines, ...briefLines].join("\n\n")}`);
  };

  const busy = curriculumLoading || resources === null;

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

      <section className="space-y-7">
        <div>
          <p className="workbook-label">Participant readings</p>
          <h2 className="mt-2 font-heading text-xl">Find what the step asked you to read</h2>
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
          <p className="rounded-lg border border-dashed border-natural-deep bg-white/60 p-6 text-[14px] leading-relaxed text-ink-soft">
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

      {research.length ? (
        <section className="rounded-lg border border-dashed border-natural-deep bg-white/60 p-6">
          <p className="workbook-label">Research behind the program</p>
          <h2 className="mt-2 font-heading text-xl">What the curriculum is built on</h2>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">
            The program team's own research documents, listed here so you can see what the curriculum is built on. Each one
            shows where it came from and the status it states for itself. They are design documents, not lessons — the full
            text is there if you want it, and it is optional reading.
          </p>
          <ul className="mt-5 space-y-4">
            {research.map((brief) => (
              <ResearchBriefCard key={brief.id} brief={brief} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}