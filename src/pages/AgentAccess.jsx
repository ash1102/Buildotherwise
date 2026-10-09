import React from "react";
import { useAuth } from "@/lib/AuthContext";
import AgentBoundaries from "@/components/agent/AgentBoundaries";
import ConnectionSteps from "@/components/agent/ConnectionSteps";
import NotionWorkspace from "@/components/agent/NotionWorkspace";

export default function AgentAccess() {
  const { user } = useAuth();

  if (!user) return <p className="py-10 text-[14px] text-ink-faint">Opening…</p>;

  if (user.role !== "admin") {
    return (
      <p className="rounded-lg border border-dashed border-natural-deep bg-white/70 p-6 text-[14px] leading-relaxed text-ink-soft">
        This page is for the program team. It carries the connection details for the app's reflection agent, so it stays
        with the people who manage the program.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <header className="max-w-3xl space-y-3">
        <p className="workbook-label">Program team · Agent access</p>
        <h1 className="font-heading text-4xl leading-tight">Connecting to the app's agent</h1>
        <p className="workbook-prose">
          Entrepalooza offers one agent through its API: the conversation journal reflection companion. These are the
          instructions a connection needs, in the order they are used. The last section covers a separate connection, for
          a client that should also reach the Notion workspace where the curriculum is written.
        </p>
      </header>

      <AgentBoundaries />

      <section className="space-y-4">
        <h2 className="font-heading text-2xl">The connection, step by step</h2>
        <ConnectionSteps />
      </section>

      <p className="rounded-lg border border-natural bg-white/60 p-5 text-[13px] leading-relaxed text-ink-faint">
        Connections from outside the app work once the app is published, and the token is the only key they need. If a
        token is ever shared by mistake, manage it from the API page in the dashboard.
      </p>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl">Also connect your client to Notion</h2>
        <NotionWorkspace />
      </section>
    </div>
  );
}