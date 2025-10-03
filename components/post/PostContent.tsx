import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './styles';

const { width: screenWidth } = Dimensions.get('window');

interface PostContentProps {
  post: any;
  onUserPress: (userId: string) => void;
  onLike: () => void;
  onShare: () => void;
}

export const PostContent: React.FC<PostContentProps> = ({
  post,
  onUserPress,
  onLike,
  onShare,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return `${Math.floor(diffInHours / 24)} ngày trước`;
  };

  const handleImageScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / screenWidth);
    setCurrentImageIndex(currentIndex);
  };

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={() => onUserPress(post.userId)}>
          <Image source={{ uri: post.user.avatar }} style={styles.userAvatar} />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={() => onUserPress(post.userId)}>
            <Text style={styles.userName}>{post.user.name}</Text>
          </TouchableOpacity>
          <Text style={styles.postTime}>
            {formatTime(post.createdAt)}
            {post.location && ` • ${post.location}`}
          </Text>
        </View>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      {post.images.length > 0 && (
        <View style={styles.imageGalleryContainer}>
          <FlatList
            data={post.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(image, index) => `${post.id}-image-${index}`}
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
          {post.images.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1}/{post.images.length}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.postStats}>
        <View style={styles.statsRow}>
          {post.likes > 0 && (
            <View style={styles.likesContainer}>
              <View style={styles.heartIcon}>
                <Ionicons name="heart" size={12} color="#fff" />
              </View>
              <Text style={styles.likesText}>{post.likes}</Text>
            </View>
          )}
          <Text style={styles.commentsText}>
            {post.commentsCount > 0 && `${post.commentsCount} bình luận`}
          </Text>
        </View>
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onLike}
        >
          <Ionicons
            name={post.isLiked ? "heart" : "heart-outline"}
            size={24}
            color={post.isLiked ? "#ef4444" : "#6b7280"}
          />
          <Text style={[
            styles.actionText,
            post.isLiked && { color: '#ef4444' }
          ]}>
            {post.isLiked ? 'Đã thích' : 'Thích'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={22} color="#6b7280" />
          <Text style={styles.actionText}>Bình luận</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onShare}
        >
          <Ionicons name="share-outline" size={22} color="#6b7280" />
          <Text style={styles.actionText}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};