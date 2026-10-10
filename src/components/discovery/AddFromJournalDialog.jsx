import React, { useState } from "react";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

/**
 * Shows exactly the text that will be copied into the record, and copies nothing else.
 * The journal entry it came from is never changed.
 */
export default function AddFromJournalDialog({ entry, onClose, onConfirm }) {
  const [body, setBody] = useState(entry.body || "");
  const label = entry.prompt_label || (entry.kind === "free" ? "written freely" : "a step reflection");
  const where = entry.lesson_title ? `${label}, from ${entry.lesson_title}` : label;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto border-natural bg-ivory text-ink">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Add to Discovery Record</DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-ink-soft">
            Only what is in the box below is copied. Nothing else from your journal, and no interpretation of it.
          </DialogDescription>
        </DialogHeader>

        <p className="text-[12.5px] leading-relaxed text-teal-deep">
          Copied from {where} · {moment(entry.created_date).format("D MMMM YYYY")}
        </p>

        <div>
          <label htmlFor="discovery-copy" className="block font-heading text-[15px] leading-snug text-ink">
            What would you like to keep?
          </label>
          <Textarea
            id="discovery-copy"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={5}
            className="mt-2 min-h-[7rem] resize-y border-natural bg-white text-[14px] leading-relaxed"
          />
          <p className="mt-2 text-[12px] leading-relaxed text-ink-faint">
            Edit the wording to keep only the part you want. The original stays untouched.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-full border-natural bg-white">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!body.trim()}
            onClick={() => onConfirm(body.trim())}
            className="rounded-full bg-primary text-primary-foreground hover:bg-teal-deep/90"
          >
            Add to Discovery Record
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}