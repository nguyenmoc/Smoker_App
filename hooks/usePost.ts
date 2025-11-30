import { CreateCommentData } from '@/constants/feedData';
import { FeedApiService } from '@/services/feedApi';
import { CommentData } from '@/types/commentType';
import { PostData } from '@/types/postType';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

export const usePostDetails = (postId: string) => {
  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { authState } = useAuth();

  const token = authState.token;

  const feedApi = new FeedApiService(token!!);

  const fetchPostDetails = useCallback(async (silent: boolean = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);

    try {
      const postResponse = await feedApi.getPostDetails(postId);

      if (postResponse.success && postResponse.data) {
        setPost(postResponse.data);
        
        // Cập nhật comments ngay sau khi có data
        if (postResponse.data.comments) {
          const commentList = Object.values(postResponse.data.comments);
          setComments(commentList);
        }
      } else {
        setError('Không tìm thấy bài viết');
      }
    } catch (err) {
      console.error('Error fetching post details:', err);
      setError('Đã xảy ra lỗi khi tải bài viết');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [postId, token]);

  const addComment = async (content: string) => {
    if (!post || !authState.currentId) return false;

    const commentData: CreateCommentData = {
      content,
      accountId: authState.currentId!!,
      entityAccountId: authState.EntityAccountId!!,
      entityId: post.entityId,
      entityType: post.entityType,
    };

    try {
      const response = await feedApi.createComment(commentData, post._id);

      if (response.success && response.data) {
        setTimeout(() => {
          fetchPostDetails(true); // silent = true
        }, 100);

        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      return false;
    }
  };

  const likeComment = async (commentId: string) => {
    // Implementation here
  };

  const likePost = useCallback(async () => {
    if (!post) return;

    const currentUserId = authState.currentId;
    if (!currentUserId) return;

    // Tính trạng thái đã like hay chưa
    const isLiked = !!Object.values(post.likes || {}).find(
      like => like.accountId === currentUserId
    );

    // Optimistic update: cập nhật UI ngay
    setPost(prevPost => {
      if (!prevPost) return prevPost;

      const updatedLikes = { ...prevPost.likes };
      if (isLiked) {
        // unlike
        for (const key in updatedLikes) {
          if (updatedLikes[key].accountId === currentUserId) {
            delete updatedLikes[key];
          }
        }
      } else {
        // like
        const newKey = Math.random().toString(36).substring(2, 15);
        updatedLikes[newKey] = {
          accountId: currentUserId,
          TypeRole: 'Account',
        };
      }

      return { ...prevPost, likes: updatedLikes };
    });

    // Gọi API
    try {
      const response = await feedApi.likePost(postId);
      if (!response.success) {
        // revert nếu API fail
        fetchPostDetails(true); // silent fetch
      }
    } catch (err) {
      console.error('Error liking post:', err);
      fetchPostDetails(true); // silent fetch
    }
  }, [post, authState.currentId, feedApi, fetchPostDetails, postId]);

  const updatePost = async (postId: string, data: { content: string }): Promise<boolean> => {
    try {
      const response = await feedApi.updatePost(postId, data);

      if (response.success && response.data) {
        setPost(prevPost => prevPost ? { ...prevPost, content: response.data!.content } : null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating post:', err);
      return false;
    }
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    try {
      const response = await feedApi.deletePost(postId);

      if (response.success) {
        setPost(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting post:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [fetchPostDetails]);

  return {
    post,
    comments,
    loading,
    error,
    currentUserId,
    fetchPostDetails,
    addComment,
    likeComment,
    likePost,
    updatePost,
    deletePost,
  };
};