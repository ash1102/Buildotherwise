import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const pillClass = (active) =>
  `rounded-full border px-3 py-1.5 text-[12.5px] transition ${
    active ? "border-primary bg-primary text-primary-foreground" : "border-natural bg-white text-ink-soft hover:border-teal-deep/50"
  }`;

function FilterPill({ active, onClick, children }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={pillClass(active)}>
      {children}
    </button>
  );
}

/** Search, module and the optional step narrowing, all in one quiet block above the readings. */
export default function LibraryFilters({
  search,
  onSearchChange,
  moduleOrders,
  activeModule,
  onModuleChange,
  steps,
  activeStep,
  onStepChange,
  stepLabel,
  busy,
}) {
  /** Getting Started is its own sequence, so it is kept apart from the numbered modules here too. */
  const hasIntro = moduleOrders.includes(0);
  const numberedOrders = moduleOrders.filter((order) => order !== 0);

  return (
    <div className="no-print space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search the readings"
          aria-label="Search the readings"
          className="rounded-full border-natural bg-white pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterPill active={activeModule === "all"} onClick={() => onModuleChange("all")}>
          Everything
        </FilterPill>

        {hasIntro ? (
          <FilterPill active={activeModule === "0"} onClick={() => onModuleChange("0")}>
            Getting Started
          </FilterPill>
        ) : null}

        {hasIntro && numberedOrders.length ? (
          <span aria-hidden="true" className="mx-1 h-6 w-px bg-natural" />
        ) : null}

        {numberedOrders.map((order) => (
          <FilterPill
            key={order}
            active={String(order) === activeModule}
            onClick={() => onModuleChange(String(order))}
          >
            {`Module ${order}`}
          </FilterPill>
        ))}
      </div>

      {steps.length ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-natural pt-3">
          <span className="workbook-label">Step</span>
          <FilterPill active={activeStep === "all"} onClick={() => onStepChange("all")}>
            All steps
          </FilterPill>
          {steps.map((code) => (
            <FilterPill key={code} active={activeStep === code} onClick={() => onStepChange(code)}>
              {stepLabel(code)}
            </FilterPill>
          ))}
        </div>
      ) : null}

      {busy ? <p className="text-[13px] text-ink-faint">Searching the library…</p> : null}
    </div>
  );
}