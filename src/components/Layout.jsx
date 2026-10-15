import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { JournalProvider } from "@/components/journal/JournalContext";
import JournalWidget from "@/components/journal/JournalWidget";
import SiteHeader from "@/components/SiteHeader";
import GettingStartedHost from "@/components/gettingStarted/GettingStartedHost";
import { useApplyDisplay } from "@/lib/display";

export default function Layout() {
  const { pathname } = useLocation();
  const preview = pathname.startsWith("/preview");
  useApplyDisplay();

  return (
    <JournalProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8">
          <Outlet />
        </main>

        <footer className="no-print border-t border-border bg-card">
          <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-24 text-[14px] leading-relaxed text-muted-faint sm:px-6 lg:px-8">
            <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2">
              <Link to="/about" className="font-medium text-accent-ink underline underline-offset-2">
                About Entrepalooza
              </Link>
              <Link to="/contact" className="font-medium text-accent-ink underline underline-offset-2">
                Contact Ashley
              </Link>
            </div>
            <p className="font-medium text-foreground/80">Entrepalooza is an educational workbook, not therapy or treatment.</p>
            <p className="mt-2">
              {preview
                ? "Preview answers are saved to your account when you choose save."
                : "Your workbook and journal stay on this device."}{" "}
              Messages and feedback go out only when you hit submit.
            </p>
            <p className="mt-2">
              Tribe Threads are group discussions on the workbook’s practices. Replies there are shared with your group,
              under your name, and only if you post one.
            </p>
            <p className="mt-2">Pilot 1: Getting Started and Modules 1–10. © Build Otherwise.</p>
          </div>
        </footer>

        <JournalWidget />
        <GettingStartedHost />
      </div>
    </JournalProvider>
  );
}