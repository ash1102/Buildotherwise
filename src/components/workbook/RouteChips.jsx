import React from "react";
import { PARTICIPATION_ROUTES, routeGuidanceFor } from "@/lib/workbook";

/**
 * The participation choice. Every route writes something, and choosing one
 * changes the shape of the writing fields below rather than just labelling them.
 */
export default function RouteChips({ routes = PARTICIPATION_ROUTES, value, onChange }) {
  const guidance = routeGuidanceFor(value);

  return (
    <div>
      <p className="max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
        Every route below writes something into your journal. One line is enough, and that is the whole ask.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {routes.map((route) => {
          const active = value === route;
          const detail = routeGuidanceFor(route);
          return (
            <button
              key={route}
              type="button"
              aria-pressed={active}
              title={detail ? detail.blurb : undefined}
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

      <div className="mt-3 rounded-md border border-dashed border-input bg-secondary p-3">
        {guidance ? (
          <p className="text-[15px] leading-relaxed text-foreground">
            <span className="font-medium">{guidance.label}:</span> {guidance.cue}
          </p>
        ) : (
          <p className="text-[15px] leading-relaxed text-muted-faint">
            Choose a route and the writing below changes to match it.
          </p>
        )}
      </div>
    </div>
  );
}