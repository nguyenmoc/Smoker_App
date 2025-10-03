import { Comment, CreateCommentData, mockComments, mockPosts, Post } from '@/constants/feedData';
import { feedApi } from '@/services/feedApi';
import { useCallback, useEffect, useState } from 'react';

export const usePostDetails = (postId: string) => {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchPostDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [postResponse, commentsResponse, userResponse] = await Promise.all([
        feedApi.getPostDetails(postId),
        feedApi.getPostComments(postId),
        feedApi.getCurrentUserId(),
      ]);
      
      if (postResponse.success && postResponse.data) {
        setPost(postResponse.data);
      } else {
        // Fallback to mock data
        const mockPost = mockPosts.find(p => p.id === postId);
        if (mockPost) {
          setPost(mockPost);
        } else {
          setError('Không tìm thấy bài viết');
        }
      }

      if (commentsResponse.success && commentsResponse.data) {
        setComments(commentsResponse.data);
      } else {
        // Fallback to mock comments
        setComments(mockComments);
      }

      if (userResponse.success && userResponse.data) {
        setCurrentUserId(userResponse.data);
      } else {
        setCurrentUserId('1'); // Fallback user ID for mock data
      }
    } catch (err) {
      console.error('Error fetching post details:', err);
      const mockPost = mockPosts.find(p => p.id === postId);
      if (mockPost) {
        setPost(mockPost);
        setComments(mockComments);
        setCurrentUserId('1'); // Fallback user ID
      } else {
        setError('Không thể tải bài viết');
      }
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addComment = async (commentData: CreateCommentData): Promise<boolean> => {
    try {
      const response = await feedApi.createComment(commentData);
      
      if (response.success && response.data) {
        setComments(prev => [response.data!, ...prev]);
        setPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null);
        return true;
      } else {
        // Fallback to local creation
        const newComment: Comment = {
          id: Date.now().toString(),
          userId: currentUserId || '10',
          user: {
            id: currentUserId || '10',
            name: 'Bạn',
            username: '@me',
            avatar: 'https://i.pravatar.cc/100?img=10',
            followers: 1250,
            following: 356,
            posts: 42,
          },
          content: commentData.content,
          createdAt: new Date().toISOString(),
          likes: 0,
          isLiked: false,
        };
        
        setComments(prev => [newComment, ...prev]);
        setPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null);
        return false;
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      return false;
    }
  };

  const likeComment = async (commentId: string): Promise<void> => {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );

    try {
      const response = await feedApi.likeComment(commentId);
      
      if (!response.success) {
        // Revert optimistic update
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: !comment.isLiked,
                  likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                }
              : comment
          )
        );
      }
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const likePost = async (): Promise<void> => {
    if (!post) return;

    setPost(prevPost => {
      if (!prevPost) return prevPost;
      return {
        ...prevPost,
        isLiked: !prevPost.isLiked,
        likes: prevPost.isLiked ? prevPost.likes - 1 : prevPost.likes + 1,
      };
    });

    try {
      const response = await feedApi.likePost(postId);
      
      if (!response.success) {
        setPost(prevPost => {
          if (!prevPost) return prevPost;
          return {
            ...prevPost,
            isLiked: !prevPost.isLiked,
            likes: prevPost.isLiked ? prevPost.likes - 1 : prevPost.likes + 1,
          };
        });
      }
    } catch (err) {
      console.error('Error liking post:', err);
      setPost(prevPost => {
        if (!prevPost) return prevPost;
        return {
          ...prevPost,
          isLiked: !prevPost.isLiked,
          likes: prevPost.isLiked ? prevPost.likes - 1 : prevPost.likes + 1,
        };
      });
    }
  };

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