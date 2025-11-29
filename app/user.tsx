import { Post } from '@/constants/feedData';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import { MessageApiService } from '@/services/messageApi';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Linking,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {formatTime} from "@/utils/formatDate";

const { width: screenWidth } = Dimensions.get('window');
const imageSize = (screenWidth - 32 - 8) / 3;

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { authState } = useAuth();
  const { user, posts, loading, followUser, unFollowUser } = useUserProfile(id!);
  const scrollY = useRef(new Animated.Value(0)).current;
  const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

  useEffect(() => {
    console.log('ID từ params:', id);
    if (user) {
      console.log('Thông tin hồ sơ:', user);
    }
  }, [user, id]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handlePostPress = (postId: string) => {
    router.push({
      pathname: '/post',
      params: { id: postId }
    });
  };

  const handleFollowPress = () => {
    followUser();
  };

  const handleUnFollowPress = () => {
    unFollowUser();
  };

  const handleMessagePress = async () => {
    if (!authState.token || !authState.EntityAccountId || !id) {
      Alert.alert('Lỗi', 'Không thể bắt đầu trò chuyện. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      const messageApi = new MessageApiService(authState.token);
      const conversation = await messageApi.createOrGetConversation(authState.EntityAccountId, id);

      if (conversation && conversation._id) {
        router.push({
          pathname: '/conversation',
          params: { id: conversation._id }
        });
      } else {
        Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện. Vui lòng thử lại.');
    }
  };

  const handleSocialLink = (platform: string, username?: string) => {
    if (!username || username === 'N/A') {
      Alert.alert('Thông báo', 'Người dùng chưa cập nhật thông tin này');
      return;
    }

    let url = '';
    switch (platform) {
      case 'tiktok':
        url = `https://www.tiktok.com/${username.replace('@', '')}`;
        break;
      case 'facebook':
        url = username.startsWith('http') ? username : `https://facebook.com/${username}`;
        break;
      case 'instagram':
        url = `https://instagram.com/${username.replace('@', '')}`;
        break;
      case 'website':
        url = username.startsWith('http') ? username : `https://${username}`;
        break;
      default:
        return;
    }

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Lỗi', 'Không thể mở liên kết này');
      }
    });
  };


  const renderPostItem = ({ item }: { item: any }) => (
      <View style={styles.postCard}>
          <TouchableOpacity onPress={() => handlePostPress(item._id)}>
              <Text style={styles.postContent}>{item.content}</Text>
          </TouchableOpacity>

          {item.images.length > 0 ? (
              <FlatList
                  data={item.images}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(image, index) => `${item._id}-img-${index}`}
                  renderItem={({ item: image }) => (
                      <Image source={{ uri: image }} style={styles.postImage} />
                  )}
                  style={styles.postImages}
              />
          ) : (
              <View style={styles.postImages}>
                  <Image source={require('@/assets/images/notfound.jpg')} style={styles.postImage} />
              </View>
          )}

          <TouchableOpacity onPress={() => handlePostPress(item._id)}>
              <View style={styles.postFooter}>
                  <View style={styles.postStats}>
                      <View style={styles.postStat}>
                          <Ionicons name="heart" size={16} color="#ef4444" />
                          <Text style={styles.postStatText}>{item?.likes.length ?? 0}</Text>
                      </View>
                      <View style={styles.postStat}>
                          <Ionicons name="chatbubble" size={16} color="#6b7280" />
                          <Text style={styles.postStatText}>{item?.comments.length ?? 0}</Text>
                      </View>
                  </View>
                  <Text style={styles.postTime}>{formatTime(item.createdAt)}</Text>
              </View>
          </TouchableOpacity>
      </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.coverContainer}>
        <Image
          source={{ uri: user?.coverImage || 'https://picsum.photos/400/200?random=' + user?.id }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user?.avatar }}
            style={styles.avatar}
          />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userUsername}>{user?.username}</Text>
          {user?.bio && (
            <Text style={styles.userBio}>{user.bio}</Text>
          )}
        </View>

        {/*social media link*/}
        {(user?.website || user?.tiktok || user?.facebook || user?.instagram) && (
          <View style={styles.socialLinksContainer}>
            <View style={styles.socialIcons}>
              {user?.tiktok && user.tiktok !== 'N/A' && (
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => handleSocialLink('tiktok', user.tiktok)}
                >
                  <Ionicons name="logo-tiktok" size={24} color="#000" />
                </TouchableOpacity>
              )}

              {user?.facebook && user.facebook !== 'N/A' && (
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => handleSocialLink('facebook', user.facebook)}
                >
                  <Ionicons name="logo-facebook" size={24} color="#1877f2" />
                </TouchableOpacity>
              )}

              {user?.instagram && user.instagram !== 'N/A' && (
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => handleSocialLink('instagram', user.instagram)}
                >
                  <Ionicons name="logo-instagram" size={24} color="#e4405f" />
                </TouchableOpacity>
              )}

              {user?.website && user.website !== 'N/A' && (
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => handleSocialLink('website', user.website)}
                >
                  <Ionicons name="globe-outline" size={24} color="#2563eb" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(user?.posts || 0)}</Text>
            <Text style={styles.statLabel}>Bài viết</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(user?.followers || 0)}</Text>
            <Text style={styles.statLabel}>Người theo dõi</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(user?.following || 0)}</Text>
            <Text style={styles.statLabel}>Đang theo dõi</Text>
          </View>
        </View>

        {user?.id !== '10' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.followButton,
                user?.isFollowing && styles.followingButton
              ]}
              onPress={user?.isFollowing ? handleUnFollowPress : handleFollowPress}
            >
              <Ionicons
                name={user?.isFollowing ? "checkmark" : "person-add"}
                size={16}
                color={user?.isFollowing ? "#6b7280" : "#fff"}
              />
              <Text style={[
                styles.followButtonText,
                  user?.isFollowing && styles.followingButtonText
              ]}>
                {user?.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.messageButton} onPress={handleMessagePress}>
              <Ionicons name="chatbubble-outline" size={16} color="#2563eb" />
              <Text style={styles.messageButtonText}>Nhắn tin</Text>
            </TouchableOpacity>
          </View>
        )}

        {user?.id === '10' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.messageButton} onPress={handleMessagePress}>
              <Ionicons name="chatbubble-outline" size={16} color="#2563eb" />
              <Text style={styles.messageButtonText}>Nhắn tin</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.postsHeader}>
          <View style={styles.postsHeaderItem}>
            <Ionicons name="grid-outline" size={20} color="#111827" />
            <Text style={styles.postsHeaderText}>Bài viết</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={48} color="#6b7280" />
          <Text style={styles.errorText}>Không tìm thấy người dùng</Text>
          {id && (
            <TouchableOpacity style={styles.messageButtonError} onPress={handleMessagePress}>
              <Ionicons name="chatbubble-outline" size={16} color="#2563eb" />
              <Text style={styles.messageButtonText}>Nhắn tin</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Animated.View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <AnimatedFlatList
        data={posts}
        renderItem={renderPostItem as any}
        keyExtractor={(item: any) => item.id}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
            <Text style={styles.emptySubtext}>
              {user.id === '10' ? 'Hãy chia sẻ khoảnh khắc đầu tiên!' : 'Người dùng chưa đăng bài viết nào.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  moreButton: {
    padding: 8,
    marginRight: -8,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  messageButtonError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  headerContainer: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  coverContainer: {
    position: 'relative',
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  profileSection: {
    paddingHorizontal: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
  },
  followingButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  followingButtonText: {
    color: '#6b7280',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
  },
  messageButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  postsHeader: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  postsHeaderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  postsHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  postItem: {
    width: imageSize,
    height: imageSize,
    margin: 4,
    position: 'relative',
  },
  multipleImagesIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  socialLinksContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  socialLinkText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
    flex: 1,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
    postCard: {
        backgroundColor: '#fff',
        marginHorizontal: 12,
        marginTop: 12,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
    },
    postContent: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
        marginBottom: 12,
    },
    postImages: {
        marginBottom: 12,
    },
    postImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        marginRight: 8,
    },
    postFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    postStats: {
        flexDirection: 'row',
        gap: 16,
    },
    postStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    postStatText: {
        fontSize: 14,
        color: '#6b7280',
    },
    postTime: {
        fontSize: 12,
        color: '#9ca3af',
    },
});