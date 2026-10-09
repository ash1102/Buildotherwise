import React from "react";
import moment from "moment";
import { Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ReplyItem({ reply, canDelete, onDeleted }) {
  const remove = async () => {
    await base44.entities.TribeReply.delete(reply.id);
    onDeleted();
  };

  return (
    <li className="border-t border-natural pt-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[13px] text-ink">
          <span className="font-medium">{reply.display_name || "Participant"}</span>
          <span className="ml-2 text-[12px] text-ink-faint">{moment(reply.created_date).format("D MMMM YYYY, HH:mm")}</span>
        </p>
        {canDelete ? (
          <button
            type="button"
            onClick={remove}
            className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint transition hover:text-copper"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Remove my reply
          </button>
        ) : null}
      </div>
      <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-ink-soft">{reply.body}</p>
    </li>
  );
}