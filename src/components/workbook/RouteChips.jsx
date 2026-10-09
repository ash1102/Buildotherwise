import React from "react";
import { PARTICIPATION_ROUTES } from "@/lib/workbook";

export default function RouteChips({ routes = PARTICIPATION_ROUTES, value, onChange }) {
  return (
    <div className="rounded-lg border border-natural bg-teal-deep-wash/60 p-4">
      <p className="workbook-label">Your participation choices</p>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        Every route below counts the same. You can answer aloud, write privately, observe, or pass — passing never needs a
        reason.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {routes.map((route) => {
          const active = value === route;
          return (
            <button
              key={route}
              type="button"
              aria-pressed={active}
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
    </div>
  );
}