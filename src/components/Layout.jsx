import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { JournalProvider } from "@/components/journal/JournalContext";
import JournalWidget from "@/components/journal/JournalWidget";
import DashedMotif from "@/components/workbook/DashedMotif";

const LINKS = [
  { to: "/", label: "Workbook", end: true },
  { to: "/journal", label: "Journal" },
  { to: "/map", label: "Life Map" },
  { to: "/record", label: "Discovery Record" },
  { to: "/program-library", label: "Library" },
  { to: "/tribe-threads", label: "Tribe Threads" },
  { to: "/journal-reflection", label: "Reflection" },
];

export default function Layout() {
  return (
    <JournalProvider>
      <div className="flex min-h-screen flex-col">
        <header className="no-print sticky top-0 z-30 border-b border-natural bg-ivory/85 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
            <NavLink to="/" className="flex items-center gap-3">
              <DashedMotif />
              <span>
                <span className="block font-heading text-lg leading-none text-ink">Entrepalooza</span>
                <span className="mt-1 block text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                  Build Otherwise · Pilot 1
                </span>
              </span>
            </NavLink>
            <nav className="flex flex-wrap gap-x-5 gap-y-2">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `text-[13px] transition ${
                      isActive
                        ? "text-teal-deep underline decoration-copper decoration-2 underline-offset-4"
                        : "text-ink-soft hover:text-teal-deep"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        {/* The extra bottom room keeps the floating journal button clear of the last controls on a page. */}
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 pt-8 pb-24 sm:pt-12 sm:pb-28">
          <Outlet />
        </main>

        <footer className="no-print border-t border-natural bg-ivory/70">
          <div className="mx-auto max-w-5xl px-5 py-6 text-[12px] leading-relaxed text-ink-faint">
            <p>
              Pilot 1 covers Getting Started and Modules 1–5. Nothing you type on these pages is sent to Entrepalooza —
              it stays in this browser until you choose to share it.
            </p>
            <p className="mt-2">
              This is an educational workbook, not therapy or treatment. Support and concern contacts are still being
              confirmed.
            </p>
          </div>
        </footer>

        <JournalWidget />
      </div>
    </JournalProvider>
  );
}