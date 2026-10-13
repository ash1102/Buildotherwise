import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MAP_PICK_FIELDS, MAP_QUESTION_PARTS, QUESTIONS_BY_ID } from "@/lib/lifeMap";

/**
 * The Life Map as a growing tree. The middle is the life you're living; each Part of
 * the questions is a branch; each question is a smaller branch; each answer is a leaf
 * on the question it answers. Part 6 sits at the end as the one thing worth exploring.
 * Links the person chose themselves are drawn as dashed marigold curves. Nothing is
 * guessed: every leaf is exactly what was written, where it was written.
 */

const TREE_CSS = `
.lm-tree { --lm-line: hsl(var(--primary) / 0.35); --lm-line-soft: hsl(var(--primary) / 0.2); }
.lm-tree ul, .lm-tree ol { list-style: none; margin: 0; padding: 0; }
.lm-branch { position: relative; padding-left: 26px; }
.lm-branch::before {
  content: ""; position: absolute; left: 0; top: 0; width: 20px; height: 1.15rem;
  border-left: 2px solid var(--lm-line); border-bottom: 2px solid var(--lm-line);
  border-bottom-left-radius: 14px;
}
.lm-branch::after {
  content: ""; position: absolute; left: 0; top: 1.15rem; bottom: -0.25rem;
  border-left: 2px solid var(--lm-line);
}
.lm-branch:last-child::after { display: none; }
.lm-twig { position: relative; padding-left: 22px; }
.lm-twig::before {
  content: ""; position: absolute; left: 0; top: 0; width: 16px; height: 0.95rem;
  border-left: 1.5px solid var(--lm-line-soft); border-bottom: 1.5px solid var(--lm-line-soft);
  border-bottom-left-radius: 12px;
}
.lm-twig::after {
  content: ""; position: absolute; left: 0; top: 0.95rem; bottom: -0.25rem;
  border-left: 1.5px solid var(--lm-line-soft);
}
.lm-twig:last-child::after { display: none; }
.lm-in { animation: lm-in 520ms cubic-bezier(.3,.7,.2,1) both; }
@keyframes lm-in { from { opacity: 0; transform: translateY(6px) scale(.96); } to { opacity: 1; transform: none; } }
.lm-link { stroke-dasharray: 6 6; animation: lm-fade 600ms ease-out both; }
@keyframes lm-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .lm-in, .lm-link { animation: none; } }
`;

/** A sentence-starter answer reads on its own as a line; under its own question, show only the answer. */
function leafText(node, question) {
  const text = node.label || node.text || "";
  if (node.label || !question || !question.starter) return text;
  const start = question.text.replace(/…$/, "").trim();
  return text.startsWith(start) ? text.slice(start.length).trim() || text : text;
}

