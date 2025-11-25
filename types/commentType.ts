export interface CommentLike {
  [likeId: string]: {
    accountId: string;
    TypeRole: string;
  };
}

export interface CommentReply {
  [replyId: string]: CommentData;
}

export interface CommentData {
  _id: string;
  accountId: string;
  entityAccountId: string;
  entityId: string;
  entityType: string;
  content: string;
  likes: CommentLike;
  replies: CommentReply;
  images: string;
  typeRole: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorAvatar: string;
  authorEntityAccountId: string;
  authorEntityType: string;
  authorEntityId: string;
}

// Nếu muốn map theo comment _id:
export type CommentsMap = Record<string, CommentData>;
