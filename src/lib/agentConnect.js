/**
 * The assistant connection steps, kept in one place so the page stays readable and
 * the wording stays identical across clients.
 *
 * The paths are the ones each client actually uses. The last step of every client is
 * the same, because this workbook's connection is approved by signing in as yourself.
 */

const APPROVE =
  "Finish the connection: your client opens Entrepalooza's consent page, where you sign in with your own account and approve it.";

export const CLIENTS = [
  {
    name: "Claude",
    blurb: "Claude keeps custom connections under Settings.",
    steps: [
      "Open your profile menu and choose Settings.",
      "Choose Connectors, then Add custom connector.",
      "Give it a name you will recognise, such as Entrepalooza.",
      "Paste the assistant address above, then choose Add.",
      APPROVE,
    ],
  },
  {
    name: "ChatGPT",
    blurb: "ChatGPT adds outside tools as apps, and needs developer mode switched on first.",
    warning:
      "ChatGPT warns about this setting, and the warning is worth reading: an app you add can act with your account. Only connect ones you trust.",
    steps: [
      "Open Apps, then enable developer mode.",
      "Choose Create app.",
      "Give it a name you will recognise, such as Entrepalooza, and paste the assistant address above.",
      "Choose Create.",
      "Enable the app from the message box in a chat before you ask it anything.",
      APPROVE,
    ],
  },
  {
    name: "Cursor",
    blurb: "Cursor keeps its connections in a small settings file it opens for you.",
    steps: [
      "Open Customise, then the MCPs tab.",
      "Choose New MCP Server. Cursor opens mcp.json.",
      "Add an entry whose url is the assistant address above, then save the file.",
      "Switch the entry on.",
      APPROVE,
    ],
  },
  {
    name: "Custom",
    blurb: "Any client that supports a streamable HTTP server can use the same address.",
    steps: [
      "Copy the assistant address above.",
      "Add it as a streamable HTTP server in your client. Most clients ask for a name and the address, and nothing else.",
      "Reload the client so it picks the connection up.",
      APPROVE,
    ],
  },
];