import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

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
      <View style={styles.editModalContainer}>
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
            {/* <View style={styles.editUserInfo}>
              <Image
                source={{ uri: post?.user.avatar }}
                style={styles.editUserAvatar}
              />
              <Text style={styles.editUserName}>{post?.user.name}</Text>
            </View> */}

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
              <ScrollView
                horizontal
                style={styles.imagesPreview}
                showsHorizontalScrollIndicator={false}
              >
                {editImages.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.selectedImage} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
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
      </View>
    </Modal>
  );
};

export const styles = StyleSheet.create({
  // Edit Modal styles
  editModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  editModalCloseBtn: {
    padding: 4,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  editModalSaveButton: {
    backgroundColor: '#1877f2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editModalSaveButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  editModalSaveText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  editModalSaveTextDisabled: {
    color: '#9ca3af',
  },
  editModalScroll: {
    flex: 1,
  },
  editModalContent: {
    padding: 16,
  },
  editUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  editUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  editUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  editInput: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1a1a1a',
    marginBottom: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  editImageList: {
    marginBottom: 16,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderStyle: 'dashed',
    backgroundColor: '#f9fafb',
  },
  addImageText: {
    fontSize: 16,
    color: '#1877f2',
    marginLeft: 8,
    fontWeight: '600',
  },
  imagesPreview: {
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
    marginTop: 8
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
});