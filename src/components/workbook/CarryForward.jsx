import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { getAnswer } from "@/lib/workbook";

/**
 * Carry-forward: earlier answers appear as optional, selectable context.
 * Nothing moves forward unless it is chosen here.
 */
export default function CarryForward({ sources, selected, onChange }) {
  const items = sources
    .map((source) => ({ ...source, value: getAnswer(source.code, source.index) }))
    .filter((item) => item.value && item.value.trim());

  if (!items.length) return null;

  const toggle = (key, checked) => {
    onChange(checked ? [...selected, key] : selected.filter((existing) => existing !== key));
  };

  return (
    <section className="rounded-lg border border-dashed border-teal-deep/40 bg-white/70 p-4 sm:p-5">
      <p className="workbook-label">Bring forward, only if you want it</p>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        These are things you already wrote. Tick anything that belongs in this step. Nothing moves unless you choose it,
        and nothing is retyped.
      </p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => {
          const key = `${item.code}#${item.index}`;
          const checked = selected.includes(key);
          return (
            <li key={key} className="flex items-start gap-3">
              <Checkbox
                id={key}
                checked={checked}
                onCheckedChange={(next) => toggle(key, Boolean(next))}
                className="mt-1 border-teal-deep/40 data-[state=checked]:bg-teal-deep"
              />
              <div className="min-w-0">
                <label htmlFor={key} className="block text-[13px] font-medium text-ink">
                  {item.label}
                </label>
                <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-[13px] text-ink-faint">{item.value}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}