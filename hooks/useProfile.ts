import { ProfileApiService } from '@/services/profileApi';
import { UploadFile, UserProfileData } from '@/types/profileType';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './useAuth';
import {Post} from "@/constants/feedData";
import {feedApi} from "@/services/feedApi";

type FieldValue = string | UploadFile;

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfileData>();
    const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { authState, updateAuthState } = useAuth();
  const token = authState.token;
  const profileApi = new ProfileApiService(token!!);

  const fetchProfile = useCallback(async () => {
    if (!token) return;


    setLoading(true);
    setError(null);

    try {
      const response = await profileApi.getUserProfile();
      const postsResponse = await feedApi.getUserPosts(authState.EntityAccountId!)
      if (response.data) {
        setProfile(response.data);
      } else {
        setError(response.message);
      }
        if (postsResponse.success && postsResponse.data) {
            setPosts(postsResponse.data);
        }
    } catch (err) {
      setError('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Cập nhật các trường text
  const updateProfileField = async (field: string, value: string): Promise<boolean> => {
    try {
      const updates: any = {};

      // Map field names từ UI sang API
      const fieldMapping: { [key: string]: string } = {
        'name': 'userName',
        'bio': 'bio',
        'phone': 'phone',
      };

      const apiField = fieldMapping[field] || field;
      updates[apiField] = value;

      const response = await profileApi.updateProfile(updates);

      if (response.data) {
        setProfile(response.data);
        return true;
      } else {
        Alert.alert('Cảnh báo', 'Cập nhật offline. Thay đổi sẽ được đồng bộ khi có kết nối.');
        return false;
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Cảnh báo', 'Cập nhật offline. Thay đổi sẽ được đồng bộ khi có kết nối.');
      return false;
    }
  };

  // Cập nhật avatar hoặc cover image
  const updateProfileImage = async (type: 'avatar' | 'coverImage', imageUri: string): Promise<boolean> => {
    try {
      const uploadFile: UploadFile = {
        uri: imageUri,
        name: `${type}_${Date.now()}.jpg`,
        type: 'image/jpeg',
      };

      const updates: any = {};

      // Map type sang field name
      if (type === 'avatar') {
        updates.avatar = uploadFile;
      } else {
        updates.background = uploadFile; // API dùng 'background' cho cover image
      }

      const response = await profileApi.updateProfile(updates);

      if (response.data) {
        setProfile(response.data);
        if (type === 'avatar') {
          updateAuthState({
            avatar: response.data.avatar,
          });
        }
        return true;
      } else {
        Alert.alert('Cảnh báo', 'Cập nhật ảnh offline. Ảnh sẽ được tải lên khi có kết nối.');
        return false;
      }
    } catch (err) {
      console.error('Error updating image:', err);
      Alert.alert('Cảnh báo', 'Cập nhật ảnh offline. Ảnh sẽ được tải lên khi có kết nối.');
      return false;
    }
  };

  const refreshBalance = async (): Promise<void> => {
    // Implement nếu cần
  };

  const setFullProfile = (newProfile: UserProfileData) => {
    setLoading(false)

    setProfile(prev => ({
      ...prev,
      ...newProfile,
    }));
    setLoading(true)
  };


  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
      posts,
    loading,
    error,
    fetchProfile,
    updateProfileField,
    updateProfileImage,
    refreshBalance,
    setFullProfile
  };
};