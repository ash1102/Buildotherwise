import React from "react";
import { cn } from "@/lib/utils";
import DictateButton from "@/components/workbook/DictateButton";
import { useFieldDictation } from "./use-field-dictation";

const Input = React.forwardRef((/** @type {any} */ { className, type = "text", onChange, dictation = true, ...props }, ref) => {
  const { fieldRef, insert, focus } = useFieldDictation(ref, onChange);
  const control = <input ref={fieldRef} type={type} onChange={onChange} {...props}
    className={cn("flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-[16px] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-[16px] file:font-medium file:text-foreground placeholder:text-muted-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className)} />;
  if (!dictation || !["text", "search"].includes(type) || props.readOnly || props.disabled) return control;
  return <div className="w-full min-w-0">{control}<div className="mt-2"><DictateButton onText={insert} onBeforeStart={focus} label={props["aria-label"] || "this text box"} /></div></div>;
});
Input.displayName = "Input";
export { Input };
