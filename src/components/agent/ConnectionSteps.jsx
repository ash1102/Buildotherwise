import React from "react";
import CodeSnippet from "@/components/agent/CodeSnippet";
import InstructionStep from "@/components/agent/InstructionStep";

const API_BASE = "https://build-entre-flow.base44.app/api";
const APP_ID = "6ac87ec76fb515ad1c5677e8";
const AGENT_NAME = "conversation_journal_reflection";
const TOKEN = "YOUR_PERSONAL_ACCESS_TOKEN";
const AGENT_BASE = `${API_BASE}/apps/${APP_ID}/agents`;
const AUTH = `-H "Authorization: Bearer ${TOKEN}"`;

/** The connection, in the order a person would use it. */
export default function ConnectionSteps() {
  return (
    <ol className="space-y-4">
      <InstructionStep number="1" title="Copy your access token">
        <p className="workbook-prose">
          Open the API page in this app's dashboard and copy your personal access token. It is the only credential these
          calls need, and it acts as you, so keep it out of shared documents and messages.
        </p>
      </InstructionStep>

      <InstructionStep number="2" title="Point the connection at Entrepalooza">
        <p className="workbook-prose">
          Every call goes to the same base address and carries the token in an authorization header.
        </p>
        <CodeSnippet
          label="Base address and header"
          code={`${API_BASE}
Authorization: Bearer ${TOKEN}
Content-Type: application/json`}
        />
      </InstructionStep>

      <InstructionStep number="3" title="Start a conversation">
        <p className="workbook-prose">
          One agent is offered: {AGENT_NAME}. Ask for it by name, and the response returns the conversation's id, which
          the next step needs.
        </p>
        <CodeSnippet
          label="Start a conversation"
          code={`curl -X POST "${AGENT_BASE}/conversations" \\
  ${AUTH} \\
  -H "Content-Type: application/json" \\
  -d '{"agent_name": "${AGENT_NAME}"}'`}
        />
      </InstructionStep>

      <InstructionStep number="4" title="Send a message">
        <p className="workbook-prose">
          Put the person's own words in the message. The reply comes back in the response to this same call, so an
          exchange can be handled one request at a time.
        </p>
        <CodeSnippet
          label="Send a message"
          code={`curl -X POST "${AGENT_BASE}/conversations/CONVERSATION_ID/messages" \\
  ${AUTH} \\
  -H "Content-Type: application/json" \\
  -d '{"role": "user", "content": "Here is the entry I want to think about: ..."}'`}
        />
      </InstructionStep>

      <InstructionStep number="5" title="Come back to a thread later">
        <p className="workbook-prose">
          Listing conversations returns the ones the token holds, newest first, so a connection can pick a thread back up
          instead of starting again.
        </p>
        <CodeSnippet
          label="List conversations"
          code={`curl -X GET "${AGENT_BASE}/conversations" \\
  ${AUTH} \\
  -H "Content-Type: application/json"`}
        />
      </InstructionStep>
    </ol>
  );
}