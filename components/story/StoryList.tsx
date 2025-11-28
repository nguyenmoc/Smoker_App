import { StoryData } from '@/types/storyType';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const STORY_WIDTH = 110;
const STORY_HEIGHT = 180;

interface StoryListProps {
  stories: StoryData[];
  currentUserAvatar?: string;
  currentUserName?: string;
  onStoryPress: (story: StoryData, index: number) => void;
  onCreateStory: () => void;
  loading?: boolean;
}

export const StoryList: React.FC<StoryListProps> = ({
  stories,
  currentUserAvatar,
  currentUserName = 'Bạn',
  onStoryPress,
  onCreateStory,
  loading = false,
}) => {
  // Tìm story của user hiện tại
  const myStories = stories.filter(s => s.isOwner);
  const otherStories = stories.filter(s => !s.isOwner);

  // Debug logs
  console.log('📊 StoryList Debug:', {
    totalStories: stories.length,
    myStories: myStories.length,
    otherStories: otherStories.length,
    loading,
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Create Story Card - LUÔN HIỂN THỊ */}
        <TouchableOpacity style={styles.storyCard} onPress={onCreateStory}>
          <View style={styles.createStoryImageContainer}>
            <Image
              source={{ uri: currentUserAvatar || 'https://i.pravatar.cc/100?img=10' }}
              style={styles.createStoryImage}
            />
          </View>
          
          <View style={styles.createStoryFooter}>
            <View style={styles.createIconContainer}>
              <Ionicons name="add" size={20} color="#fff" />
            </View>
            <Text style={styles.createStoryText}>Tạo story</Text>
          </View>
        </TouchableOpacity>

        {/* My Stories - Hiển thị nếu có */}
        {myStories.map((story, index) => {
          const hasMedia = story.mediaIds && story.mediaIds.length > 0;
          
          return (
            <TouchableOpacity
              key={story._id}
              style={styles.storyCard}
              onPress={() => onStoryPress(story, index)}
            >
              {hasMedia ? (
                <Image
                  source={{ uri: story.mediaIds[0].url }}
                  style={styles.storyCardImage}
                />
              ) : (
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.storyCardImage}
                />
              )}
              
              <View style={styles.storyCardOverlay} />
              
              <View style={styles.myStoryHeader}>
                <View style={styles.myStoryAvatarContainer}>
                  <Image
                    source={{ uri: currentUserAvatar || 'https://i.pravatar.cc/100?img=10' }}
                    style={styles.myStoryAvatar}
                  />
                  <LinearGradient
                    colors={['#f59e0b', '#ef4444']}
                    style={styles.myStoryAvatarBorder}
                  />
                </View>
              </View>

              <View style={styles.storyCardFooter}>
                <Text style={styles.storyCardName}>{currentUserName}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Loading Story (khi đang tạo story mới) */}
        {loading && (
          <View style={styles.storyCard}>
            <View style={[styles.storyCardImage, styles.loadingCard]}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
            <View style={styles.storyCardFooter}>
              <Text style={styles.storyCardName}>Đang đăng...</Text>
            </View>
          </View>
        )}

        {/* Other Stories */}
        {otherStories.map((story, index) => {
          const hasMedia = story.mediaIds && story.mediaIds.length > 0;
          const backgroundImage = hasMedia ? story.mediaIds[0].url : story.authorAvatar;

          return (
            <TouchableOpacity
              key={story._id}
              style={styles.storyCard}
              onPress={() => onStoryPress(story, index)}
            >
              <Image
                source={{ uri: backgroundImage }}
                style={styles.storyCardImage}
              />
              
              <View style={styles.storyCardOverlay} />
              
              {/* Avatar with gradient border */}
              <View style={styles.storyHeader}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{ uri: story.authorAvatar }}
                    style={styles.storyAvatar}
                  />
                  {!story.viewed && (
                    <LinearGradient
                      colors={['#f59e0b', '#ef4444', '#ec4899']}
                      style={styles.avatarBorder}
                    />
                  )}
                </View>
              </View>

              {/* Music Badge */}
              {story.songId && (
                <View style={styles.musicBadge}>
                  <Ionicons name="musical-notes" size={12} color="#fff" />
                </View>
              )}

              {/* Name */}
              <View style={styles.storyCardFooter}>
                <Text style={styles.storyCardName} numberOfLines={2}>
                  {story.authorName}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  storyCard: {
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  storyCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  storyCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  storyHeader: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  avatarContainer: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  storyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 44,
    height: 44,
    borderRadius: 22,
    zIndex: -1,
  },
  storyCardFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    paddingTop: 24,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
  },
  storyCardName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  musicBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Create Story Styles
  createStoryImageContainer: {
    width: '100%',
    height: '65%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  createStoryImage: {
    width: 110,
    height: 117,
    resizeMode: 'cover',
  },
  createStoryFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  createIconContainer: {
    position: 'absolute',
    top: -15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  createStoryText: {
    marginTop: 8,
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },

  // My Story Styles
  myStoryHeader: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  myStoryAvatarContainer: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  myStoryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  myStoryAvatarBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 44,
    height: 44,
    borderRadius: 22,
    zIndex: -1,
  },

  // Loading Styles
  loadingCard: {
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
});