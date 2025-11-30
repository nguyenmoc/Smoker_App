import { CreateCommentData, CreatePostData, Post, User } from "@/constants/feedData";
import { CommentData } from "@/types/commentType";
import { PostData } from "@/types/postType";
import { API_CONFIG } from "./apiConfig";

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message: string;
    error?: string;
}

export class FeedApiService {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {},
        token?: string
    ): Promise<ApiResponse<T>> {
        try {
            const finalToken = token ?? this.token;

            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${finalToken}`,
                    ...options.headers,
                },
                ...options,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async getCurrentUserId(): Promise<ApiResponse<string>> {
        try {
            const response = await this.makeRequest<{ userId: string }>('/auth/current-user');
            if (response.success && response.data) {
                return {success: true, data: response.data.userId, message: 'Lấy user ID thành công'};
            }
            return {success: false, message: 'Không thể lấy user ID', error: 'No user ID found'};
        } catch (error) {
            console.error('Error getting current user ID:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async getFeedPosts(page: number = 1, limit: number = 10): Promise<ApiResponse<Post[]>> {
        return this.makeRequest<Post[]>(`/posts?page=${page}&limit=${limit}&includeMedias=true`);
    }

    async uploadPostMedia(files: { uri: string; type: 'image' | 'video' }[]): Promise<ApiResponse<Array<{
        url: string;
        secure_url: string;
        public_id: string;
        format: string;
        type: string
    }>>> {
        const formData = new FormData();

        files.forEach((file, index) => {
            const fileExtension = file.uri.split('.').pop()?.toLowerCase() || 'jpg';
            const mimeType = file.type === 'video'
                ? `video/${fileExtension}`
                : `image/${fileExtension}`;

            const fieldName = file.type === 'video' ? 'videos' : 'images';

            formData.append(fieldName, {
                uri: file.uri,
                type: mimeType,
                name: `${file.type}_${Date.now()}_${index}.${fileExtension}`,
            } as any);
        });

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/posts/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error('Upload Error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async createPost(postData: CreatePostData): Promise<ApiResponse<any>> {
        return this.makeRequest<any>('/posts', {
            method: 'POST',
            body: JSON.stringify(postData),
        });
    }
    async rePost(repost: any, token: string): Promise<ApiResponse<any>> {
        return this.makeRequest<any>('/posts', {
            method: 'POST',
            body: JSON.stringify(repost),
        }, token);
    }

    async likePost(postId: string): Promise<ApiResponse<{ liked: boolean; }>> {
        return this.makeRequest<{ liked: boolean; }>(`/posts/${postId}/like`, {
            method: 'POST',
        });
    }

    async getPostDetails(postId: string): Promise<ApiResponse<PostData>> {
        return this.makeRequest<PostData>(`/posts/${postId}?includeMedias=true`);
    }

    async updatePost(postId: string, postData: { content: string }): Promise<ApiResponse<Post>> {
        return this.makeRequest<Post>(`/posts/${postId}`, {
            method: 'PUT',
            body: JSON.stringify(postData),
        });
    }

    async deletePost(postId: string): Promise<ApiResponse<null>> {
        return this.makeRequest<null>(`/posts/${postId}`, {
            method: 'DELETE',
        });
    }

    async getPostComments(postId: string): Promise<ApiResponse<Comment[]>> {
        return this.makeRequest<Comment[]>(`/posts/${postId}/comments`);
    }

    async createComment(commentData: CreateCommentData, postId: string): Promise<ApiResponse<CommentData>> {
        return this.makeRequest<CommentData>(`/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify(commentData),
        });
    }

    async likeComment(commentId: string): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
        return this.makeRequest<{ liked: boolean; likesCount: number }>(`/comments/${commentId}/like`, {
            method: 'POST',
        });
    }

    async getUserProfile(userId: string): Promise<ApiResponse<User>> {
        return this.makeRequest<User>(`/users/${userId}`);
    }

    async getViewInformation(userId: string): Promise<ApiResponse<User>> {
        return this.makeRequest<User>(`/user/by-entity/${userId}`);
    }

    async getUserPosts(accountId: string): Promise<ApiResponse<Post[]>> {
        return this.makeRequest<Post[]>(`/posts/author/${accountId}`,{method: 'GET'});
    }

    async followUser(followerId: string, followingId: string, followingType: string, token: string): Promise<ApiResponse<{
        isFollowing: boolean
    }>> {
        return this.makeRequest<{ isFollowing: boolean }>(`/follow/follow`, {
            method: 'POST',
            body: JSON.stringify({
                followerId,
                followingId,
                followingType,
            })
        }, token);
    }
    async unFollowUser(followerId: string, followingId: string, token: string): Promise<ApiResponse<{
        isFollowing: boolean
    }>> {
        return this.makeRequest<{ isFollowing: boolean }>(`/follow/unfollow`, {
            method: 'POST',
            body: JSON.stringify({
                followerId,
                followingId
            })
        }, token);
    }

    async checkFollow(followerId: string, followingId: string, token: string): Promise<ApiResponse<{
        isFollowing: boolean
    }>> {
        return this.makeRequest<{ isFollowing: boolean }>(`/follow/check?followerId=${followerId}&followingId=${followingId}`, {
            method: 'GET'
        }, token);
    }

    async uploadImage(imageUri: string): Promise<ApiResponse<{ imageUrl: string }>> {
        const formData = new FormData();
        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: `image_${Date.now()}.jpg`,
        } as any);

        return this.makeRequest<{ imageUrl: string }>('/upload/image', {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });
    }
}

export const feedApi = new FeedApiService();