export default function LifeMapCanvas({ graph, pick, selectedId, onSelect, onJumpToPart }) {
  const boxRef = useRef(null);
  const [curves, setCurves] = useState([]);

  const nodesById = useMemo(() => Object.fromEntries(graph.nodes.map((node) => [node.id, node])), [graph.nodes]);

  /** Branches per section, in the order of the questions; lines added by hand go last. */
  const sections = useMemo(
    () =>
      graph.sections.map((section) => {
        const partIndex = MAP_QUESTION_PARTS.findIndex((part) => part.section === section.key);
        const part = MAP_QUESTION_PARTS[partIndex];
        const branches = (part ? part.questions : [])
          .map((question) => ({
            key: question.id,
            question: QUESTIONS_BY_ID[question.id],
            label: QUESTIONS_BY_ID[question.id].branch,
            nodes: section.nodes.filter((node) => node.question_id === question.id),
          }))
          .filter((branch) => branch.nodes.length);
        const own = section.nodes.filter((node) => !QUESTIONS_BY_ID[node.question_id]);
        if (own.length) branches.push({ key: `${section.key}-own`, question: null, label: "Added by you", nodes: own });
        return { ...section, partIndex, branches, count: section.nodes.length };
      }),
    [graph.sections]
  );

  /** "at Gym" / "to Mom's house": a Part 1 answer tied to a place the person named. */
  const placeNote = (node) => {
    const question = QUESTIONS_BY_ID[node.question_id];
    if (!question || !question.aboutPlace) return "";
    const places = (node.links || [])
      .map((id) => nodesById[id])
      .filter((other) => other && other.question_id === "p1-places")
      .map((other) => other.label || other.text);
    return places.length ? `${question.aboutPlace} ${places.join(", ")}` : "";
  };

  const pickHas = MAP_PICK_FIELDS.some((field) => String((pick || {})[field.id] || "").trim());
  const pickNothing = Boolean((pick || {}).nothing_yet);

  /** Dashed curves for links the person chose, measured from where the leaves actually sit. */
  const measure = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    const origin = box.getBoundingClientRect();
    const spot = (id) => {
      const el = box.querySelector(`[data-node-id="${id}"]`);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { left: rect.left - origin.left, right: rect.right - origin.left, y: rect.top - origin.top + rect.height / 2 };
    };
    const next = [];
    graph.links.forEach(([a, b]) => {
      const pa = spot(a);
      const pb = spot(b);
      if (!pa || !pb) return;
      const x1 = pa.right + 2;
      const x2 = pb.right + 2;
      const bulge = Math.min(origin.width - 6, Math.max(x1, x2) + 28 + Math.abs(pa.y - pb.y) * 0.12);
      next.push({
        id: `${a}-${b}`,
        d: `M ${x1} ${pa.y} C ${bulge} ${pa.y}, ${bulge} ${pb.y}, ${x2} ${pb.y}`,
        a: [x1, pa.y],
        b: [x2, pb.y],
      });
    });
    setCurves(next);
  }, [graph.links]);

  useLayoutEffect(() => {
    measure();
    const box = boxRef.current;
    if (!box || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => measure());
    observer.observe(box);
    return () => observer.disconnect();
  }, [measure, graph, selectedId]);

  let order = 0;
  const delay = () => ({ animationDelay: `${Math.min(order++ * 35, 900)}ms` });

  return (
    <div
      ref={boxRef}
      className="lm-tree relative overflow-hidden rounded-lg border border-border bg-card/60 px-4 pb-6 pt-5 sm:px-6"
      aria-label="Your Life Map. Each Part is a branch, each question a smaller branch, and each answer a line on it."
    >
      <style>{TREE_CSS}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 0%, hsl(var(--primary) / 0.08), transparent 55%), radial-gradient(ellipse at 100% 100%, hsl(var(--accent-ink-soft) / 0.10), transparent 50%)",
        }}
      />

      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {curves.map((curve) => (
          <g key={curve.id}>
            <path className="lm-link" d={curve.d} fill="none" stroke="hsl(var(--accent-ink-soft))" strokeWidth={1.75} strokeLinecap="round" />
            <circle cx={curve.a[0]} cy={curve.a[1]} r={2.5} fill="hsl(var(--accent-ink-soft))" />
            <circle cx={curve.b[0]} cy={curve.b[1]} r={2.5} fill="hsl(var(--accent-ink-soft))" />
          </g>
        ))}
      </svg>

      <div className="relative">
        <div className="lm-in inline-flex flex-col rounded-2xl border border-dashed border-primary/45 bg-background px-4 py-2.5 shadow-sm" style={delay()}>
          <span className="font-heading text-[15px] leading-tight text-foreground">The life you’re actually living</span>
          <span className="text-[11.5px] text-muted-faint">your answers, where you put them</span>
        </div>

        <ol className="mt-3 ml-5 space-y-4" aria-label="Parts of your map">
          {sections.map((section) => (
            <li key={section.key} className="lm-branch">
              <div className="lm-in flex flex-wrap items-center gap-2" style={delay()}>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-[13px] font-medium text-primary-foreground shadow-sm">
                  <span className="text-[11px] opacity-75">Part {section.partIndex + 1}</span>
                  {section.label}
                </span>
                {section.count ? (
                  <span className="text-[11.5px] text-muted-faint">
                    {section.count} {section.count === 1 ? "line" : "lines"}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onJumpToPart && onJumpToPart(section.partIndex)}
                    className="text-[12px] text-muted-faint underline decoration-border underline-offset-2 hover:text-primary"
                  >
                    Nothing yet. Answer Part {section.partIndex + 1}
                  </button>
                )}
              </div>

              {section.branches.length ? (
                <ul className="mt-2 ml-3 space-y-2.5">
                  {section.branches.map((branch) => (
                    <li key={branch.key} className="lm-twig">
                      <p className="lm-in text-[12px] font-medium text-accent-ink" style={delay()}>
                        {branch.label}
                      </p>
                      <ul className="mt-1.5 flex flex-wrap gap-1.5">
                        {branch.nodes.map((node) => {
                          const note = placeNote(node);
                          const selected = selectedId === node.id;
                          return (
                            <li key={node.id}>
                              <button
                                type="button"
                                data-node-id={node.id}
                                aria-pressed={selected}
                                title={node.text}
                                onClick={() => onSelect(node.id)}
                                style={delay()}
                                className={`lm-in max-w-[16rem] rounded-full border bg-background px-3 py-1 text-left text-[13px] leading-snug text-foreground shadow-[0_2px_8px_-3px_hsl(var(--primary)/0.3)] transition hover:border-primary/60 ${
                                  selected ? "border-primary ring-2 ring-primary/30" : "border-border"
                                }`}
                              >
                                <span className="line-clamp-2">{leafText(node, branch.question) || "Not written yet"}</span>
                                {note ? <span className="block text-[11px] text-muted-faint">{note}</span> : null}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}

          <li className="lm-branch">
            <div className="lm-in" style={delay()}>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent-ink-soft px-3 py-1 text-[13px] font-medium text-foreground shadow-sm">
                <span className="text-[11px] opacity-75">Part 6</span>
                Worth exploring
              </span>
            </div>
            <div className="lm-in mt-2 ml-3" style={delay()}>
              {pickNothing ? (
                <p className="text-[13px] text-muted-foreground">Nothing on the map is worth exploring yet. That counts.</p>
              ) : pickHas ? (
                <div className="max-w-md rounded-xl border border-accent-ink-soft bg-background px-4 py-3 shadow-sm">
                  {MAP_PICK_FIELDS.map((field) => {
                    const value = String((pick || {})[field.id] || "").trim();
                    if (!value) return null;
                    return (
                      <p key={field.id} className="text-[13px] leading-relaxed">
                        <span className="text-muted-faint">{field.label} </span>
                        <span className="text-foreground">{value}</span>
                      </p>
                    );
                  })}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onJumpToPart && onJumpToPart(MAP_QUESTION_PARTS.length)}
                  className="text-[12px] text-muted-faint underline decoration-border underline-offset-2 hover:text-primary"
                >
                  Nothing yet. Answer Part 6
                </button>
              )}
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
