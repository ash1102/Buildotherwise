import React, { createContext, useContext, useMemo, useState } from "react";

const JournalContext = createContext({
  lesson: null,
  setLesson: () => {},
  panelOpen: false,
  openPanel: () => {},
  closePanel: () => {},
});

export function JournalProvider({ children }) {
  const [lesson, setLesson] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const value = useMemo(
    () => ({
      lesson,
      setLesson,
      panelOpen,
      openPanel: () => setPanelOpen(true),
      closePanel: () => setPanelOpen(false),
    }),
    [lesson, panelOpen]
  );
  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournalContext() {
  return useContext(JournalContext);
}