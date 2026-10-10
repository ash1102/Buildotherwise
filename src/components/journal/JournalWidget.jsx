import React from "react";
import JournalPanel from "./JournalPanel";
import { useJournalContext } from "./JournalContext";

/**
 * The journal slide-over, mounted once in the layout so it is on every page.
 * It is opened from the header button, so it never floats over reading, form
 * fields or Next controls.
 */
export default function JournalWidget() {
  const { panelOpen, closePanel, lesson } = useJournalContext();
  return <JournalPanel open={panelOpen} onClose={closePanel} lesson={lesson} />;
}