import React from "react";

/**
 * The same map as a list — an accessibility option, not the main view. Every node
 * keeps its full answer, its question, and the links it holds.
 */
export default function LifeMapList({ graph, explore = [], selectedId, onSelect, onRemove }) {
  const byId = (id) => graph.nodes.find((node) => node.id === id);

  return (
    <div className="space-y-6">
      {graph.sections.map((section) => (
        <section key={section.key} className="rounded-lg border border-border bg-card p-5">
          <p className="workbook-label">{section.label}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-faint">{section.prompt}</p>

          {section.nodes.length ? (
            <ul className="mt-4 space-y-4">
              {section.nodes.map((node) => (
                <li key={node.id} className="border-l-2 border-primary/30 pl-3">
                  <p className="text-[14px] leading-relaxed text-foreground">{node.label || node.text}</p>
                  {node.label && node.text ? (
                    <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{node.text}</p>
                  ) : null}
                  {node.source_label ? (
                    <p className="mt-1 text-[12px] text-muted-faint">From {node.source_label}</p>
                  ) : null}
                  {node.links && node.links.length ? (
                    <p className="mt-1 text-[12px] text-muted-faint">
                      Linked to{" "}
                      {node.links
                        .map((id) => {
                          const other = byId(id);
                          return other ? other.label || other.text : "a removed line";
                        })
                        .join(" · ")}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <button
                      type="button"
                      onClick={() => onSelect(node.id)}
                      aria-pressed={selectedId === node.id}
                      className="text-[12.5px] text-primary underline decoration-border underline-offset-2 transition hover:text-accent-ink"
                    >
                      {selectedId === node.id ? "Open on the map" : "Show on the map"}
                    </button>
                    {onRemove ? (
                      <button
                        type="button"
                        onClick={() => onRemove(node)}
                        aria-label={`Remove ${node.label || node.text || "this line"}`}
                        className="text-[12.5px] text-muted-faint underline decoration-border underline-offset-2 transition hover:text-destructive"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[13px] text-muted-faint">Nothing here yet.</p>
          )}
        </section>
      ))}
      {explore.length ? (
        <section className="rounded-lg border border-border bg-card p-5">
          <p className="workbook-label">Worth exploring</p>
          <ul className="mt-4 space-y-3">
            {explore.map((line) => (
              <li key={line.id} className="border-l-2 border-primary/30 pl-3">
                {line.label ? <p className="text-[12px] text-muted-faint">{line.label}</p> : null}
                <p className="text-[14px] leading-relaxed text-foreground">{line.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}