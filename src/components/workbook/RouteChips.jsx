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
      <p className="text-[13px] leading-relaxed text-ink-soft">
        Every route below writes something into your journal. One line is enough, and that is the whole ask. Pick how you
        want to write, and this step takes that shape.
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
              className={`rounded-full border px-3 py-1.5 text-[12.5px] transition ${
                active
                  ? "border-teal-deep bg-teal-deep text-ivory"
                  : "border-natural bg-white text-ink-soft hover:border-teal-deep/50 hover:text-teal-deep"
              }`}
            >
              {route}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-md border border-dashed border-teal-deep/40 bg-white/80 p-3">
        {guidance ? (
          <p className="text-[13px] leading-relaxed text-ink">
            <span className="font-medium">{guidance.label}:</span> {guidance.cue}
          </p>
        ) : (
          <p className="text-[13px] leading-relaxed text-ink-faint">
            Choose a route and the writing below changes to match it.
          </p>
        )}
      </div>
    </div>
  );
}