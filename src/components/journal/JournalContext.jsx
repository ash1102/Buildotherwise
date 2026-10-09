import React, { createContext, useContext, useMemo, useState } from "react";

const JournalContext = createContext({ lesson: null, setLesson: () => {} });

export function JournalProvider({ children }) {
  const [lesson, setLesson] = useState(null);
  const value = useMemo(() => ({ lesson, setLesson }), [lesson]);
  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournalContext() {
  return useContext(JournalContext);
}