import { useEffect, useRef } from "react";

/**
 * While an overlay is open, the system Back action closes it instead of leaving the page.
 * Opening pushes one history entry. Closing by any other means removes that entry again.
 */
export default function useBackClose(open, onClose, name) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;

    const state = window.history.state || {};
    window.history.pushState({ ...state, idx: (state.idx ?? 0) + 1, overlay: name }, "");

    let closedByBack = false;
    const onPop = () => {
      closedByBack = true;
      onCloseRef.current();
    };
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("popstate", onPop);
      if (!closedByBack && window.history.state?.overlay === name) window.history.back();
    };
  }, [open, name]);
}
