import React, { useEffect, useLayoutEffect, useRef } from "react";
import CurriculumHome from "@/pages/CurriculumHome";
import JournalPage from "@/pages/JournalPage";
import LifeMapPage from "@/pages/LifeMapPage";
import MyRecordsPage from "@/pages/MyRecordsPage";

const TAB_PAGES = [
  { path: "/", Page: CurriculumHome },
  { path: "/journal", Page: JournalPage },
  { path: "/map", Page: LifeMapPage },
  { path: "/my-records", Page: MyRecordsPage },
];

/** Last scroll position per tab, kept for the life of the app session. */
const scrollMemory = {};

/**
 * One tab page. Once visited it stays mounted and is only hidden when another tab
 * is active, so inputs, expanded sections and loaded data are kept. Each tab
 * remembers its own scroll position.
 */
function TabPanel({ path, active, Page }) {
  const activeRef = useRef(false);

  useLayoutEffect(() => {
    activeRef.current = active;
    if (active) {
      window.scrollTo({ top: scrollMemory[path] ?? 0, left: 0, behavior: "instant" });
    }
  }, [active, path]);

  useEffect(() => {
    // Only the visible tab records scroll. Hiding a tab shrinks the page and fires scroll
    // events that would otherwise overwrite the saved position.
    const onScroll = () => {
      if (activeRef.current) scrollMemory[path] = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [path]);

  return (
    <div hidden={!active} aria-hidden={!active} className="animate-page-in">
      <Page />
    </div>
  );
}

/** Mounts each visited tab page and shows only the one for the current path. */
export default function TabPanels({ pathname, visited }) {
  return TAB_PAGES.filter(({ path }) => visited.has(path)).map(({ path, Page }) => (
    <TabPanel key={path} path={path} active={pathname === path} Page={Page} />
  ));
}
