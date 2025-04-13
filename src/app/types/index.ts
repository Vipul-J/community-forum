import { User } from "@prisma/client";

export type UserWithRelations = User & {
  forums?: Forum[];
  comments?: Comment[];
};

export type ForumWithUser = Forum & {
  user: User;
  _count?: {
    comments: number;
    likes: number;
  };
};

export type ForumWithRelations = ForumWithUser & {
  comments?: CommentWithUser[];
};

export type CommentWithUser = Comment & {
  user: User;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    name: string; 
    image?: string;
  };
  authorId: string; 
  author?: {
    name?: string;
    image?: string;
  };
  createdAt: string;
  forumId: string;

  
}

export interface CommentFormProps {
  forumId: string; 
  onCommentAdded?: () => void;
  isSubmitting: boolean; 
}

export interface Forum {
  id: string;
  title: string;
  description: string;
  createdAt: string; 
  updatedAt: string;
  authorId: string; 
  author?: {
    id: string;
    name: string;
    image?: string;
  };
  tags?: string[]; 
  _count?: {
    likes: number;
  };
}