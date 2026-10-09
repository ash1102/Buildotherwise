import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Map } from "lucide-react";
import useCurriculum from "@/hooks/useCurriculum";
import { useWorkbook } from "@/lib/workbook";
import ModuleMap from "@/components/workbook/ModuleMap";
import DashedMotif from "@/components/workbook/DashedMotif";
import PrivacyNote from "@/components/workbook/PrivacyNote";

const CYCLE = [
{ label: "Notice", line: "What keeps holding your attention — without turning it into identity." },
{ label: "Try", line: "One small, bounded, reversible try with a stop rule written before you start." },
{ label: "Reflect", line: "What actually happened, what it cost, and what is still unknown." },
{ label: "Decide", line: "Keep, change, test again, pause, stop, another direction, or continue looking." }];


export default function CurriculumHome() {
  const { modules, lessonsByOrder, loading } = useCurriculum();
  const { answers, decisions, states } = useWorkbook();

  return (
    <div className="space-y-14">
      <section>
        <div className="flex items-center gap-4">
          <DashedMotif size="lg" />
          <p className="workbook-label">Pilot 1 · Getting Started and Modules 1–5</p>
        </div>
        <h1 className="mt-5 max-w-3xl font-heading text-4xl leading-[1.1] sm:text-5xl">Notice. Try. Reflect. Decide.

        </h1>
        <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-ink-soft">Start with a question, an ordinary task, or “I don’t know yet.” Explore what holds your attention, try something small if you choose, and decide what comes next.



        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/module/getting-started"
            className="inline-flex items-center gap-2 rounded-full bg-teal-deep px-5 py-2.5 text-[14px] text-ivory transition hover:bg-teal-deep/90">
            
            Start with Enter with Agency
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 rounded-full border border-natural bg-white px-5 py-2.5 text-[14px] text-teal-deep transition hover:border-teal-deep/50">
            
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Your Conversation Journal
          </Link>
          <Link
            to="/map"
            className="inline-flex items-center gap-2 px-2 py-2.5 text-[14px] text-ink-soft transition hover:text-teal-deep">
            
            <Map className="h-4 w-4" aria-hidden="true" />
            The Life Map
          </Link>
        </div>
        <div className="mt-8 max-w-2xl">
          <PrivacyNote>
            Nothing you type here is sent to Entrepalooza. Every answer is saved in this browser and joined to your
            private journal, and it only leaves this browser if you deliberately share an entry or send feedback.
          </PrivacyNote>
        </div>
      </section>

      <section>
        <p className="workbook-label">The cycle you will use again and again</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CYCLE.map((step, index) =>
          <div key={step.label} className="rounded-lg border border-natural bg-white p-5">
              <span className="font-heading text-[13px] text-copper">{`0${index + 1}`}</span>
              <h2 className="mt-2 font-heading text-xl">{step.label}</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{step.line}</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="workbook-label">The program</p>
            <h2 className="mt-2 font-heading text-2xl">Ten modules, one calm list</h2>
          </div>
          <p className="max-w-md text-[13px] leading-relaxed text-ink-faint">
            Modules 6–10 are not built yet, and nothing here pretends otherwise. They are listed plainly so you can see
            where the program is going.
          </p>
        </div>
        <div className="mt-6">
          {loading ?
          <p className="py-8 text-[14px] text-ink-faint">Loading the program…</p> :

          <ModuleMap
            modules={modules}
            lessonsByOrder={lessonsByOrder}
            answers={answers}
            decisions={decisions}
            states={states} />

          }
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-teal-deep/40 bg-white/60 p-6">
        <p className="workbook-label">How your writing is treated</p>
        <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-ink-soft">
          <p>
            <strong className="font-medium text-ink">Saving</strong> keeps your words on this device, attached to the step
            where you wrote them.
          </p>
          <p>
            <strong className="font-medium text-ink">Sharing</strong> is separate, voluntary, and per entry — you choose
            exactly what the program creator receives, and you can see the scope before you send it.
          </p>
          <p>
            Passing, pausing, and stopping are complete answers. They are recorded as choices, not as gaps.
          </p>
        </div>
      </section>
    </div>);

}