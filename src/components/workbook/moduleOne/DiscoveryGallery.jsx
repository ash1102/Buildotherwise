import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Brain,
  Check,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Hammer,
  Leaf,
  Music,
  Network,
  PersonStanding,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { ENCOUNTER_CARDS } from "@/lib/moduleOne";

const ICONS = {
  wrench: Wrench,
  sparkles: Sparkles,
  users: Users,
  leaf: Leaf,
  music: Music,
  hammer: Hammer,
  brain: Brain,
  chef: ChefHat,
  cpu: Cpu,
  book: BookOpen,
  network: Network,
  person: PersonStanding,
};

/** Three theme tints, repeated, so neighbouring cards look different. Written out so Tailwind keeps them. */
const TINTS = ["bg-secondary", "bg-primary/10", "bg-[#E9A23B]/20"];

function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function GalleryCard({ card, index, active, onToggle }) {
  const Icon = ICONS[card.icon] || Sparkles;
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={`relative flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-card text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ink focus-visible:ring-offset-2 ${
        active ? "border-accent-ink ring-2 ring-accent-ink" : "border-border hover:border-input"
      }`}
    >
      <span
        className={`flex h-28 w-full items-center justify-center ${active ? "bg-accent-ink" : TINTS[index % TINTS.length]}`}
      >
        <span role="img" aria-label={card.alt} className="flex">
          <Icon
            className={`h-12 w-12 ${active ? "text-primary-foreground" : "text-accent-ink"}`}
            strokeWidth={1.6}
            aria-hidden="true"
          />
        </span>
      </span>
      {active ? (
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground text-accent-ink"
        >
          <Check className="h-4 w-4" />
        </span>
      ) : null}
      <span className="flex flex-1 flex-col p-4">
        <span className="block font-heading text-[18px] font-semibold leading-snug text-foreground">{card.title}</span>
        <span className="mt-1.5 block flex-1 text-[15px] leading-relaxed text-muted-foreground">{card.description}</span>
        <span className={`mt-3 block text-[13px] font-medium ${active ? "text-accent-ink" : "text-muted-faint"}`}>
          {active ? "Caught my attention · tap to clear" : "Tap if it catches your attention"}
        </span>
      </span>
    </button>
  );
}

/**
 * A short, swipeable look at twelve possibilities. Any number can be selected, including
 * none, and nobody has to scroll to the end. A selection only means "this caught my
 * attention". The gallery never treats it as an interest or a direction.
 */
export default function DiscoveryGallery({ selectedIds, onToggle }) {
  const scroller = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const page = (direction) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const count = selectedIds.length;
  const total = ENCOUNTER_CARDS.length;

  return (
    <section aria-label={`Discovery gallery: ${total} possibilities`} className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] text-muted-foreground">
          {total} possibilities · swipe or use the arrows
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={edges.start}
            aria-label="Previous possibilities"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-input bg-card text-foreground hover:bg-secondary disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            disabled={edges.end}
            aria-label="More possibilities"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-input bg-card text-foreground hover:bg-secondary disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ul
        ref={scroller}
        onScroll={measure}
        role="list"
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-3 sm:mx-0 sm:scroll-px-0 sm:px-0"
      >
        {ENCOUNTER_CARDS.map((card, index) => (
          <li key={card.id} className="w-[78%] max-w-[300px] shrink-0 snap-start sm:w-[260px]">
            <GalleryCard
              card={card}
              index={index}
              active={selectedIds.includes(card.id)}
              onToggle={() => onToggle(card.id)}
            />
          </li>
        ))}
      </ul>

      <p aria-live="polite" className="text-[14px] text-muted-foreground">
        {count === 0
          ? "Nothing selected. That’s fine."
          : `${count} caught your attention. That doesn’t make ${count === 1 ? "it" : "them"} an interest. It’s just something you noticed.`}
      </p>
    </section>
  );
}
