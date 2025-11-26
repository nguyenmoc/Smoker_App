
import { API_CONFIG } from "./apiConfig";

// Define types for message API
export type MessageType = "text" | "image" | "video" | string;

export interface GetMessagesParams {
  before?: string;
  limit?: number;
  offset?: number;
  [key: string]: any;
}

export interface SendMessageExtra {
  [key: string]: any;
}

export interface MessageApi {
  getConversations: (entityAccountId?: string) => Promise<any>;
  getMessages: (conversationId: string, params?: GetMessagesParams) => Promise<any>;
  sendMessage: (
    conversationId: string,
    content: string,
    messageType?: MessageType,
    senderEntityAccountId?: string | null,
    entityType?: string | null,
    entityId?: string | null,
    extra?: SendMessageExtra
  ) => Promise<any>;
  markMessagesRead: (conversationId: string, entityAccountId: string, lastMessageId?: string | null) => Promise<any>;
  createOrGetConversation: (participant1Id: string, participant2Id: string) => Promise<any>;
}



// Helper function for fetch requests
async function fetchApi(endpoint: string, options: RequestInit = {}, token?: string) {
  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

const messageApi: MessageApi = {
  getConversations: async (entityAccountId?: string) => {
    const params = entityAccountId ? `?entityAccountId=${encodeURIComponent(entityAccountId)}` : "";
    const response = await fetchApi(`/messages/conversations${params}`);
    return response.data || []; // Return the data array directly
  },
  getMessages: async (conversationId: string, params: GetMessagesParams = {}) => {
    const query = Object.keys(params).length > 0
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    const response = await fetchApi(`/messages/messages/${conversationId}${query}`);
    return response.data || []; // Return the data array directly
  },
  sendMessage: async (
    conversationId: string,
    content: string,
    messageType: MessageType = "text",
    senderEntityAccountId: string | null = null,
    entityType: string | null = null,
    entityId: string | null = null,
    extra: SendMessageExtra = {}
  ) => {
    const body = JSON.stringify({
      conversationId,
      content,
      messageType,
      senderEntityAccountId,
      entityType,
      entityId,
      ...extra,
    });
    const response = await fetchApi(`/messages/message`, { method: "POST", body });
    return response.data; // Return the data object
  },
  markMessagesRead: async (conversationId: string, entityAccountId: string, lastMessageId: string | null = null) => {
    const body = JSON.stringify({ conversationId, entityAccountId, lastMessageId });
    const response = await fetchApi(`/messages/messages/read`, { method: "POST", body });
    return response; // Return the full response
  },
  createOrGetConversation: async (participant1Id: string, participant2Id: string) => {
    const body = JSON.stringify({ participant1Id, participant2Id });
    const response = await fetchApi(`/messages/conversation`, { method: "POST", body });
    return response.data; // Return the data object
  },
};

export default messageApi;