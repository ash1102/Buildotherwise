import React, { Children, isValidElement, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import useBackClose from "@/lib/useBackClose";

const MOBILE_QUERY = "(max-width: 1023px)";

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches);
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return mobile;
}

function readOptions(children) {
  return Children.toArray(children)
    .filter((child) => isValidElement(child) && child.type === "option")
    .map((child) => ({
      value: String(child.props.value ?? child.props.children ?? ""),
      label: child.props.children,
      disabled: Boolean(child.props.disabled),
    }));
}

/**
 * A drop-in for <select>. Desktop keeps the native control. Below 1024px it opens as a
 * bottom sheet with large rows. onChange gets the same { target: { value } } shape a
 * native select gives, so call sites do not change.
 */
export default function MobileSelect({ children, ...props }) {
  const mobile = useIsMobile();
  if (!mobile) return <select {...props}>{children}</select>;
  return <SheetSelect {...props} options={readOptions(children)} />;
}

function SheetSelect({ id, name, value, onChange, options, className, disabled, "aria-label": ariaLabel }) {
  const [open, setOpen] = useState(false);
  const current = value == null ? "" : String(value);
  const selected = options.find((option) => option.value === current);
  useBackClose(open, () => setOpen(false), `select-${id || name || "field"}`);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const choose = (option) => {
    onChange?.({ target: { id, name, value: option.value } });
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={`flex w-full items-center justify-between gap-2 text-left disabled:opacity-60 ${className || ""}`}
      >
        <span className="min-w-0 truncate">{selected ? selected.label : "Choose…"}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[70] flex items-end justify-center bg-foreground/40 sm:items-center sm:p-6"
              onClick={() => setOpen(false)}
            >
              <div
                role="listbox"
                aria-label={ariaLabel || "Choose an option"}
                onClick={(event) => event.stopPropagation()}
                className="flex max-h-[75vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-card pb-[env(safe-area-inset-bottom)] shadow-2xl sm:rounded-2xl"
              >
                <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border" aria-hidden="true" />
                <div className="overflow-y-auto overscroll-contain px-2 py-2">
                  {options.map((option) => {
                    const isSelected = option.value === current;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={option.disabled}
                        onClick={() => choose(option)}
                        className={`flex min-h-[48px] w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-[16px] transition hover:bg-secondary disabled:opacity-50 ${
                          isSelected ? "font-semibold text-accent-ink" : "text-foreground"
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected ? <Check className="h-5 w-5 shrink-0" aria-hidden="true" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
