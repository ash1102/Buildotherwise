import React from "react";
import { cn } from "@/lib/utils";
import DictateButton from "@/components/workbook/DictateButton";
import { useFieldDictation } from "./use-field-dictation";

const Textarea = React.forwardRef(({ className, onChange, dictation = true, ...props }, ref) => {
  const { fieldRef, insert, focus } = useFieldDictation(ref, onChange);
  return (
    <div className="w-full min-w-0">
      <textarea ref={fieldRef} onChange={onChange} {...props}
        className={cn("flex min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-[16px] leading-relaxed shadow-sm transition-colors placeholder:text-muted-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className)} />
      {dictation && !props.readOnly && !props.disabled ? <div className="mt-2">
        <DictateButton onText={insert} onBeforeStart={focus} label={props["aria-label"] || "this text box"} />
      </div> : null}
    </div>
  );
});
Textarea.displayName = "Textarea";
export { Textarea };
