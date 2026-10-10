import React from "react";
import { Link } from "react-router-dom";
import ServerUrlField from "@/components/connect/ServerUrlField";
import ClientCard from "@/components/connect/ClientCard";
import { CLIENTS } from "@/lib/agentConnect";

/** How to point an AI assistant at this workbook. Instructions only — nothing is stored here. */
export default function Connect() {
  return (
    <article className="space-y-8">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Connect</p>
        <h1 className="mt-2">Use this workbook with an AI assistant</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          You can add Entrepalooza to the assistant you already use, and then ask about the workbook in the same
          conversation. Set the connection up once on this page, and keep working wherever you normally do.
        </p>
      </header>

      <ServerUrlField />

      <div className="space-y-4">
        {CLIENTS.map((client) => (
          <ClientCard key={client.name} {...client} />
        ))}
      </div>

      <div className="workbook-section">
        <h2 className="text-[18px]">What you are approving</h2>
        <ul className="mt-2 max-w-[68ch] list-disc space-y-2 pl-5 text-[16px] leading-relaxed text-muted-foreground">
          <li>
            Every assistant works as your own account. You sign in on Entrepalooza's consent page yourself, and the
            connection is approved there, not somewhere you cannot see.
          </li>
          <li>
            An assistant reaches only what your account can reach, and what it reads stays in your conversation with it.
            Nothing about your writing is passed to another person.
          </li>
          <li>
            Connecting is optional and reversible. Remove the connector in your client at any time, and nothing in the
            workbook changes.
          </li>
        </ul>
      </div>

      <div className="workbook-section">
        <h2 className="text-[18px]">After the workbook changes</h2>
        <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
          Assistants keep a saved copy of what this workbook offers them. When that changes, reconnect or re-approve the
          connection in your client, or use its refresh control if it has one, so it picks up the current version.
        </p>
      </div>

      <div className="workbook-section">
        <h2 className="text-[18px]">If a step does not match your screen</h2>
        <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
          Assistant apps move their settings around from time to time. The address above does not change, so if a menu
          has been renamed, look for the place your client keeps outside tools and server addresses. Questions about
          your own setup are welcome.
        </p>
        <div className="mt-4">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2 text-[15px] text-foreground transition hover:bg-secondary"
          >
            Contact the program team
          </Link>
        </div>
      </div>
    </article>
  );
}