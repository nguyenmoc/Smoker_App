import { CommentData, CommentsMap } from '@/types/commentType';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {formatTime} from "@/utils/extension";

interface CommentsListProps {
  comments: CommentsMap; // <-- object {id: Comment}
  onUserPress: (userId: string) => void;
  onLikeComment: (commentId: string) => void;
}

export const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  onUserPress,
  onLikeComment,
}) => {

  // Convert object -> array
  const commentList = Object.values(comments);

  const CommentItem = ({ comment }: { comment: CommentData }) => (
    <View style={styles.commentItem}>
      <TouchableOpacity onPress={() => onUserPress(comment.entityAccountId)}>
        <Image source={{ uri: comment.authorAvatar }} style={styles.commentAvatar} />
      </TouchableOpacity>

      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <TouchableOpacity onPress={() => onUserPress(comment.accountId)}>
            <Text style={styles.commentUserName}>{comment.authorName}</Text>
          </TouchableOpacity>
          <Text style={styles.commentText}>{comment.content}</Text>
        </View>

        <View style={styles.commentActions}>
          <Text style={styles.commentTime}>{formatTime(comment.createdAt)}</Text>

          <TouchableOpacity
            style={styles.commentLikeBtn}
            onPress={() => onLikeComment(comment._id)}
          >
            {/* Like count = số lượng object trong likes */}
            <Ionicons
              name="heart-outline"
              size={14}
              color="#6b7280"
            />

            {Object.keys(comment.likes || {}).length > 0 && (
              <Text style={styles.commentLikeText}>
                {Object.keys(comment.likes).length}
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
        Bình luận ({commentList.length})
      </Text>

      {commentList.map((comment) => (
        <CommentItem key={comment._id} comment={comment} />
      ))}

      {commentList.length === 0 && (
        <View style={styles.noCommentsContainer}>
          <Ionicons name="chatbubble-outline" size={48} color="#d1d5db" />
          <Text style={styles.noCommentsText}>Chưa có bình luận nào</Text>
          <Text style={styles.noCommentsSubtext}>Hãy là người đầu tiên bình luận!</Text>
        </View>
      )}
    </View>
  );
};

export const styles = StyleSheet.create({
  commentsSection: {
    backgroundColor: '#fff',
  },
  commentsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  commentTime: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 16,
  },
  commentLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  commentLikeText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  commentReplyBtn: {
    paddingVertical: 2,
  },
  commentReplyText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noCommentsText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    fontWeight: '500',
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
});
