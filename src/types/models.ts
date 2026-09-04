export type PublicUser = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
};

export type CommentModel = {
  id: string;
  content: string;
  createdAt: string;
  author: PublicUser;
};

export type PostModel = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: PublicUser;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  previewComments: CommentModel[];
};
