import { useCallback, useRef } from "react";
import { insertDictatedText } from "@/lib/dictation";

export function useFieldDictation(forwardedRef, onChange) {
  const element = useRef(null);
  const latestChange = useRef(onChange);
  latestChange.current = onChange;
  const fieldRef = useCallback((node) => {
    element.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);
  return {
    fieldRef,
    insert: (words) => insertDictatedText(element.current, words, latestChange.current),
    focus: () => element.current?.focus()
  };
}
