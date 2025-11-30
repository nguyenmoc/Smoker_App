import { styles } from "@/app/Pages/user/style";
import RenderPost from "@/components/renderPost";
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { MessageApiService } from '@/services/messageApi';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Image,
    Linking,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
    const router = useRouter();
    const {id} = useLocalSearchParams<{ id: string }>();
    const {authState} = useAuth();
    const {user, posts, loading, followUser, unFollowUser} = useUserProfile(id!);
    const scrollY = useRef(new Animated.Value(0)).current;
    const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
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
                    params: {id: conversation._id}
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

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.coverContainer}>
                <Image
                    source={{uri: user?.coverImage || 'https://picsum.photos/400/200?random=' + user?._id}}
                    style={styles.coverImage}
                    resizeMode="cover"
                />
            </View>

            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{uri: user?.avatar}}
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
                                    <Ionicons name="logo-tiktok" size={24} color="#000"/>
                                </TouchableOpacity>
                            )}

                            {user?.facebook && user.facebook !== 'N/A' && (
                                <TouchableOpacity
                                    style={styles.socialIconButton}
                                    onPress={() => handleSocialLink('facebook', user.facebook)}
                                >
                                    <Ionicons name="logo-facebook" size={24} color="#1877f2"/>
                                </TouchableOpacity>
                            )}

                            {user?.instagram && user.instagram !== 'N/A' && (
                                <TouchableOpacity
                                    style={styles.socialIconButton}
                                    onPress={() => handleSocialLink('instagram', user.instagram)}
                                >
                                    <Ionicons name="logo-instagram" size={24} color="#e4405f"/>
                                </TouchableOpacity>
                            )}

                            {user?.website && user.website !== 'N/A' && (
                                <TouchableOpacity
                                    style={styles.socialIconButton}
                                    onPress={() => handleSocialLink('website', user.website)}
                                >
                                    <Ionicons name="globe-outline" size={24} color="#2563eb"/>
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

                {user?._id !== '10' && (
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
                            <Ionicons name="chatbubble-outline" size={16} color="#2563eb"/>
                            <Text style={styles.messageButtonText}>Nhắn tin</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {user?._id === '10' && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.messageButton} onPress={handleMessagePress}>
                            <Ionicons name="chatbubble-outline" size={16} color="#2563eb"/>
                            <Text style={styles.messageButtonText}>Nhắn tin</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.postsHeader}>
                    <View style={styles.postsHeaderItem}>
                        <Ionicons name="grid-outline" size={20} color="#111827"/>
                        <Text style={styles.postsHeaderText}>Bài viết</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent/>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff"/>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hồ sơ</Text>
                    <View style={styles.headerRight}/>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563eb"/>
                    <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent/>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff"/>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hồ sơ</Text>
                    <View style={styles.headerRight}/>
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="person-outline" size={48} color="#6b7280"/>
                    <Text style={styles.errorText}>Không tìm thấy người dùng</Text>
                    {id && (
                        <TouchableOpacity style={styles.messageButtonError} onPress={handleMessagePress}>
                            <Ionicons name="chatbubble-outline" size={16} color="#2563eb"/>
                            <Text style={styles.messageButtonText}>Nhắn tin</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent/>

            <Animated.View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#fff"/>
                </TouchableOpacity>
            </Animated.View>

            <AnimatedFlatList
                data={posts}
                renderItem={({ item }) => <RenderPost item={item} />}
                keyExtractor={(item: any) => item._id}
                ListHeaderComponent={renderHeader}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: scrollY}}}],
                    {useNativeDriver: true}
                )}
                scrollEventThrottle={16}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="images-outline" size={48} color="#d1d5db"/>
                        <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
                        <Text style={styles.emptySubtext}>
                            {user._id === '10' ? 'Hãy chia sẻ khoảnh khắc đầu tiên!' : 'Người dùng chưa đăng bài viết nào.'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

