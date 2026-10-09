import React from "react";
import CodeSnippet from "@/components/agent/CodeSnippet";
import { serverUrl } from "@/lib/mcpUrl";

const CLIENTS = [
  {
    name: "Claude",
    steps: [
      "Open the profile menu, then Settings → Connectors.",
      "Choose “Add custom connector”.",
      "Name it Entrepalooza, paste the server address, then Add.",
    ],
  },
  {
    name: "ChatGPT",
    steps: [
      "Open Apps, then turn on Developer mode. ChatGPT warns that developer-mode apps are not reviewed and can be risky, so only add connections you trust.",
      "Choose “Create app”, name it Entrepalooza, paste the server address, then Create.",
      "Before asking it anything, switch the app on from the chat composer.",
    ],
  },
  {
    name: "Cursor",
    steps: [
      "Open Customize, then the MCPs tab.",
      "Choose “New MCP Server”, which opens mcp.json.",
      "Add an entry whose url is the server address, save the file, then toggle it on.",
    ],
  },
];

/** The four places the address can be added, in the order they are usually tried. */
export default function ClientGuide() {
  const url = serverUrl();

  return (
    <section className="space-y-5">
      <h2 className="font-heading text-2xl">Where to add it</h2>

      {CLIENTS.map((client) => (
        <div key={client.name} className="workbook-card p-5 sm:p-6">
          <h3 className="font-heading text-lg">{client.name}</h3>
          <ol className="mt-3 space-y-2">
            {client.steps.map((step, index) => (
              <li key={index} className="flex gap-3 text-[14px] leading-relaxed text-ink-soft">
                <span aria-hidden="true" className="font-heading text-teal-deep">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}

      <div className="workbook-card p-5 sm:p-6">
        <h3 className="font-heading text-lg">Any other client</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          The same address works anywhere a client accepts a streamable HTTP MCP server. A name and the address are
          usually all it asks for, then reload the client so it picks the connection up.
        </p>
        <div className="mt-4">
          <CodeSnippet
            label="mcpServers entry"
            code={`{
  "mcpServers": {
    "entrepalooza": {
      "url": "${url}"
    }
  }
}`}
          />
        </div>
      </div>
    </section>
  );
}