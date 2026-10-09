import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const pillClass = (active) =>
  `rounded-full border px-3 py-1.5 text-[12.5px] transition ${
    active ? "border-teal-deep bg-teal-deep text-ivory" : "border-natural bg-white text-ink-soft hover:border-teal-deep/50"
  }`;

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

      <div className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={activeModule === "all"} onClick={() => onModuleChange("all")} className={pillClass(activeModule === "all")}>
          Everything
        </button>
        {moduleOrders.map((order) => (
          <button
            key={order}
            type="button"
            aria-pressed={String(order) === activeModule}
            onClick={() => onModuleChange(String(order))}
            className={pillClass(String(order) === activeModule)}
          >
            {order === 0 ? "Getting Started" : `Module ${order}`}
          </button>
        ))}
      </div>

      {steps.length ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-natural pt-3">
          <span className="workbook-label">Step</span>
          <button type="button" aria-pressed={activeStep === "all"} onClick={() => onStepChange("all")} className={pillClass(activeStep === "all")}>
            All steps
          </button>
          {steps.map((code) => (
            <button
              key={code}
              type="button"
              aria-pressed={activeStep === code}
              onClick={() => onStepChange(code)}
              className={pillClass(activeStep === code)}
            >
              {stepLabel(code)}
            </button>
          ))}
        </div>
      ) : null}

      {busy ? <p className="text-[13px] text-ink-faint">Searching the library…</p> : null}
    </div>
  );
}