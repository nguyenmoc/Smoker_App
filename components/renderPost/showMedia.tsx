import {Dimensions, ScrollView, Image, TouchableOpacity,Text , View} from "react-native";
import {PostData} from "@/types/postType";
import {styles} from "./style"
import {ResizeMode, Video} from "expo-av";
import {useState} from "react";

const {width: screenWidth} = Dimensions.get('window');

export default function ShowMedia({item}: { item: PostData }) {
    let mediaItems = item.medias || item.mediaIds || [];
    const imageMedias = mediaItems.filter(m => m.type === 'image');
    const videoMedias = mediaItems.filter(m => m.type === 'video');
    const hasMedia = mediaItems.length > 0;
    const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});

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

    const handleImageScroll = (event: any, postId: string) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / screenWidth);
        setCurrentImageIndexes(prev => ({
            ...prev,
            [postId]: currentIndex
        }));
    };

    return (
        <>
            {hasMedia && (
                <View style={styles.imageGalleryContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={screenWidth - 16}
                        decelerationRate="fast"
                        onScroll={(event) => handleImageScroll(event, item._id)}
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
                                {(currentImageIndexes[item._id] || 0) + 1}/{mediaItems.length}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </>
    )
}
