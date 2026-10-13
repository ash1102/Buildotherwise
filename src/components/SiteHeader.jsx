import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { LogOut, Menu, PenLine, Settings as SettingsIcon, X } from "lucide-react";
import { useJournalContext } from "@/components/journal/JournalContext";
import { useAuth } from "@/lib/AuthContext";

const LINKS = [
  { to: "/", label: "Workbook", end: true },
  { to: "/journal", label: "Journal" },
  { to: "/map", label: "Life Map" },
  { to: "/discovery-map", label: "Discovery Map" },
  { to: "/record", label: "Discovery Record" },
  { to: "/program-library", label: "Library" },
  { to: "/tribe-threads", label: "Tribe Threads" },
  { to: "/aspects", label: "Aspects" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

/** What someone can reach before logging in: the welcome, Getting Started, and the two pages about the program. */
const PUBLIC_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/getting-started", label: "Getting Started" },
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
  const { isAuthenticated, user, logout } = useAuth();
  const { pathname } = useLocation();
  const links = isAuthenticated ? LINKS : PUBLIC_LINKS;

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
          {links.slice(0, 8).map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {user?.role === "admin" ? (
                <Link
                  to="/preview"
                  className="rounded-md px-2 py-2 text-[14px] font-medium text-accent-ink transition hover:bg-secondary"
                >
                  Preview
                </Link>
              ) : null}
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
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-[14px] font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Log in
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? "Close the menu" : "Open the menu"}
            className={`inline-flex items-center justify-center rounded-md border border-input bg-card p-2 text-foreground transition hover:bg-secondary ${
              isAuthenticated ? "" : "lg:hidden"
            }`}
          >
            {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="site-menu"
          aria-label="Main"
          className={`max-h-[70vh] overflow-y-auto border-t border-border bg-card px-4 py-2 sm:px-6 ${
            isAuthenticated ? "" : "lg:hidden"
          }`}
        >
          <ul className="mx-auto grid max-w-6xl gap-0.5 py-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end} className={({ isActive }) => `block ${linkClass({ isActive })}`}>
                  {link.label}
                </NavLink>
              </li>
            ))}
            {isAuthenticated ? (
              <>
                <li className="mt-1 border-t border-border pt-1">
                  <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-2 ${linkClass({ isActive })}`}>
                    <SettingsIcon className="h-4 w-4" aria-hidden="true" />
                    Settings
                  </NavLink>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      logout(false);
                      window.location.href = "/";
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[15px] text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Log out
                  </button>
                </li>
              </>
            ) : null}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}