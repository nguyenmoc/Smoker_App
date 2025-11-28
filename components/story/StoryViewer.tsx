import { StoryData } from '@/types/storyType';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds

interface StoryViewerProps {
  visible: boolean;
  stories: StoryData[];
  initialIndex: number;
  currentUserEntityAccountId?: string;
  onClose: () => void;
  onLike: (storyId: string) => void;
  onMarkAsViewed: (storyId: string) => void;
  onDelete?: (storyId: string) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  visible,
  stories,
  initialIndex,
  currentUserEntityAccountId,
  onClose,
  onLike,
  onMarkAsViewed,
  onDelete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const currentStory = stories[currentIndex];
  const isOwner = currentStory?.entityAccountId === currentUserEntityAccountId;
  const isLiked = !!currentUserEntityAccountId && !!Object.values(currentStory?.likes || {}).find(
    like => like.entityAccountId === currentUserEntityAccountId
  );
  const likeCount = Object.keys(currentStory?.likes || {}).length;

  useEffect(() => {
    if (visible && currentStory) {
      onMarkAsViewed(currentStory._id);
      startProgress();
    }

    return () => {
      progressAnim.setValue(0);
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [visible, currentIndex]);

  // Play audio if story has music
  useEffect(() => {
    const playAudio = async () => {
      if (currentStory?.audioUrl && !isPaused) {
        try {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: currentStory.audioUrl },
            { shouldPlay: true, isLooping: true }
          );
          setSound(newSound);
        } catch (error) {
          console.error('Error playing audio:', error);
        }
      }
    };

    playAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
        setSound(null);
      }
    };
  }, [currentStory, isPaused]);

  const startProgress = () => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused) {
        goToNext();
      }
    });
  };

  const pauseProgress = () => {
    setIsPaused(true);
    progressAnim.stopAnimation();
    if (sound) {
      sound.pauseAsync();
    }
  };

  const resumeProgress = () => {
    setIsPaused(false);
    const currentValue = (progressAnim as any)._value;
    const remainingDuration = STORY_DURATION * (1 - currentValue);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: remainingDuration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused) {
        goToNext();
      }
    });

    if (sound) {
      sound.playAsync();
    }
  };

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleLike = () => {
    onLike(currentStory._id);
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa story',
      'Bạn có chắc chắn muốn xóa story này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(currentStory._id);
              onClose();
            }
          },
        },
      ]
    );
  };

  if (!currentStory) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.container}>
        {/* Background Image */}
        {currentStory.images ? (
          <Image
            source={{ uri: currentStory.images }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            style={styles.backgroundGradient}
          />
        )}

        {/* Dark Overlay */}
        <View style={styles.overlay} />

        {/* Touch Areas for Navigation */}
        <View style={styles.touchableArea}>
          <TouchableOpacity
            style={styles.leftTouch}
            activeOpacity={1}
            onPressIn={pauseProgress}
            onPressOut={resumeProgress}
            onPress={goToPrevious}
          />
          <TouchableOpacity
            style={styles.rightTouch}
            activeOpacity={1}
            onPressIn={pauseProgress}
            onPressOut={resumeProgress}
            onPress={goToNext}
          />
        </View>

        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {stories.map((_, index) => (
            <View key={index} style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width:
                      index < currentIndex
                        ? '100%'
                        : index === currentIndex
                        ? progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          })
                        : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: currentStory.authorAvatar }}
              style={styles.avatar}
            />
            <View style={styles.userTextContainer}>
              <Text style={styles.username}>{currentStory.authorName}</Text>
              <Text style={styles.timeAgo}>
                {formatTimeAgo(currentStory.createdAt)}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {isOwner && onDelete && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {currentStory.content && (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>{currentStory.content}</Text>
          </View>
        )}

        {/* Music Info */}
        {currentStory.songId && (
          <View style={styles.musicInfo}>
            <Ionicons name="musical-notes" size={20} color="#fff" />
            <View style={styles.musicTextContainer}>
              <Text style={styles.songTitle} numberOfLines={1}>
                {currentStory.songId.title}
              </Text>
              <Text style={styles.artistName} numberOfLines={1}>
                {currentStory.songId.artistName}
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLike}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={32}
              color={isLiked ? "#ef4444" : "#fff"}
            />
            {likeCount > 0 && (
              <Text style={styles.likeCount}>{likeCount}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Vừa xong';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}phút`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}giờ`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}ngày`;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    position: 'absolute',
    width,
    height,
  },
  backgroundGradient: {
    position: 'absolute',
    width,
    height,
  },
  overlay: {
    position: 'absolute',
    width,
    height,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  touchableArea: {
    flex: 1,
    flexDirection: 'row',
  },
  leftTouch: {
    flex: 1,
  },
  rightTouch: {
    flex: 1,
  },
  progressContainer: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  timeAgo: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  contentText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  musicInfo: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    right: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 12,
    zIndex: 10,
  },
  musicTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  songTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  artistName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 60,
    right: 16,
    zIndex: 10,
  },
  likeButton: {
    alignItems: 'center',
  },
  likeCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
});