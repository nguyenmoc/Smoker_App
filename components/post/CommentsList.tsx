import { Comment } from '@/constants/feedData';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './styles';

interface CommentsListProps {
  comments: Comment[];
  onUserPress: (userId: string) => void;
  onLikeComment: (commentId: string) => void;
}

export const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  onUserPress,
  onLikeComment,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return `${Math.floor(diffInHours / 24)} ngày trước`;
  };

  const CommentItem = ({ comment }: { comment: Comment }) => (
    <View style={styles.commentItem}>
      <TouchableOpacity onPress={() => onUserPress(comment.userId)}>
        <Image source={{ uri: comment.user.avatar }} style={styles.commentAvatar} />
      </TouchableOpacity>
      
      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <TouchableOpacity onPress={() => onUserPress(comment.userId)}>
            <Text style={styles.commentUserName}>{comment.user.name}</Text>
          </TouchableOpacity>
          <Text style={styles.commentText}>{comment.content}</Text>
        </View> 
        
        <View style={styles.commentActions}>
          <Text style={styles.commentTime}>{formatTime(comment.createdAt)}</Text>
          
          <TouchableOpacity
            style={styles.commentLikeBtn}
            onPress={() => onLikeComment(comment.id)}
          >
            <Ionicons
              name={comment.isLiked ? "heart" : "heart-outline"}
              size={14}
              color={comment.isLiked ? "#ef4444" : "#6b7280"}
            />
            {comment.likes > 0 && (
              <Text style={[
                styles.commentLikeText,
                comment.isLiked && { color: '#ef4444' }
              ]}>
                {comment.likes}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.commentReplyBtn}>
            <Text style={styles.commentReplyText}>Trả lời</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.commentsSection}>
      <Text style={styles.commentsSectionTitle}>
        Bình luận ({comments.length})
      </Text>
      
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
      
      {comments.length === 0 && (
        <View style={styles.noCommentsContainer}>
          <Ionicons name="chatbubble-outline" size={48} color="#d1d5db" />
          <Text style={styles.noCommentsText}>Chưa có bình luận nào</Text>
          <Text style={styles.noCommentsSubtext}>Hãy là người đầu tiên bình luận!</Text>
        </View>
      )}
    </View>
  );
};