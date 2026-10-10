import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, PenLine, X } from "lucide-react";
import { useJournalContext } from "@/components/journal/JournalContext";

const LINKS = [
  { to: "/", label: "Workbook", end: true },
  { to: "/journal", label: "Journal" },
  { to: "/map", label: "Life Map" },
  { to: "/discovery-map", label: "Discovery Map" },
  { to: "/record", label: "Discovery Record" },
  { to: "/program-library", label: "Library" },
  { to: "/tribe-threads", label: "Tribe Threads" },
  { to: "/journal-reflection", label: "Reflection" },
  { to: "/aspects", label: "Aspects" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-[15px] transition ${
    isActive ? "bg-secondary font-semibold text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
  }`;

/** The compact sticky header. Destinations collapse into a menu before they can run off the screen. */
export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openPanel } = useJournalContext();
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="no-print sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[13px] font-semibold text-primary-foreground"
          >
            E
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[16px] font-semibold leading-tight text-foreground">Entrepalooza</span>
            <span className="hidden text-[12px] leading-tight text-muted-faint sm:block">Build Otherwise · Pilot 1</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden min-w-0 flex-wrap items-center gap-x-1 lg:flex">
          {LINKS.slice(0, 8).map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="journal-trigger"
            onClick={openPanel}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[14px] font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <PenLine className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add a note</span>
            <span className="sm:hidden">Note</span>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? "Close the menu" : "Open the menu"}
            className="inline-flex items-center justify-center rounded-md border border-input bg-card p-2 text-foreground transition hover:bg-secondary lg:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="site-menu"
          aria-label="Main"
          className="max-h-[70vh] overflow-y-auto border-t border-border bg-card px-4 py-2 sm:px-6 lg:hidden"
        >
          <ul className="mx-auto grid max-w-6xl gap-0.5 py-1">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end} className={({ isActive }) => `block ${linkClass({ isActive })}`}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}