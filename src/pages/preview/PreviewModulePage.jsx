import React from "react";
import { Link, useParams } from "react-router-dom";
import ContentTag from "@/components/preview/ContentTag";
import SectionHeader from "@/components/preview/SectionHeader";
import StepList from "@/components/preview/StepList";
import { PreviewBanner, PreviewDisclaimer } from "@/components/preview/PreviewNotice";
import { getSection } from "@/lib/preview/course";

/** One section: its readings, its lessons, and what is still missing. */
export default function PreviewModulePage() {
  const { slug } = useParams();
  const section = getSection(slug);

  if (!section) {
    return (
      <div className="space-y-4">
        <PreviewBanner />
        <h1>That section is not in this preview.</h1>
        <Link to="/preview" className="text-[16px] font-medium text-accent-ink underline underline-offset-2">
          Back to the review copy
        </Link>
      </div>
    );
  }

  const carrier = (readingId) => section.steps.find((step) => (step.readings || []).includes(readingId));

  return (
    <div className="space-y-6">
      <PreviewBanner />
      <SectionHeader section={section} />

      <div>
        <h2>Readings</h2>
        <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">
          Each reading comes before its lesson. Readings already in the app are shown as they are stored; anything still
          to come is left empty rather than written for you.
        </p>
        <ul className="mt-4 space-y-3">
          {(section.readings || []).map((reading) => {
            const step = carrier(reading.id);
            return (
              <li key={reading.id} className="workbook-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-[17px]">{reading.title}</h3>
                  <ContentTag tag={reading.tag} />
                </div>
                {step ? (
                  <Link
                    to={`/preview/step/${step.code}`}
                    className="mt-2 inline-block text-[14px] font-medium text-accent-ink underline underline-offset-2"
                  >
                    Read it in {step.title}
                  </Link>
                ) : (
                  <p className="mt-2 text-[14px] text-muted-faint">Not attached to a step yet.</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h2>Lessons</h2>
        <div className="mt-4">
          <StepList section={section} />
        </div>
      </div>

      <Link to="/preview" className="inline-block text-[15px] font-medium text-accent-ink underline underline-offset-2">
        Back to the review copy
      </Link>

      <PreviewDisclaimer />
    </div>
  );
}