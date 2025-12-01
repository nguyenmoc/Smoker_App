// hooks/useUserProfile.ts
import { Post, User } from '@/constants/feedData';
import { useAuth } from "@/hooks/useAuth";
import { useCallback, useEffect, useState } from 'react';
import {FeedApiService} from "@/services/feedApi";

export const useUserProfile = (userId: string) => {
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {authState} = useAuth();
    const accountId = authState.EntityAccountId ?? "A13BDE7D-00F7-43D3-BDBF-D59A3B63C203";
    const token = authState.token ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkU3NEJFRkU1LTRGRDEtNDhGMy1BRDQxLTgzQzY4RjJDNkE2OSIsImVtYWlsIjoiU21va2VyQGdtYWlsLmNvbSIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc2NDMxNjk0NywiZXhwIjoxNzY0OTIxNzQ3fQ.4e8Sz-AhfS_eaVmiJJxOvgtHstr2EI-ad1JYrCk54FI";
    const feedApi = new FeedApiService(token);
    const fetchUserProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        debugger
        try {
            const [userResponse, postsResponse] = await Promise.all([
                feedApi.getViewInformation(userId),
                feedApi.getUserPosts(userId)
            ]);            

            if (userResponse.success && userResponse.data) {
                const response = await feedApi.checkFollow(accountId, userResponse.data.entityAccountId);
                setUser({
                    ...userResponse.data,
                    isFollowing: response.data?.isFollowing ?? false
                });

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
        try {
            const response = await feedApi.followUser(accountId, user.entityAccountId, user.type);
            if (!response.success) {
                setUser(prev => prev ? {
                    ...prev,
                    isFollowing: !prev.isFollowing,
                    followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1
                } : null);
            }
        } catch (err) {
            console.error('Error following user:', err);
        }
    };
    const unFollowUser = async (): Promise<void> => {
        if (!user) return;
        try {
            const response = await feedApi.unFollowUser(accountId, user.entityAccountId);

            if (!response.success) {
                setUser(prev => prev ? {
                    ...prev,
                    isFollowing: !prev.isFollowing,
                    followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1
                } : null);
            }
        } catch (err) {
            console.error('Error following user:', err);
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
        unFollowUser
    };
};