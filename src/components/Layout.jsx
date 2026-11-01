import React, { Suspense, useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { JournalProvider } from "@/components/journal/JournalContext";
import JournalWidget from "@/components/journal/JournalWidget";
import SiteHeader from "@/components/SiteHeader";
import TabPanels from "@/components/TabPanels";
import BackBar, { needsBackBar } from "@/components/BackBar";
import PullToRefresh from "@/components/PullToRefresh";
import { useAuth } from "@/lib/AuthContext";
import { isTabPath, rememberTabPath } from "@/lib/tabs";
import GettingStartedHost from "@/components/gettingStarted/GettingStartedHost";
import { useApplyDisplay } from "@/lib/display";

function RouteFallback() {
  return (
    <div className="flex justify-center py-16" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
    </div>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const preview = pathname.startsWith("/preview");
  useApplyDisplay();
  const { isAuthenticated } = useAuth();
  // Tab pages that have been opened this session. They stay mounted, so their state survives tab switches.
  const visitedTabs = useRef(new Set());
  const onTab = isAuthenticated && isTabPath(pathname);
  if (onTab) visitedTabs.current.add(pathname);
  useEffect(() => {
    rememberTabPath(pathname);
  }, [pathname]);

  return (
    <JournalProvider>
      <div className="flex min-h-screen flex-col pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <SiteHeader />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8">
          <Suspense fallback={<RouteFallback />}>
            {isAuthenticated ? <TabPanels pathname={pathname} visited={visitedTabs.current} /> : null}
            {onTab ? null : (
              <div key={pathname} className="animate-page-in">
                {needsBackBar(pathname) ? <BackBar /> : null}
                <Outlet />
              </div>
            )}
          </Suspense>
        </main>

        <footer className="no-print border-t border-border bg-card">
          <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-24 text-[14px] leading-relaxed text-muted-faint sm:px-6 lg:px-8">
            <nav aria-label="About Build Otherwise" className="mb-3 flex flex-wrap gap-x-5 gap-y-1">
              <Link to="/about" className="inline-block py-1.5 font-medium text-accent-ink underline underline-offset-2">
                About Entrepalooza
              </Link>
              <Link to="/mission" className="inline-block py-1.5 font-medium text-accent-ink underline underline-offset-2">
                Mission
              </Link>
              <Link to="/programs" className="inline-block py-1.5 font-medium text-accent-ink underline underline-offset-2">
                Programs
              </Link>
              <Link to="/get-involved" className="inline-block py-1.5 font-medium text-accent-ink underline underline-offset-2">
                Get involved
              </Link>
              <Link to="/contact" className="inline-block py-1.5 font-medium text-accent-ink underline underline-offset-2">
                Contact Ashley
              </Link>
            </nav>
            <p className="font-medium text-foreground/80">Entrepalooza is an educational workbook, not therapy or treatment.</p>
            <p className="mt-2">
              {preview
                ? "Preview answers are saved to your account when you choose save."
                : "Your workbook and journal are saved to your account. Other participants can’t see them."}{" "}
              Messages and feedback go out only when you hit submit.
            </p>
            <p className="mt-2">
              Tribe Threads are group discussions on the workbook’s practices. Replies there are shared with your group,
              under your name, and only if you post one.
            </p>
            <p className="mt-2">Getting Started and Modules 1–5 are open. Modules 6–10 are locked. © Build Otherwise.</p>
          </div>
        </footer>

        <PullToRefresh />
        <JournalWidget />
        <GettingStartedHost />
      </div>
    </JournalProvider>
  );
}