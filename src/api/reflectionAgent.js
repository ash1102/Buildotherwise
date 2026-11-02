/**
 * The journal reflection partner on the Vercel build.
 * Conversations stay on the person's account (UserStore). The model only receives
 * the messages sent with each turn, through /api/journalReflection.
 */
const STORE_KEY = 'journalReflection';
const MAX_CONVERSATIONS = 20;
const MAX_MESSAGES = 80;
const MAX_STORE_CHARS = 100_000;
const SEND_CHAR_BUDGET = 20_000;

function parseRow(row) {
  try {
    const parsed = JSON.parse(row?.value || '{}');
    return Array.isArray(parsed.conversations) ? parsed.conversations : [];
  } catch {
    return [];
  }
}

function merge(rows) {
  const byId = new Map();
  rows.forEach((row) => {
    parseRow(row).forEach((conversation) => {
      if (!conversation?.id) return;
      const previous = byId.get(conversation.id);
      const nextCount = conversation.messages?.length || 0;
      const prevCount = previous?.messages?.length || 0;
      if (!previous || nextCount >= prevCount) byId.set(conversation.id, conversation);
    });
  });
  return [...byId.values()].sort((a, b) => String(b.created_date || '').localeCompare(String(a.created_date || '')));
}

function fit(conversations) {
  const trimmed = conversations.slice(0, MAX_CONVERSATIONS).map((conversation) => ({
    ...conversation,
    messages: (conversation.messages || []).slice(-MAX_MESSAGES),
  }));
  let value = JSON.stringify({ conversations: trimmed });
  while (value.length > MAX_STORE_CHARS && trimmed.some((conversation) => conversation.messages.length)) {
    const fullest = trimmed.reduce((best, conversation) =>
      conversation.messages.length > best.messages.length ? conversation : best
    );
    fullest.messages.shift();
    value = JSON.stringify({ conversations: trimmed });
  }
  return { conversations: trimmed, value };
}

function recentForSend(messages) {
  const window = [];
  let used = 0;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const text = String(messages[i].content || '');
    if (window.length > 0 && used + text.length > SEND_CHAR_BUDGET) break;
    window.unshift({ role: messages[i].role, content: text });
    used += text.length;
  }
  while (window.length > 1 && window[0].role !== 'user') window.shift();
  return window;
}

export function createReflectionAgents({ entities, functions, apiError }) {
  const listeners = new Map();

  function publish(id, messages) {
    (listeners.get(id) || []).forEach((callback) => {
      try {
        callback({ messages });
      } catch {
        /* a listener problem stays on the page */
      }
    });
  }

  async function load() {
    const rows = (await entities.UserStore.filter({ store_key: STORE_KEY }, '-updated_date', 5)) || [];
    return { row: rows[0] || null, conversations: merge(rows) };
  }

  async function save(row, conversations) {
    const fitted = fit(conversations);
    const payload = {
      store_key: STORE_KEY,
      value: fitted.value,
      client_updated_at: Date.now(),
      description: 'Journal reflection',
    };
    if (row?.id) return entities.UserStore.update(row.id, payload);
    return entities.UserStore.create(payload);
  }

  return {
    async listConversations(options = {}) {
      const { conversations } = await load();
      const agent = options?.q?.agent_name;
      const limit = options?.limit || MAX_CONVERSATIONS;
      return conversations
        .filter((conversation) => !agent || conversation.agent_name === agent)
        .slice(0, limit)
        .map(({ messages, ...rest }) => rest);
    },

    async createConversation(input = {}) {
      const { row, conversations } = await load();
      const conversation = {
        id: globalThis.crypto.randomUUID().replace(/-/g, ''),
        agent_name: input.agent_name || 'conversation_journal_reflection',
        metadata: input.metadata || {},
        created_date: new Date().toISOString(),
        messages: [],
      };
      await save(row, [conversation, ...conversations]);
      return conversation;
    },

    async getConversation(id) {
      const { conversations } = await load();
      return conversations.find((conversation) => conversation.id === id) || null;
    },

    async addMessage(conversationOrId, message) {
      const id = typeof conversationOrId === 'string' ? conversationOrId : conversationOrId?.id;
      const content = String(message?.content || '').trim();
      if (!id || !content) throw apiError('Write a message first.', 400);
      const { row, conversations } = await load();
      const index = conversations.findIndex((conversation) => conversation.id === id);
      const current = index >= 0
        ? conversations[index]
        : {
            id,
            agent_name: 'conversation_journal_reflection',
            metadata: conversationOrId?.metadata || {},
            created_date: new Date().toISOString(),
            messages: [],
          };
      const userMessage = {
        id: globalThis.crypto.randomUUID().replace(/-/g, ''),
        role: 'user',
        content,
      };
      const history = [...(current.messages || []), userMessage];
      let response;
      try {
        response = await functions.invoke('journalReflection', { messages: recentForSend(history) });
      } catch (error) {
        throw error?.status ? error : apiError("The reflection partner isn’t available right now.", 503);
      }
      const reply = String(response?.data?.reply || '').trim();
      if (!reply) throw apiError("The reflection partner isn’t available right now.", 502);
      const assistantMessage = {
        id: globalThis.crypto.randomUUID().replace(/-/g, ''),
        role: 'assistant',
        content: reply,
      };
      const next = { ...current, messages: [...history, assistantMessage] };
      const rest = conversations.filter((conversation) => conversation.id !== id);
      await save(row, [next, ...rest]);
      publish(id, next.messages);
      return next;
    },

    subscribeToConversation(conversationId, callback) {
      const set = listeners.get(conversationId) || new Set();
      set.add(callback);
      listeners.set(conversationId, set);
      return () => set.delete(callback);
    },
  };
}
