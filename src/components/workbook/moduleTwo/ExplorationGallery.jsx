import React, { useEffect, useRef } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Brain,
  Check,
  ChefHat,
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
import { useStore } from "@/lib/store";
import { CATEGORIES, CATEGORY_BY_ID, possibilityById } from "@/lib/explorationGallery";
import { METHOD_BY_ID } from "@/lib/moduleTwo";

const ICONS = { wrench: Wrench, sparkles: Sparkles, users: Users, leaf: Leaf, music: Music, hammer: Hammer, brain: Brain, chef: ChefHat, cpu: Cpu, book: BookOpen, network: Network, person: PersonStanding };
const TINTS = ["bg-secondary", "bg-primary/10", "bg-[#E9A23B]/20"];

/** Where someone is in the gallery. Kept on this device so leaving and coming back keeps their place. */
const VIEW_KEY = "m2GalleryView";

function Heading({ children, focusKey }) {
  const ref = useRef(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (ref.current) ref.current.focus({ preventScroll: false });
  }, [focusKey]);
  return (
    <h3 ref={ref} tabIndex={-1} className="font-heading text-[20px] font-semibold leading-snug text-foreground outline-none">
      {children}
    </h3>
  );
}

function BackButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {children}
    </button>
  );
}

function CategoryGrid({ noticed, savedIds, startId, onOpen }) {
  return (
    <div className="space-y-3">
      <Heading focusKey="grid">12 areas to explore</Heading>
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        Open any area to see specific possibilities. Look at as many or as few as you like.
        {noticed.length ? " Areas you selected in Module 1 are marked, but every area is open to you." : ""}
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="list">
        {CATEGORIES.map((category, index) => {
          const Icon = ICONS[category.icon] || Sparkles;
          const saved = category.possibilities.filter((item) => savedIds.includes(item.id)).length;
          const holdsStart = category.possibilities.some((item) => item.id === startId);
          const wasNoticed = noticed.includes(category.id);
          return (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => onOpen(category.id)}
                className="flex h-full min-h-[44px] w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-colors hover:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ink"
              >
                <span className={`flex h-20 w-full items-center justify-center ${TINTS[index % TINTS.length]}`}>
                  <span role="img" aria-label={category.alt} className="flex">
                    <Icon className="h-9 w-9 text-accent-ink" strokeWidth={1.6} aria-hidden="true" />
                  </span>
                </span>
                <span className="flex flex-1 flex-col gap-1.5 p-3">
                  <span className="block font-heading text-[16px] font-semibold leading-snug text-foreground">{category.title}</span>
                  <span className="flex flex-wrap gap-1 text-[12px]">
                    {wasNoticed ? <span className="rounded-full bg-[#E9A23B]/25 px-2 py-0.5 text-foreground">Noticed in Module 1</span> : null}
                    {holdsStart ? <span className="rounded-full bg-accent-ink px-2 py-0.5 text-primary-foreground">Your starting point</span> : null}
                    {saved ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-foreground">{saved} saved</span> : null}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CategoryView({ category, savedIds, startId, onBack, onOpen }) {
  return (
    <div className="space-y-4">
      <BackButton onClick={onBack}>All areas</BackButton>
      <div>
        <Heading focusKey={category.id}>{category.title}</Heading>
        <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{category.description}</p>
      </div>
      <p className="text-[15px] font-medium text-foreground">Possible directions</p>
      <ul className="space-y-2" role="list">
        {category.possibilities.map((item) => {
          const saved = savedIds.includes(item.id);
          const start = item.id === startId;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onOpen(item.id)}
                className="flex min-h-[52px] w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left hover:bg-secondary"
              >
                <span className="flex-1 text-[16px] leading-snug text-foreground">{item.title}</span>
                {start ? <span className="shrink-0 rounded-full bg-accent-ink px-2 py-0.5 text-[12px] text-primary-foreground">Starting point</span> : null}
                {saved && !start ? <BookmarkCheck className="h-5 w-5 shrink-0 text-accent-ink" aria-label="Saved" /> : null}
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-faint" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="workbook-label">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function PossibilityView({ item, category, saved, start, onBack, onToggleSave, onStart }) {
  return (
    <div className="space-y-5">
      <BackButton onClick={onBack}>{category.title}</BackButton>
      <div>
        <p className="text-[13px] text-muted-foreground">{category.title}</p>
        <Heading focusKey={item.id}>{item.title}</Heading>
      </div>
      <Section title="What is it?">
        <p className="max-w-[68ch] text-[16px] leading-relaxed text-foreground">{item.what}</p>
      </Section>
      <Section title="What could you explore?">
        <ul className="list-disc space-y-1.5 pl-5 text-[16px] leading-relaxed text-foreground">
          {item.explore.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Section>
      <Section title="How could you try it?">
        <ul className="space-y-2">
          {item.tryIt.map((way) => (
            <li key={way.text} className="flex items-start gap-3 rounded-lg bg-secondary p-3">
              <span className="mt-0.5 shrink-0 rounded-full bg-card px-2 py-0.5 text-[12px] font-semibold text-accent-ink">
                {METHOD_BY_ID[way.method]?.label || way.method}
              </span>
              <span className="text-[15px] leading-relaxed text-foreground">{way.text}</span>
            </li>
          ))}
        </ul>
        {item.note ? <p className="mt-2 text-[14px] text-muted-foreground">{item.note}</p> : null}
      </Section>
      <Section title="Where could it lead?">
        <ul className="flex flex-wrap gap-2">
          {item.lead.map((line) => (
            <li key={line} className="rounded-full border border-border bg-card px-3 py-1 text-[14px] text-foreground">
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[13px] text-muted-faint">Possibilities, not recommendations or predictions.</p>
      </Section>
      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          aria-pressed={saved}
          onClick={onToggleSave}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-input bg-card px-4 text-[15px] font-medium text-foreground hover:bg-secondary"
        >
          {saved ? <BookmarkCheck className="h-4 w-4" aria-hidden="true" /> : <Bookmark className="h-4 w-4" aria-hidden="true" />}
          {saved ? "Saved · tap to remove" : "Save for later"}
        </button>
        <button
          type="button"
          aria-pressed={start}
          onClick={onStart}
          className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-4 text-[15px] font-medium ${
            start ? "bg-accent-ink text-primary-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {start ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
          {start ? "My starting point · tap to clear" : "Use as my starting point"}
        </button>
      </div>
    </div>
  );
}

/**
 * The Exploration Gallery: areas → possibilities → one possibility in detail.
 * Browsing never saves anything. Saving and choosing a starting point are separate taps.
 */
export default function ExplorationGallery({ noticed = [], savedIds = [], startId = "", onToggleSave, onStart }) {
  const [view, setView] = useStore(VIEW_KEY, { category: "", possibility: "" });
  const category = CATEGORY_BY_ID[view?.category] || null;
  const item = possibilityById(view?.possibility);

  return (
    <section aria-label="Exploration Gallery" className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      {item && category ? (
        <PossibilityView
          item={item}
          category={category}
          saved={savedIds.includes(item.id)}
          start={startId === item.id}
          onBack={() => setView({ category: category.id, possibility: "" })}
          onToggleSave={() => onToggleSave(item.id)}
          onStart={() => onStart(startId === item.id ? "" : item.id)}
        />
      ) : category ? (
        <CategoryView
          category={category}
          savedIds={savedIds}
          startId={startId}
          onBack={() => setView({ category: "", possibility: "" })}
          onOpen={(id) => setView({ category: category.id, possibility: id })}
        />
      ) : (
        <CategoryGrid noticed={noticed} savedIds={savedIds} startId={startId} onOpen={(id) => setView({ category: id, possibility: "" })} />
      )}
    </section>
  );
}
