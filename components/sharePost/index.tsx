import React, {useCallback, useState} from 'react';
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

interface ShareModalModalProps {
    visible: boolean;
    onClose: () => void;
    value: PostData;
}

const ShareModal: React.FC<ShareModalModalProps> = ({visible, onClose, value}) => {
    const [loading, setLoading] = useState(false);

    const handleReport = async () => {
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            Alert.alert("Thông báo", "Báo cáo thành công!");
            onClose();
        } catch (err) {
            Alert.alert("Lỗi", "Không thể report");
        } finally {
            setLoading(false);
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
                <TouchableOpacity style={styles.modalItem} onPress={handleReport}>
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
