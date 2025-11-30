import {FlatList, Image, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {CountItem, formatTime} from "@/utils/extension";
import React from "react";
import {styles} from "./style"
import {useRouter} from "expo-router";
import {Post} from "@/constants/feedData";

export default function Index({item}: { item: Post }) {
    const router = useRouter();
    const images = item.mediaIds.map(x => x.url);
    const handlePostPress = (postId: string) => {
        router.push({
            pathname: '/post',
            params: {id: postId}
        });
    };

    return (
        <View style={styles.postCard}>
            <TouchableOpacity onPress={() => handlePostPress(item._id)}>
                <Text style={styles.postContent}>{item.content}</Text>
                {images.length > 0 && (
                    <FlatList
                        data={images}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(image, index) => `${item._id}-img-${index}`}
                        renderItem={({item: image}) => (
                            <Image source={{uri: image}} style={styles.postImage}/>
                        )}
                        style={styles.postImages}
                    />
                )}

                <View style={styles.postFooter}>
                    <View style={styles.postStats}>
                        <View style={styles.postStat}>
                            <Ionicons name="heart" size={16} color="#ef4444"/>
                            <Text style={styles.postStatText}>{CountItem(item?.likes)}</Text>
                        </View>
                        <View style={styles.postStat}>
                            <Ionicons name="chatbubble" size={16} color="#6b7280"/>
                            <Text style={styles.postStatText}>{CountItem(item?.comments)}</Text>
                        </View>
                    </View>
                    <Text style={styles.postTime}>{formatTime(item.createdAt)}</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}