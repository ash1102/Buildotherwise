import React from "react";
import CodeSnippet from "@/components/agent/CodeSnippet";
import InstructionStep from "@/components/agent/InstructionStep";

const NOTION_ENTRY = `{
  "mcpServers": {
    "notion": {
      "url": "https://mcp.notion.com/mcp"
    }
  }
}`;

/** A second, separate connection: a team member's client to the Notion workspace. */
export default function NotionWorkspace() {
  return (
    <div className="space-y-4">
      <p className="workbook-prose max-w-3xl">
        This one is separate from Entrepalooza: it lets an AI client work in the Notion workspace where the curriculum
        is written. Only people who already have access to that workspace can use it, so it stays with the program team.
      </p>
      <ol className="space-y-4">
        <InstructionStep number="1" title="Open your client's connector settings">
          <p className="workbook-prose">Find the MCP servers or connectors area of the client you use.</p>
        </InstructionStep>

        <InstructionStep number="2" title="Choose a connection type">
          <p className="workbook-prose">Streamable HTTP is the type new clients expect, and the one this entry uses.</p>
        </InstructionStep>

        <InstructionStep number="3" title="Copy this configuration in">
          <p className="workbook-prose">Add the entry exactly as it is written, then save.</p>
          <CodeSnippet label="Notion MCP entry" code={NOTION_ENTRY} />
        </InstructionStep>

        <InstructionStep number="4" title="Complete the sign-in when it is asked for">
          <p className="workbook-prose">
            The client opens Notion and asks you to approve access to the workspace. Approving means it acts as your own
            Notion account, so a workspace you cannot already open stays out of reach.
          </p>
        </InstructionStep>
      </ol>
    </div>
  );
}