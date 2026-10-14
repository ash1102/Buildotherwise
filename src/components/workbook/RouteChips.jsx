import React from "react";
import { routeGuidanceFor } from "@/lib/workbook";

/** The ways to take this step. Shown only when the step has routes. */
export default function RouteChips({ routes = [], value, onChange, labelledBy }) {
  return (
    <div role="group" aria-labelledby={labelledBy || undefined} className="flex flex-wrap gap-2">
      {routes.map((route) => {
        const active = value === route;
        const detail = routeGuidanceFor(route);
        return (
          <button
            key={route}
            type="button"
            aria-pressed={active}
            title={detail ? detail.label : undefined}
            onClick={() => onChange(active ? "" : route)}
            className={`rounded-md border px-3.5 py-2 text-[15px] transition ${
              active
                ? "border-accent-ink bg-accent-ink text-white"
                : "border-input bg-card text-foreground hover:bg-secondary"
            }`}
          >
            {route}
          </button>
        );
      })}
    </div>
  );
}
