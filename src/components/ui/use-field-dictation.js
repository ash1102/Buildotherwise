import { useCallback, useRef } from "react";

/** Insert at the field's cursor through its usual change/save handler. */
export function useFieldDictation(forwardedRef, onChange) {
  const element = useRef(null);
  const latestChange = useRef(onChange);
  latestChange.current = onChange;
  const fieldRef = useCallback((node) => {
    element.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);
  const insert = (words) => {
    const node = element.current;
    if (!node || node.disabled || node.readOnly || !words) return;
    const current = node.value || "";
    const start = node.selectionStart ?? current.length;
    const end = node.selectionEnd ?? start;
    const before = current.slice(0, start);
    const after = current.slice(end);
    const phrase = (before && !/\s$/.test(before) ? " " : "") + words + (after && !/^\s|^[.,!?;:]/.test(after) ? " " : "");
    const next = before + phrase + after;
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(node), "value")?.set;
    if (setter) setter.call(node, next); else node.value = next;
    if (latestChange.current) {
      latestChange.current({ target: node, currentTarget: node, type: "change", preventDefault() {}, stopPropagation() {}, persist() {} });
    } else node.dispatchEvent(new Event("input", { bubbles: true }));
    const cursor = before.length + phrase.length;
    requestAnimationFrame(() => { if (element.current === node) node.setSelectionRange(cursor, cursor); });
  };
  return { fieldRef, insert, focus: () => element.current?.focus() };
}
