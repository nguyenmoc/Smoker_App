import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'post' | 'mention';
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  time: string;
  isRead: boolean;
  postImage?: string;
}

const notificationsData: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: {
      name: 'Nguyễn Văn A',
      avatar: 'https://i.pravatar.cc/100?img=1',
    },
    content: 'đã thích bài viết của bạn',
    time: '5 phút trước',
    isRead: false,
    postImage: 'https://picsum.photos/60/60?random=1',
  },
  {
    id: '2',
    type: 'comment',
    user: {
      name: 'Trần Thị B',
      avatar: 'https://i.pravatar.cc/100?img=2',
    },
    content: 'đã bình luận bài viết của bạn: "Bài viết rất hay!"',
    time: '10 phút trước',
    isRead: false,
    postImage: 'https://picsum.photos/60/60?random=2',
  },
  {
    id: '3',
    type: 'follow',
    user: {
      name: 'Lê Minh C',
      avatar: 'https://i.pravatar.cc/100?img=3',
    },
    content: 'đã bắt đầu theo dõi bạn',
    time: '30 phút trước',
    isRead: false,
  },
  {
    id: '4',
    type: 'like',
    user: {
      name: 'Phạm Thị D',
      avatar: 'https://i.pravatar.cc/100?img=4',
    },
    content: 'và 5 người khác đã thích bài viết của bạn',
    time: '1 giờ trước',
    isRead: true,
    postImage: 'https://picsum.photos/60/60?random=4',
  },
  {
    id: '5',
    type: 'mention',
    user: {
      name: 'Hoàng Văn E',
      avatar: 'https://i.pravatar.cc/100?img=5',
    },
    content: 'đã nhắc đến bạn trong một bình luận',
    time: '2 giờ trước',
    isRead: true,
  },
  {
    id: '6',
    type: 'post',
    user: {
      name: 'Vũ Thị F',
      avatar: 'https://i.pravatar.cc/100?img=6',
    },
    content: 'đã đăng một bài viết mới',
    time: '3 giờ trước',
    isRead: true,
    postImage: 'https://picsum.photos/60/60?random=6',
  },
  {
    id: '7',
    type: 'comment',
    user: {
      name: 'Đặng Minh G',
      avatar: 'https://i.pravatar.cc/100?img=7',
    },
    content: 'đã trả lời bình luận của bạn',
    time: '1 ngày trước',
    isRead: true,
    postImage: 'https://picsum.photos/60/60?random=7',
  },
  {
    id: '8',
    type: 'like',
    user: {
      name: 'Bùi Thị H',
      avatar: 'https://i.pravatar.cc/100?img=8',
    },
    content: 'đã thích bình luận của bạn',
    time: '2 ngày trước',
    isRead: true,
  },
];

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(notificationsData);

  // Get icon based on notification type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Ionicons name="heart" size={16} color="#ef4444" />;
      case 'comment':
        return <Ionicons name="chatbubble" size={16} color="#3b82f6" />;
      case 'follow':
        return <Ionicons name="person-add" size={16} color="#10b981" />;
      case 'post':
        return <Ionicons name="document" size={16} color="#8b5cf6" />;
      case 'mention':
        return <Ionicons name="at" size={16} color="#f59e0b" />;
      default:
        return <Ionicons name="notifications" size={16} color="#6b7280" />;
    }
  };

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    Alert.alert('Thành công', 'Đã đánh dấu tất cả là đã đọc');
  }, []);

  // Handle notification press
  const handleNotificationPress = useCallback((notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // TODO: Navigate to specific screen based on notification type
    console.log('Notification pressed:', notification);
    Alert.alert(
      'Thông báo',
      `Bạn đã nhấn vào thông báo từ ${notification.user.name}`
    );
  }, [markAsRead]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          <View style={styles.iconBadge}>
            {getNotificationIcon(item.type)}
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.notificationText}>
            <Text style={styles.userName}>{item.user.name} </Text>
            {item.content}
          </Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>

        {item.postImage && (
          <Image source={{ uri: item.postImage }} style={styles.postThumbnail} />
        )}

        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Đánh dấu tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unread Count */}
      {unreadCount > 0 && (
        <View style={styles.unreadCountContainer}>
          <Text style={styles.unreadCountText}>
            {unreadCount} thông báo chưa đọc
          </Text>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={60} color="#d1d5db" />
            <Text style={styles.emptyText}>Không có thông báo nào</Text>
            <Text style={styles.emptySubText}>
              Khi có thông báo mới, chúng sẽ hiển thị ở đây
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  markAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  unreadCountContainer: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  unreadCountText: {
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  unreadNotification: {
    backgroundColor: '#fef3cd',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  notificationText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#374151',
  },
  userName: {
    fontWeight: '600',
    color: '#111827',
  },
  timeText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  postThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 6,
    marginLeft: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 6,
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 72,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});