import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const DECISIONS = [
  { value: "approve_draft", label: "Approve this draft for the card" },
  { value: "keep_current", label: "Keep the current card" },
  { value: "request_changes", label: "Request changes" },
];

/** Records the program team's decision. It never inserts a draft into a card. */
export default function ApprovalForm({ pkg, onSave, saving }) {
  const [decision, setDecision] = useState(pkg.approval_decision || "");
  const [approver, setApprover] = useState(pkg.approver || "");
  const [version, setVersion] = useState(pkg.approved_version || "");
  const [note, setNote] = useState(pkg.decision_note || "");

  const submit = () =>
    onSave(pkg.id, {
      approval_decision: decision,
      approver,
      approved_version: version,
      decision_note: note,
      decided_date: new Date().toISOString().slice(0, 10),
    });

  return (
    <div className="rounded-lg border border-natural bg-white p-4 sm:p-5">
      <p className="workbook-label">Approval record</p>
      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-faint">
        Recording a decision here does not change the participant card, and finishing evaluator or clinical review is not
        the same as approving the lesson.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {DECISIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={decision === option.value}
            onClick={() => setDecision(option.value === decision ? "" : option.value)}
            className={`rounded-full border px-3 py-1.5 text-[12.5px] transition ${
              decision === option.value
                ? "border-teal-deep bg-teal-deep text-ivory"
                : "border-natural bg-white text-ink-soft hover:border-teal-deep/50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="workbook-label">Approver</span>
          <Input value={approver} onChange={(event) => setApprover(event.target.value)} placeholder="Name" className="mt-2 bg-white" />
        </label>
        <label className="block">
          <span className="workbook-label">Exact version approved</span>
          <Input
            value={version}
            onChange={(event) => setVersion(event.target.value)}
            placeholder="Source and date of the exact version"
            className="mt-2 bg-white"
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="workbook-label">Decision note</span>
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="What was decided, and any condition attached."
          className="mt-2 bg-white"
        />
      </label>

      <div className="mt-4 flex items-center gap-3">
        <Button type="button" onClick={submit} disabled={saving} className="rounded-full bg-teal-deep text-ivory hover:bg-teal-deep/90">
          {saving ? "Saving…" : "Record decision"}
        </Button>
        {pkg.decided_date ? <span className="text-[12px] text-ink-faint">Last recorded {pkg.decided_date}</span> : null}
      </div>
    </div>
  );
}