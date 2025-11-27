// hooks/useUserProfile.ts
import { Post, User } from '@/constants/feedData';
import { feedApi } from '@/services/feedApi';
import { useCallback, useEffect, useState } from 'react';

export const useUserProfile = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [userResponse, postsResponse] = await Promise.all([
        feedApi.getViewInformation(userId),
        feedApi.getUserPosts(userId)
      ]);

      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
      } else {
        setError('Không tìm thấy người dùng');
      }

      if (postsResponse.success && postsResponse.data) {
        setPosts(postsResponse.data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const followUser = async (): Promise<void> => {
    if (!user) return;

    // Optimistic update
    setUser(prev => prev ? {
      ...prev,
      isFollowing: !prev.isFollowing,
      followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1
    } : null);

    try {
      const response = await feedApi.followUser(userId);

      if (!response.success) {
        // Revert optimistic update
        setUser(prev => prev ? {
          ...prev,
          isFollowing: !prev.isFollowing,
          followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1
        } : null);
      }
    } catch (err) {
      console.error('Error following user:', err);
      // Revert optimistic update
      setUser(prev => prev ? {
        ...prev,
        isFollowing: !prev.isFollowing,
        followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1
      } : null);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    user,
    posts,
    loading,
    error,
    fetchUserProfile,
    followUser,
  };
};