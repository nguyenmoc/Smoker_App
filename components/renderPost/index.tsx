import {Dimensions, Image, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import { formatTime} from "@/utils/extension";
import React, { useState} from "react";
import {styles} from "./style"
import {useRouter} from "expo-router";
import {PostData} from "@/types/postType";
import {ResizeMode, Video} from "expo-av";
import {FeedApiService} from "@/services/feedApi";

const {width: screenWidth} = Dimensions.get('window');

interface RenderPostProps {
    item: PostData,
    currentId: string,
    token: string,
    onAction: (value: any) => void
}

export default function Index({item, currentId, token, onAction}: RenderPostProps) {
    const router = useRouter();
    const [data, setData] = useState<PostData>(item);
    const likeCount = Object.keys(data.likes || {}).length;
    const commentCount = Object.keys(data.comments || {}).length;
    const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});
    const isLiked = !!Object.values(data.likes || {}).find(
        like => like.accountId === currentId
    );

    const handlePostPress = (postId: string) => {
        router.push({
            pathname: '/post',
            params: {id: postId}
        });
    };

    let mediaItems = data.medias || data.mediaIds || [];
    const imageMedias = mediaItems.filter(m => m.type === 'image');
    const videoMedias = mediaItems.filter(m => m.type === 'video');
    const hasMedia = mediaItems.length > 0;

    const handleImageScroll = (event: any, postId: string) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / screenWidth);
        setCurrentImageIndexes(prev => ({
            ...prev,
            [postId]: currentIndex
        }));
    };

    const renderMediaItem = (mediaUrl: string, isVideo: boolean = false) => {
        if (isVideo) {
            return (
                <Video
                    source={{uri: mediaUrl}}
                    style={styles.postImage}
                    resizeMode={ResizeMode.COVER}
                    useNativeControls
                    shouldPlay={false}
                />
            );
        } else {
            return (
                <Image
                    source={{uri: mediaUrl}}
                    style={styles.postImage}
                    resizeMode="cover"
                />
            );
        }
    };

    const handleLike = async (id: string) => {
        let feedApi = await (new FeedApiService(token)).likePost(id)
        if (feedApi.success) {
            if (!isLiked) {
                setData(prev => ({
                    ...prev,
                    likes: {
                        ...prev.likes,
                        [currentId]: {
                            accountId: currentId,
                            TypeRole: ""
                        }
                    },
                }));
            } else {
                setData(prev => {
                    const updatedLikes = { ...prev.likes };
                    delete updatedLikes[currentId];
                    return {
                        ...prev,
                        likes: updatedLikes
                    };
                });
            }
        }
    }

    return (
        <View style={styles.card}>
            <TouchableOpacity
                onPress={() => handlePostPress(data._id)}
            >
                <View style={styles.cardHeader}>
                    <Image source={{uri: data.authorAvatar}} style={styles.avatar}/>
                    <View style={styles.headerInfo}>
                        <Text style={styles.username}>{data.authorName}</Text>
                        <Text style={styles.subText}>
                            {formatTime(data.createdAt)}
                        </Text>
                    </View>
                </View>


                <Text style={styles.content}>{data.content}</Text>

                {hasMedia && (
                    <View style={styles.imageGalleryContainer}>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={screenWidth - 16}
                            decelerationRate="fast"
                            onScroll={(event) => handleImageScroll(event, data._id)}
                            scrollEventThrottle={16}
                        >
                            {imageMedias.map((media, index) => (
                                <TouchableOpacity
                                    key={`image-${media._id || media.id || index}`}
                                    style={styles.imageContainer}
                                >
                                    {renderMediaItem(media.url, false)}
                                </TouchableOpacity>
                            ))}

                            {videoMedias.map((media, index) => (
                                <TouchableOpacity
                                    key={`video-${media._id || media.id || index}`}
                                    style={styles.imageContainer}
                                >
                                    {renderMediaItem(media.url, true)}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {mediaItems.length > 1 && (
                            <View style={styles.imageCounter}>
                                <Text style={styles.imageCounterText}>
                                    {(currentImageIndexes[data._id] || 0) + 1}/{mediaItems.length}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.statsContainer}>
                    <Text style={styles.statsText}>
                        {likeCount > 0 && `${likeCount} lượt thích`}
                        {likeCount > 0 && commentCount > 0 && ' • '}
                        {commentCount > 0 && `${commentCount} bình luận`}
                    </Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleLike(data._id)}
                    >
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={20}
                            color={isLiked ? "#ef4444" : "#6b7280"}
                        />
                        <Text style={[
                            styles.actionText,
                            isLiked && {color: '#ef4444'}
                        ]}>
                            {isLiked ? 'Đã thích' : 'Thích'}
                        </Text>
                    </TouchableOpacity>

                    <View
                        style={styles.actionBtn}
                    >
                        <Ionicons name="chatbubble-outline" size={18} color="#6b7280"/>
                        <Text style={styles.actionText}>Bình luận</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => {
                            onAction(data)
                        }}
                    >
                        <Ionicons name="repeat-outline" size={18} color="#6b7280"/>
                        <Text style={styles.actionText}>Đăng lại</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </View>
    );
}