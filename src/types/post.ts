// 帖子详情数据接口
export interface PostData {
  id: string;
  title: string;
  content: string;
  time: string;
  author: {
    id: number;
    name: string;
    avatar: string;
    followers: number;
    following: number;
    posts: number;
  };
  likes: any[];
  comments: any[];
  reposts: number;
  images: string[];
}

// 二级评论接口
export interface SubComment {
  id: number;
  username: string;
  content: string;
  time: string;
  likes: number;
  isLiked: boolean;
  replyTo?: {
    id: number;
    username: string;
  };
}

// 回复接口
export interface Reply {
  id: number;
  username: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  isLiked: boolean;
  replyTo?: {
    id: number;
    username: string;
  };
  subComments?: SubComment[];
}

// 分页参数接口
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
}

// 分页响应接口
export interface PaginationResponse<T> {
  list: T[];
  total: number;
}

// 回复请求参数
export interface ReplyRequest {
  content: string;
  replyTo?: number;
} 