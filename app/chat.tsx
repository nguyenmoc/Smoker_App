import AnimatedHeader from '@/components/ui/AnimatedHeader';
import { useAuth } from '@/hooks/useAuth';
import { MessageApiService } from '@/services/messageApi';
import publicProfileApi from '@/services/publicProfileApi';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PublicProfileData } from '@/types/profileType';
import { useSocket } from '@/hooks/useSocket';

interface Conversation {
  _id: string;
  type: string;
  participants: string[]; // Array of user IDs
  last_message_id: string | null;
  last_message_content: string;
  last_message_time: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  participantStatuses: { [key: string]: string };
  unreadCount: number;
  otherParticipants: string[];
  // Additional fields for display
  otherParticipantName?: string;
  otherParticipantAvatar?: string;
}

export default function ConversationsScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const currentUserId = authState.currentId;
  const token = authState.token;
  const messageApi = token ? new MessageApiService(token) : null;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profiles, setProfiles] = useState<Record<string, PublicProfileData>>({});
  const [loading, setLoading] = useState(true);
  const headerTranslateY = new Animated.Value(0);
  const { socket } = useSocket();

  const loadConversations = useCallback(async () => {
    if (!messageApi) return;

    try {
      setLoading(true);
      const data = await messageApi.getConversations(authState.EntityAccountId) as Conversation[];
    //   console.log('Loaded conversations:', data);
      setConversations(data || []);

      // Fetch profiles for participants
      const ids = [...new Set(data.flatMap(c => c.otherParticipants))];
      const profilePromises = ids.map(id => publicProfileApi.getByEntityId(id));
      const profileResults = await Promise.all(profilePromises);
      const newProfiles: Record<string, PublicProfileData> = {};
      profileResults.forEach((result, index) => {
        if (result.success && result.data) {
          newProfiles[ids[index]] = result.data;
        }
      });
      setProfiles(newProfiles);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [messageApi, authState.EntityAccountId]);

  useEffect(() => {
    if (token) {
      loadConversations();
    } else {
      setLoading(false);
    }
  }, [token, loadConversations]);

  useEffect(() => {
    if (!socket) return;

    const handleMessagesRead = () => {
      loadConversations();
    };

    const handleNewMessage = () => {
      loadConversations();
    };

    socket.on('messages_read', handleMessagesRead);
    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('messages_read', handleMessagesRead);
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, loadConversations]);

  const handleConversationPress = (conversationId: string) => {
    router.push({
      pathname: '/conversation',
      params: { id: conversationId }
    });
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const otherParticipantId = item.otherParticipants[0];
    const isLastMessageFromMe = item.last_message_id ? false : false; // Need to check sender, but for now assume not

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item._id)}
      >
        <Image
          source={{ uri: profiles[otherParticipantId]?.avatar || `https://i.pravatar.cc/100?img=${otherParticipantId.slice(0, 2)}` }}
          style={styles.avatar}
        />
        <View style={styles.conversationContent}>
          <Text style={styles.participantName}>{profiles[otherParticipantId]?.name || `User ${otherParticipantId.slice(0, 8)}`}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.last_message_content || 'Chưa có tin nhắn'}
          </Text>
        </View>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AnimatedHeader
        title="Chat"
        subtitle="Trò chuyện với bạn bè"
        headerTranslateY={headerTranslateY}
      />

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" />
        ) : conversations.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 60 }}
          />
        )}
      </View>
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
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    marginTop: 100,
  },
});