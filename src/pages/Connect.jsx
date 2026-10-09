import React from "react";
import ServerAddress from "@/components/connect/ServerAddress";
import ClientGuide from "@/components/connect/ClientGuide";

export default function Connect() {
  return (
    <div className="space-y-10">
      <header className="max-w-3xl space-y-3">
        <p className="workbook-label">Your own assistant</p>
        <h1 className="font-heading text-4xl leading-tight">Connect an AI assistant to Entrepalooza</h1>
        <p className="workbook-prose">
          Entrepalooza offers its own connection, so an assistant you already use can work with the program on your
          behalf. Add it once, and from then on it acts as you and only for your account.
        </p>
      </header>

      <ServerAddress />

      <ClientGuide />

      <section className="space-y-4">
        <h2 className="font-heading text-2xl">What to expect the first time</h2>
        <ul className="space-y-3">
          <li className="workbook-card p-5 text-[14px] leading-relaxed text-ink-soft">
            Every client asks you to sign in to Entrepalooza and approve the connection. The assistant then reaches what
            your account can already reach — the workbook steps, the library, the tribe threads — and nothing beyond it.
          </li>
          <li className="workbook-card p-5 text-[14px] leading-relaxed text-ink-soft">
            Your answers and journal entries live in this browser, not on the server, so no connection can read them.
            They are only ever part of a conversation if you put them there yourself.
          </li>
          <li className="workbook-card p-5 text-[14px] leading-relaxed text-ink-soft">
            Assistants keep a cached list of what a connection can do. If something is missing or out of date, remove the
            connection and add it again, or reload the client.
          </li>
        </ul>
      </section>
    </div>
  );
}