import React from "react";
import { Plus } from "lucide-react";
import { conversationLabel } from "@/lib/reflection";

export default function ConversationPicker({ conversations, activeId, onSelect, onNew }) {
  return (
    <div>
      <p className="workbook-label">Your conversations</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-teal-deep/50 bg-white px-3 py-1.5 text-[12.5px] text-teal-deep transition hover:border-teal-deep"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Start a new one
        </button>
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelect(conversation.id)}
            className={`rounded-full border px-3 py-1.5 text-[12.5px] transition ${
              conversation.id === activeId
                ? "border-teal-deep bg-teal-deep-wash text-teal-deep"
                : "border-natural bg-white text-ink-soft hover:border-teal-deep/40"
            }`}
          >
            {conversationLabel(conversation)}
          </button>
        ))}
      </div>
    </div>
  );
}