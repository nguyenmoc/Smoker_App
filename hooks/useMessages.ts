import messageApi, { GetMessagesParams, MessageType } from '@/services/messageApi';
import { useCallback, useEffect, useState } from 'react';

interface Message {
  _id: string;
  conversation_id: string;
  sender_id: string;
  sender_entity_type: string;
  content: string;
  message_type: MessageType;
  attachments: any[];
  is_story_reply: boolean;
  story_id: string | null;
  story_url: string | null;
  is_post_share: boolean;
  post_id: string | null;
  post_summary: string | null;
  post_image: string | null;
  post_author_name: string | null;
  post_author_avatar: string | null;
  post_title: string | null;
  post_content: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  // Additional fields for display
  senderName?: string;
  senderAvatar?: string;
}

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMessages: (params?: GetMessagesParams) => Promise<void>;
  sendMessage: (content: string, messageType?: MessageType) => Promise<boolean>;
  markAsRead: () => Promise<void>;
}

export const useMessages = (conversationId: string, currentUserId: string): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadMessages = useCallback(async (params: GetMessagesParams = {}) => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await messageApi.getMessages(conversationId, {
        limit: 50,
        ...params
      });

      if (params.before) {
        // Load more (older messages)
        setMessages(prev => [...prev, ...data]);
      } else {
        // Initial load or refresh
        setMessages(data || []);
      }

      setHasMore(data && data.length === 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const sendMessage = useCallback(async (content: string, messageType: MessageType = 'text'): Promise<boolean> => {
    try {
      await messageApi.sendMessage(
        conversationId,
        content,
        messageType,
        currentUserId,
        'Account', // entityType
        currentUserId, // entityId
        {}
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return false;
    }
  }, [conversationId, currentUserId]);

  const markAsRead = useCallback(async () => {
    try {
      const lastMessageId = messages.length > 0 ? messages[0]._id : null;
      await messageApi.markMessagesRead(conversationId, currentUserId, lastMessageId);
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [conversationId, currentUserId, messages]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMessages,
    sendMessage,
    markAsRead,
  };
};