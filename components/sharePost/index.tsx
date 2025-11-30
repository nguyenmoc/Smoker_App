import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert, Share,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {PostData} from "@/types/postType";
import {feedApi} from "@/services/feedApi";
import {useAuth} from "@/hooks/useAuth";

interface ShareModalModalProps {
    visible: boolean;
    onClose: () => void;
    value: PostData;
}

const ShareModal: React.FC<ShareModalModalProps> = ({visible, onClose, value}) => {
    const {authState} = useAuth();
    const accountId = authState.EntityAccountId ?? "A13BDE7D-00F7-43D3-BDBF-D59A3B63C203";
    const token = authState.token ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkU3NEJFRkU1LTRGRDEtNDhGMy1BRDQxLTgzQzY4RjJDNkE2OSIsImVtYWlsIjoiU21va2VyQGdtYWlsLmNvbSIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc2NDMxNjk0NywiZXhwIjoxNzY0OTIxNzQ3fQ.4e8Sz-AhfS_eaVmiJJxOvgtHstr2EI-ad1JYrCk54FI";

    const handleRepost = async (post: PostData) => {
        try {
            let request = {
                title: post.title,
                content: post.content,
                images: post.images,
                videos: post.videos,
                audios: "",
                musicTitle: "",
                artistName: "",
                description: "",
                hashTag: "",
                musicPurchaseLink: "",
                musicBackgroundImage: "",
                type: post.type,
                songId: post.songId,
                musicId: post.musicId,
                entityAccountId: accountId,
                entityId: post.entityId,
                entityType: post.entityType,
                repostedFromId: post._id,
                repostedFromType: post.type
            }
            const response = await feedApi.rePost(request, token);
            if (response.success) {
                Alert.alert('Thành công', 'Đã đăng lại bài viết');
            } else {
                Alert.alert('Lỗi', 'Không đăng lại bài viết');
            }
        } catch (error) {
            console.log("error repost: ", error);
            Alert.alert('Lỗi', 'Không đăng lại bài viết');
        } finally {
            onClose()
        }
    };

    const handleShare = async (post: PostData) => {
        if (!post) return;

        try {
            const result = await Share.share({
                message: `${post.content}\n\nXem thêm tại Smoker App`,
                title: 'Chia sẻ bài viết',
                url: `https://smoker.app/post/${post._id}`,
            });

            if (result.action === Share.sharedAction) {
                Alert.alert('Thành công', 'Đã chia sẻ bài viết');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chia sẻ bài viết');
        }
    };
    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            />

            <View style={styles.modalContent}>
                <TouchableOpacity style={styles.modalItem} onPress={() => handleRepost(value)}>
                    <Ionicons name="repeat-outline" size={20} color="#ef4444"/>
                    <Text style={styles.modalText}>Đăng lại</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalItem} onPress={() => handleShare(value)}>
                    <Ionicons name="share-outline" size={20} color="#3b82f6"/>
                    <Text style={styles.modalText}>Chia sẻ link</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

export default ShareModal;

const styles = StyleSheet.create({
    modalOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.09)",
    },
    modalContent: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 20,
        gap: 12,
    },
    modalItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
    },
    modalText: {
        fontSize: 16,
        marginLeft: 12,
        color: "#111827",
    },
});
