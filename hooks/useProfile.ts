import { ProfileApiService } from '@/services/profileApi';
import { UploadFile, UserProfileData } from '@/types/profileType';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './useAuth';

type FieldValue = string | UploadFile;

export const useProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfileData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { authState } = useAuth();

  const token = authState.token;

  const profileApi = new ProfileApiService(token!!);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await profileApi.getUserProfile();
      if (response.data) {
        setProfile(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProfileField = async (field: string, value: FieldValue): Promise<boolean> => {
  try {
    let payload: any;

    // Nếu value là file (avatar / background)
    if (typeof value === 'object' && 'uri' in value) {
      const formData = new FormData();
      formData.append(field, {
        uri: value.uri,
        name: value.name,
        type: value.type,
      } as any);
      payload = formData;
    } else {
      // Nếu value là text
      const formData = new FormData();
      formData.append(field, value);
      payload = formData;
    }

    const response = await profileApi.updateProfile(payload);

    if (response.success && response.data) {
      // Có thể update state profile ở đây
      // setProfile(response.data);
      return true;
    } else {
      Alert.alert(
        'Cảnh báo',
        'Cập nhật offline. Thay đổi sẽ được đồng bộ khi có kết nối.'
      );
      return false;
    }
  } catch (err) {
    console.error('Error updating profile:', err);
    Alert.alert(
      'Cảnh báo',
      'Cập nhật offline. Thay đổi sẽ được đồng bộ khi có kết nối.'
    );
    return false;
  }
};

  const updateProfileImage = async (type: 'avatar' | 'cover', imageUri: string): Promise<boolean> => {
    try {
      const response = await profileApi.updateProfileImage(userId, type, imageUri);

      if (response.success && response.data) {
        // setProfile(prev => ({
        //   ...prev,
        //   [type === 'avatar' ? 'avatar' : 'coverImage']: response.data!.imageUrl,
        // }));
        return true;
      } else {
        // Fallback to local update with original URI
        // setProfile(prev => ({
        //   ...prev,
        //   [type === 'avatar' ? 'avatar' : 'coverImage']: imageUri,
        // }));
        Alert.alert('Cảnh báo', 'Cập nhật ảnh offline. Ảnh sẽ được tải lên khi có kết nối.');
        return false;
      }
    } catch (err) {
      console.error('Error updating image:', err);
      // Still update locally for better UX
      // setProfile(prev => ({
      //   ...prev,
      //   [type === 'avatar' ? 'avatar' : 'coverImage']: imageUri,
      // }));
      Alert.alert('Cảnh báo', 'Cập nhật ảnh offline. Ảnh sẽ được tải lên khi có kết nối.');
      return false;
    }
  };

  const refreshBalance = async (): Promise<void> => {
    // try {
    //   const response = await profileApi.getUserBalance(userId);

    //   if (response.success && response.data) {
    //     setProfile(prev => ({
    //       ...prev,
    //       balance: response.data!.balance,
    //     }));
    //   }
    // } catch (err) {
    //   console.error('Error refreshing balance:', err);
    // }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfileField,
    updateProfileImage,
    refreshBalance,
  };
};
