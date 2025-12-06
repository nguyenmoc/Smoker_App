import { Post } from '@/constants/feedData';
import { useAuth } from '@/hooks/useAuth';
import { formatTime } from "@/utils/extension";
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions, FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface PostContentProps {
  post: Post;
  onUserPress: (userId: string) => void;
  onLike: () => void;
  onShare: (data: any) => void;
}

export const PostContent: React.FC<PostContentProps> = ({
  post,
  onUserPress,
  onLike,
  onShare,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { authState } = useAuth();
  const currentUserId = authState.currentId;
  const likeCount = post.stats?.likeCount ?? 0;
  const commentCount = post.stats?.commentCount ?? 0;
  const images = (post.medias ?? post.mediaIds ?? []).map(x => x.url);

  // Kiểm tra user hiện tại đã like chưa
  const isLiked = post.stats?.isLikedByMe ?? false;

  const handleImageScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / screenWidth);
    setCurrentImageIndex(currentIndex);
  };

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={() => onUserPress(post.author?.entityAccountId ?? post.accountId)}>
          <Image source={{ uri: post.author?.avatar ?? post.authorAvatar }} style={styles.userAvatar} />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={() => onUserPress(post.author?.entityAccountId ?? post.accountId)}>
            <Text style={styles.userName}>{post.author?.name ?? post.authorName}</Text>
          </TouchableOpacity>
          <Text style={styles.postTime}>
            {formatTime(post.createdAt)}
            {/* {post.location && ` • ${post.location}`} */}
          </Text>
        </View>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

       {images.length > 0 && (
        <View style={styles.imageGalleryContainer}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(image, index) => `${post.id ?? post._id}-image-${index}`}
            renderItem={({ item: image }) => (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: image }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              </View>
            )}
            snapToInterval={screenWidth}
            decelerationRate="fast"
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
          />
          {images.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1}/{images.length}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.postStats}>
        <View style={styles.statsRow}>
          {likeCount > 0 && (
            <View style={styles.likesContainer}>
              <View style={styles.heartIcon}>
                <Ionicons name="heart" size={12} color="#fff" />
              </View>
              <Text style={styles.likesText}>{likeCount}</Text>
            </View>
          )}
          <Text style={styles.commentsText}>
            {commentCount > 0 && `${commentCount} bình luận`}
          </Text>
        </View>
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onLike}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color={isLiked ? "#ef4444" : "#6b7280"}
          />
          <Text style={[
            styles.actionText,
            isLiked && { color: '#ef4444' }
          ]}>
            {isLiked ? 'Đã thích' : 'Thích'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={22} color="#6b7280" />
          <Text style={styles.actionText}>Bình luận</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {onShare(post)}}
        >
          <Ionicons name="repeat-outline" size={22} color="#6b7280" />
          <Text style={styles.actionText}>Đăng lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  // Post Actions styles
  postActions: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Post Content styles
  postContainer: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  postContent: {
    paddingHorizontal: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#1a1a1a',
    marginBottom: 16,
  },

  // Image Gallery styles
  imageGalleryContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  imageContainer: {
    width: screenWidth,
  },
  postImage: {
    width: screenWidth,
    height: 300,
  },
  imageCounter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Post Stats styles
  postStats: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  likesText: {
    fontSize: 14,
    color: '#6b7280',
  },
  commentsText: {
    fontSize: 14,
    color: '#6b7280',
  },
});