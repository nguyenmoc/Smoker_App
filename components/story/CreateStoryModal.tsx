import { CreateStoryData } from '@/types/storyType';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CreateStoryModalProps {
  visible: boolean;
  uploading: boolean;
  uploadProgress: number;
  currentUserAvatar?: string;
  onClose: () => void;
  onSubmit: (storyData: CreateStoryData) => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  visible,
  uploading,
  uploadProgress,
  currentUserAvatar,
  onClose,
  onSubmit,
}) => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `story_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = () => {
    if (!content.trim() && !selectedImage) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung hoặc chọn ảnh');
      return;
    }

    const storyData: CreateStoryData = {
      content: content.trim(),
      caption: content.trim(),
      image: selectedImage || undefined,
    };

    onSubmit(storyData);
    handleClose();
  };

  const handleClose = () => {
    setContent('');
    setSelectedImage(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tạo Story</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* User Info */}
            <View style={styles.userInfo}>
              <Image
                source={{ uri: currentUserAvatar || 'https://i.pravatar.cc/100?img=10' }}
                style={styles.avatar}
              />
              <Text style={styles.username}>Story của bạn</Text>
            </View>

            {/* Image Preview */}
            {selectedImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={removeImage}
                >
                  <Ionicons name="close-circle" size={32} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={pickImage}
              >
                <Ionicons name="image-outline" size={48} color="#2563eb" />
                <Text style={styles.addImageText}>Thêm ảnh</Text>
              </TouchableOpacity>
            )}

            {/* Content Input */}
            <TextInput
              placeholder="Chia sẻ cảm xúc của bạn..."
              multiline
              style={styles.input}
              value={content}
              onChangeText={setContent}
              placeholderTextColor="#9ca3af"
            />

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
              <Text style={styles.tipsText}>
                Story sẽ tự động xóa sau 24 giờ
              </Text>
            </View>
          </ScrollView>

          {/* Submit Button */}
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.uploadingText}>
                Đang đăng... {uploadProgress}%
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!content.trim() && !selectedImage) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!content.trim() && !selectedImage}
            >
              <Text style={styles.submitButtonText}>Đăng Story</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 400,
    backgroundColor: '#f3f4f6',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  addImageButton: {
    height: 200,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#f9fafb',
  },
  addImageText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    textAlignVertical: 'top',
    backgroundColor: '#f9fafb',
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  tipsText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#6b7280',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
  },
  uploadingText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});