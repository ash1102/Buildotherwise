import React from "react";
import PromptField from "../PromptField";
import PrivacyNote from "../PrivacyNote";
import { useAnswers } from "@/lib/workbook";
import {
  COMPARE_OPTIONS,
  COMPARE_TAKEAWAY,
  LENS_OPTIONS,
  REASON_OPTIONS,
  joinMulti,
  readAnswer,
  recordAnswer,
  splitMulti,
} from "@/lib/moduleOne";
import { EarlierAnswers, FinishControl, MultiChoice, P, Panel, PartFlow, SingleChoice } from "./parts";

const NOT_SURE = "I'm not sure.";

function PartCompare({ lesson, answers }) {
  const choice = readAnswer(answers, lesson.code, "compare");
  const option = COMPARE_OPTIONS.find((item) => item.label === choice);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Panel tone="example" label="Fictional example" title="Jordan">
          <P>
            Jordan spends several hours each week learning to repair motorcycles. Jordan enjoys solving mechanical problems and
            usually feels comfortable stopping when something else needs attention.
          </P>
        </Panel>
        <Panel tone="example" label="Fictional example" title="Casey">
          <P>
            Casey repairs motorcycles to earn money and meet family responsibilities. Casey sometimes enjoys the work, but often
            continues because bills need paying.
          </P>
        </Panel>
      </div>
      <SingleChoice
        legend="Both spend considerable time on the activity. What can we reasonably conclude?"
        options={COMPARE_OPTIONS.map((item) => item.label)}
        value={choice}
        onChange={(next) => recordAnswer(lesson, "compare", next, "Jordan and Casey: what can we reasonably conclude?")}
      />
      <div aria-live="polite">
        {option ? (
          <Panel tone="note">
            <P>{option.feedback}</P>
            <P>{COMPARE_TAKEAWAY}</P>
          </Panel>
        ) : null}
      </div>
      <p className="text-[14px] text-muted-faint">There’s no score here. You can change your answer and read the others.</p>
    </div>
  );
}

function PartReading() {
  return (
    <div className="space-y-4">
      <Panel tone="reading">
        <P>People give their attention to activities for many reasons:</P>
        <ul className="grid max-w-[68ch] list-disc gap-x-8 gap-y-1 pl-5 text-[17px] leading-relaxed text-foreground sm:grid-cols-2">
          <li>enjoyment</li>
          <li>curiosity</li>
          <li>personal importance</li>
          <li>necessity</li>
          <li>responsibility</li>
          <li>financial circumstances</li>
          <li>external expectations</li>
          <li>pressure</li>
        </ul>
        <P>
          These reasons can exist together. You might return to something because you are curious, because you are worried,
          or because someone needs you to. Time and intensity do not, by themselves, tell you that an activity fits the rest
          of your life or that you should continue.
        </P>
        <P>
          An activity can matter to you without being enjoyable. Someone can be skilled at something without wanting to
          pursue it further. And an activity that was unfamiliar at first can become interesting through experience.
        </P>
        <P>The question isn’t just how much attention something gets. It’s what draws you in, what keeps you there, and what it costs.</P>
        <P>
          If an activity already matters to you, you can notice whether you still have a choice about it. You can also leave
          that question for later. Module 5 looks at intensity, choice, and pressure after there has been a chance to try
          something.
        </P>
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          Research connection: Interests can develop through experience over time. Hidi and Renninger (2006)
          describe one model of how interest develops. See the research explanation in Module 1, Lesson 1.
        </p>
      </Panel>
    </div>
  );
}

function PartYours({ lesson, answers }) {
  const lens = readAnswer(answers, lesson.code, "lens");
  const reasons = splitMulti(readAnswer(answers, lesson.code, "reasons"));
  const fictional =
    lens === LENS_OPTIONS[1] || lens === "I'll use Alex or Sam instead" || lens === "I'll use Jordan or Riley instead";
  return (
    <div className="space-y-6">
      <P>
        Think of an activity that takes up your attention: something you do often, or think about a lot. Keep it to yourself for now.
      </P>
      <SingleChoice
        legend="Which would you like to use?"
        hint="Both work the same way. Using Jordan or Casey is a complete way to do this part."
        options={LENS_OPTIONS}
        value={fictional ? LENS_OPTIONS[1] : lens}
        onChange={(next) => recordAnswer(lesson, "lens", next, "Which example I used")}
      />
      <MultiChoice
        legend={fictional ? "What might keep Jordan or Casey involved?" : "What keeps you coming back?"}
        hint="Choose any that fit. More than one is fine."
        options={REASON_OPTIONS}
        values={reasons}
        only={NOT_SURE}
        onChange={(next) =>
          recordAnswer(lesson, "reasons", joinMulti(next), fictional ? "What might keep Jordan or Casey involved?" : "What might keep me involved?")
        }
      />
      <PromptField
        lessonCode={lesson.code}
        lessonTitle={lesson.title}
        index="surprise"
        label="Did anything about those reasons surprise you?"
        variant="inline"
      />
      <PrivacyNote>Saved to your account and your private journal. Your choices aren’t a score or a label.</PrivacyNote>
    </div>
  );
}

function PartClose({ lesson, answers }) {
  return (
    <div className="space-y-6">
      <Panel tone="note">
        <P>Attention tells part of a story, not the whole thing. The same intensity can serve different purposes in different circumstances.</P>
        <P>
          You can learn more by noticing your reasons, trying different conditions, and paying attention to what changes.
        </P>
      </Panel>
      <EarlierAnswers code={lesson.code} answers={answers} />
      <FinishControl code={lesson.code} answers={answers} />
    </div>
  );
}

/** M1-L2 · Attention is not a passion. */
export default function AttentionLesson({ lesson }) {
  const answers = useAnswers();
  const parts = [
    { id: "compare", short: "Compare", title: "Same activity. Different reasons.", content: <PartCompare lesson={lesson} answers={answers} /> },
    { id: "reading", short: "Read", title: "What attention can—and can’t—tell us", content: <PartReading /> },
    { id: "yours", short: "Your turn", title: "What takes up your attention?", content: <PartYours lesson={lesson} answers={answers} /> },
    { id: "close", short: "Takeaway", title: "Before you go", content: <PartClose lesson={lesson} answers={answers} /> },
  ];
  return <PartFlow lessonCode={lesson.code} parts={parts} />;
}
