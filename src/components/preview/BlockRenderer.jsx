import React from "react";
import BlockShell from "./BlockShell";
import TextBlock from "./TextBlock";
import ExampleNote from "./ExampleNote";
import ChoiceBlock from "./ChoiceBlock";
import SortBlock from "./SortBlock";
import PatternBlock from "./PatternBlock";
import FieldsBlock from "./FieldsBlock";
import DecisionBlock from "./DecisionBlock";
import LifeMapBlock from "./LifeMapBlock";
import { parseValues } from "@/lib/preview/responses";

/**
 * A part that only applies on one route is shown by default, and narrows once a
 * choice has actually been made. Nothing is closed off by not answering.
 */
function showWhenOk(condition, recordsByBlockId) {
  const record = recordsByBlockId[condition.blockId];
  if (!record) return true;
  const chosen = parseValues(record)[condition.group];
  if (!chosen) return true;
  const list = Array.isArray(chosen) ? chosen : [chosen];
  return list.some((id) => condition.in.includes(id));
}

export default function BlockRenderer({ block, record, recordsByBlockId, onSave, onClear, saving, canSave }) {
  if (block.showWhen && !showWhenOk(block.showWhen, recordsByBlockId)) return null;

  const shared = { block, record, onSave, saving, canSave };

  if (block.type === "reading" || block.type === "teaching" || block.type === "takeaway") {
    return (
      <BlockShell block={block}>
        <TextBlock block={block} variant={block.type} />
      </BlockShell>
    );
  }

  if (block.type === "example") {
    return (
      <BlockShell block={block}>
        <ExampleNote block={block} />
      </BlockShell>
    );
  }

  if (block.type === "scenario_choice") {
    return (
      <BlockShell block={block}>
        <ChoiceBlock {...shared} />
      </BlockShell>
    );
  }

  if (block.type === "sort") {
    return (
      <BlockShell block={block}>
        <SortBlock {...shared} onClear={onClear} />
      </BlockShell>
    );
  }

  if (block.type === "pattern_compare") {
    return (
      <BlockShell block={block}>
        <PatternBlock {...shared} />
      </BlockShell>
    );
  }

  if (block.type === "optional_reflection") {
    return (
      <BlockShell block={block}>
        <FieldsBlock {...shared} />
      </BlockShell>
    );
  }

  if (block.type === "next_decision") {
    return (
      <BlockShell block={block}>
        <DecisionBlock {...shared} />
      </BlockShell>
    );
  }

  if (block.type === "life_map") {
    return (
      <BlockShell block={block}>
        <LifeMapBlock {...shared} />
      </BlockShell>
    );
  }

  return null;
}