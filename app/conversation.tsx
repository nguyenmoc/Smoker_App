import MessageInput from '@/components/chat/MessageInput';
import AnimatedHeader from '@/components/ui/AnimatedHeader';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { useSocket } from '@/hooks/useSocket';
import messageApi, { MessageType } from '@/services/messageApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  senderName?: string;
  senderAvatar?: string;
}

interface Conversation {
  _id: string;
  type: string;
  participants: string[];
  last_message_id: string | null;
  last_message_content: string;
  last_message_time: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  participantStatuses: { [key: string]: string };
  unreadCount: number;
  otherParticipants: string[];
}

export default function ConversationScreen() {
  const router = useRouter();
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const { authState } = useAuth();
  const currentUserId = authState.currentId;
  const { socket, isConnected } = useSocket();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const headerTranslateY = new Animated.Value(0);
  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    loading,
    error,
    sendMessage: sendMessageHook,
    markAsRead
  } = useMessages(conversationId || '', currentUserId);

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    }
  }, [conversationId]);

  useEffect(() => {
    // Mark messages as read when entering conversation
    if (conversationId && currentUserId) {
      markAsRead();
    }
  }, [conversationId, currentUserId, markAsRead]);

  useEffect(() => {
    if (socket && conversationId) {
      // Join conversation room
      socket.emit('join_conversation', conversationId);

      // Listen for new messages
      socket.on('new_message', (message: Message) => {
        // Note: Real-time updates should be handled in useMessages or global state
        console.log('New message received:', message);
      });

      return () => {
        socket.off('new_message');
        socket.emit('leave_conversation', conversationId);
      };
    }
  }, [socket, conversationId]);

  const loadConversation = async () => {
    try {
      // For now, we'll get conversation details from conversations list
      const conversations = await messageApi.getConversations(currentUserId);
      const conv = conversations.find((c: Conversation) => c._id === conversationId);
      setConversation(conv || null);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSendMessage = async (content: string, messageType: MessageType = 'text') => {
    const success = await sendMessageHook(content, messageType);
    if (!success) {
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === currentUserId;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        {!isMyMessage && (
          <Image
            source={{ uri: item.senderAvatar || `https://i.pravatar.cc/100?img=${item.sender_id.slice(0, 2)}` }}
            style={styles.messageAvatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myBubble : styles.otherBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myText : styles.otherText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myTime : styles.otherTime
          ]}>
            {new Date(item.createdAt).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
    );
  };

  const otherParticipantId = conversation?.otherParticipants[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AnimatedHeader
        title={otherParticipantId ? `Chat với ${otherParticipantId.slice(0, 8)}` : 'Chat'}
        subtitle={isConnected ? 'Online' : 'Offline'}
        headerTranslateY={headerTranslateY}
        iconName="arrow-back"
        onIconPress={() => router.back()}
      />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item._id}
          inverted
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 60, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
        />

        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!isConnected}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myText: {
    color: '#fff',
  },
  otherText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  myTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  otherTime: {
    color: '#6b7280',
  },
});