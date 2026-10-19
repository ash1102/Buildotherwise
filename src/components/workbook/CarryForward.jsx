import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { getAnswer } from "@/lib/workbook";

/**
 * Carry-forward: earlier answers appear as optional, selectable context.
 * Nothing moves forward unless it is chosen here, and nothing is retyped.
 */
function readableAnswer(value) {
  try { const parsed = JSON.parse(value); return typeof parsed === "string" ? parsed : value; }
  catch { return value; }
}

export default function CarryForward({ sources, selected, onChange }) {
  const items = sources
    .map((source) => ({ ...source, value: readableAnswer(getAnswer(source.code, source.index)) }))
    .filter((item) => item.value && item.value.trim());

  if (!items.length) return null;

  const toggle = (key, checked) => {
    onChange(checked ? [...selected, key] : selected.filter((existing) => existing !== key));
  };

  return (
    <section className="rounded-xl border border-border bg-secondary p-4 sm:p-5">
      <h4 className="text-[16px]">Bring forward, only if you want it</h4>
      <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
        These are things you already wrote. Tick anything that belongs in this step. Nothing moves unless you choose it.
      </p>
      <ul className="mt-3 space-y-3">
        {items.map((item) => {
          const key = `${item.code}#${item.index}`;
          const checked = selected.includes(key);
          return (
            <li key={key} className="flex items-start gap-3">
              <Checkbox
                id={key}
                checked={checked}
                onCheckedChange={(next) => toggle(key, Boolean(next))}
                className="mt-1 border-input data-[state=checked]:bg-primary"
              />
              <div className="min-w-0">
                <label htmlFor={key} className="block text-[15px] font-medium text-foreground">
                  {item.label}
                </label>
                <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-muted-foreground">
                  {item.value}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}