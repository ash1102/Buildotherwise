import React from "react";
import { Link, useParams } from "react-router-dom";
import AspectShell from "@/components/aspects/AspectShell";
import MarkUpPage from "@/components/aspects/interactions/MarkUpPage";
import WeaveReading from "@/components/aspects/interactions/WeaveReading";
import OneLineJournal from "@/components/aspects/interactions/OneLineJournal";
import PrivacyToggles from "@/components/aspects/interactions/PrivacyToggles";
import OnboardingSteps from "@/components/aspects/interactions/OnboardingSteps";
import PullThread from "@/components/aspects/interactions/PullThread";
import ChoicePrompts from "@/components/aspects/interactions/ChoicePrompts";
import { aspectBySlug } from "@/lib/aspects";

const INTERACTIONS = {
  markup: MarkUpPage,
  weave: WeaveReading,
  journal: OneLineJournal,
  privacy: PrivacyToggles,
  onboarding: OnboardingSteps,
  thread: PullThread,
  choices: ChoicePrompts,
};

export default function AspectPage() {
  const { slug } = useParams();
  const aspect = aspectBySlug(slug);

  if (!aspect) {
    return (
      <div className="max-w-xl">
        <h1 className="font-heading text-2xl">That aspect is not here.</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
          There are seven of them, and this address does not match one.
        </p>
        <Link to="/aspects" className="mt-5 inline-block text-[14px] text-teal-deep hover:text-copper">
          See all seven aspects
        </Link>
      </div>
    );
  }

  const Interaction = INTERACTIONS[aspect.interaction];

  return (
    <AspectShell aspect={aspect}>{Interaction ? <Interaction /> : null}</AspectShell>
  );
}