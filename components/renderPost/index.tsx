import {Alert, Image, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {formatTime} from "@/utils/extension";
import React, {useCallback, useState} from "react";
import {styles} from "./style"
import {useRouter} from "expo-router";
import {PostData} from "@/types/postType";
import {FeedApiService} from "@/services/feedApi";
import ShowMedia from "@/components/renderPost/showMedia";

interface RenderPostProps {
    item?: any,
    currentId: string,
    feedApi: FeedApiService,
    entityAccountId?: string,
    isDisable?: boolean,
    isDisableInProfile?: boolean,
    refresh: () => void
}

export function Index({item, currentId, feedApi, entityAccountId, isDisable = false, isDisableInProfile = false, refresh}: RenderPostProps) {
    const router = useRouter();
    const [data, setData] = useState<PostData>(item);
    const likeCount = Object.keys(data.likes || {}).length;
    const commentCount = Object.keys(data.comments || {}).length;
    const isLiked = !!Object.values(data.likes || {}).find(
        like => like.accountId === currentId
    );

    const handlePostPress = (postId: string) => {
        router.push({
            pathname: '/post',
            params: {id: postId}
        });
    };

    const handleLike = async (id: string) => {
        let res = await feedApi.likePost(id)
        if (res.success) {
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
                    const updatedLikes = {...prev.likes};
                    delete updatedLikes[currentId];
                    return {
                        ...prev,
                        likes: updatedLikes
                    };
                });
            }
        }
    }

    const handleUserPress = useCallback((userId: string) => {
        router.push({
            pathname: '/user',
            params: {id: userId}
        });
    }, [router]);

    const handleRepost = async () => {
        try {
            let request = {
                title: item.title,
                content: item.content,
                images: item.images,
                videos: item.videos,
                audios: "",
                musicTitle: "",
                artistName: "",
                description: "",
                hashTag: "",
                musicPurchaseLink: "",
                musicBackgroundImage: "",
                type: item.type,
                songId: item.songId,
                musicId: item.musicId,
                entityAccountId: entityAccountId,
                entityId: item.entityId,
                entityType: item.entityType,
                repostedFromId: item._id,
                repostedFromType: item.type
            }
            const response = await feedApi.rePost(request);
            if (response.success) {
                refresh()
                Alert.alert('Thành công', 'Đã đăng lại bài viết');
            } else {
                Alert.alert('Lỗi', 'Không đăng lại bài viết');
            }
        } catch (error) {
            console.log("error repost: ", error);
            Alert.alert('Lỗi', 'Không đăng lại bài viết');
        }
    }

    return (
        <View style={styles.card}>
            <TouchableOpacity
                onPress={() => handlePostPress(data._id)}
                disabled={isDisable}
            >
                <View style={styles.cardHeader}>
                    <TouchableOpacity
                        onPress={() => handleUserPress(item.authorEntityAccountId)}
                        onStartShouldSetResponder={() => true}
                        disabled={isDisableInProfile}
                    >
                        <Image source={{uri: item.authorAvatar}} style={styles.avatar}/>
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <TouchableOpacity
                            onPress={() => handleUserPress(item.authorEntityAccountId)}
                            onStartShouldSetResponder={() => true}
                            disabled={isDisableInProfile}
                        >
                            <Text style={styles.username}>{item.authorName}</Text>
                        </TouchableOpacity>
                        <Text style={styles.subText}>
                            {formatTime(data.createdAt)}
                        </Text>
                    </View>
                </View>

                {
                    data.repostedFromId ? (
                        <TouchableOpacity
                            onPress={() => handlePostPress(data.originalPost?._id)}
                            onStartShouldSetResponder={() => true}
                        >
                            <View style={styles.repostCard}>
                                <View style={styles.cardHeader}>
                                    <TouchableOpacity
                                        onPress={() => handleUserPress(data.originalPost?.entityAccountId)}
                                        onStartShouldSetResponder={() => true}
                                    >
                                        <Image source={{uri: data.originalPost?.authorAvatar}} style={styles.avatar}/>
                                    </TouchableOpacity>
                                    <View style={styles.headerInfo}>
                                        <TouchableOpacity
                                            onPress={() => handleUserPress(data.originalPost?.entityAccountId)}
                                            onStartShouldSetResponder={() => true}
                                        >
                                            <Text style={styles.username}>{data.originalPost?.authorName}</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.subText}>
                                            {formatTime(data.originalPost?.createdAt)}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.content}>{data.content}</Text>

                                <ShowMedia item={item}/>
                            </View>
                        </TouchableOpacity>
                    ) : (<>
                        <View  style={styles.boxCard}>
                            <Text style={styles.content}>{data.content}</Text>
                            <ShowMedia item={item}/>
                        </View>
                    </>)
                }

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
                        onPress={handleRepost}
                    >
                        <Ionicons name="repeat-outline" size={18} color="#6b7280"/>
                        <Text style={styles.actionText}>Đăng lại</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </View>
    );
}