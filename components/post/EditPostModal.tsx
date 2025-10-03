import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './styles';

interface EditPostModalProps {
  visible: boolean;
  post: any;
  initialContent: string;
  initialImages: string[];
  onClose: () => void;
  onSubmit: (content: string, images: string[]) => Promise<boolean>;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  visible,
  post,
  initialContent,
  initialImages,
  onClose,
  onSubmit,
}) => {
  const [editContent, setEditContent] = useState(initialContent);
  const [editImages, setEditImages] = useState<string[]>(initialImages);

  useEffect(() => {
    if (visible) {
      setEditContent(initialContent);
      setEditImages(initialImages);
    }
  }, [visible, initialContent, initialImages]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0].uri) {
      setEditImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setEditImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!editContent.trim()) {
      Alert.alert('Lỗi', 'Nội dung không được để trống');
      return;
    }

    await onSubmit(editContent, editImages);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.editModalContainer}>
        <View style={styles.editModalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.editModalCloseBtn}>
            <Ionicons name="close" size={28} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.editModalTitle}>Chỉnh sửa bài viết</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!editContent.trim()}
            style={[
              styles.editModalSaveButton,
              !editContent.trim() && styles.editModalSaveButtonDisabled
            ]}
          >
            <Text style={[
              styles.editModalSaveText,
              !editContent.trim() && styles.editModalSaveTextDisabled
            ]}>
              Lưu
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.editModalScroll}>
          <View style={styles.editModalContent}>
            <View style={styles.editUserInfo}>
              <Image
                source={{ uri: post?.user.avatar }}
                style={styles.editUserAvatar}
              />
              <Text style={styles.editUserName}>{post?.user.name}</Text>
            </View>

            <TextInput
              style={styles.editInput}
              value={editContent}
              onChangeText={setEditContent}
              multiline
              placeholder="Bạn đang nghĩ gì?"
              placeholderTextColor="#9ca3af"
              maxLength={1000}
              autoFocus
              textAlignVertical="top"
            />

            {editImages.length > 0 && (
              <FlatList
                data={editImages}
                horizontal
                keyExtractor={(item, index) => `edit-image-${index}`}
                renderItem={({ item, index }) => (
                  <View style={styles.editImageContainer}>
                    <Image
                      source={{ uri: item }}
                      style={styles.editImage}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
                style={styles.editImageList}
                showsHorizontalScrollIndicator={false}
              />
            )}

            <TouchableOpacity
              style={styles.addImageButton}
              onPress={handlePickImage}
            >
              <Ionicons name="image-outline" size={24} color="#1877f2" />
              <Text style={styles.addImageText}>Thêm ảnh</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};