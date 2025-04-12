// 文章详情数据接口
export interface ArticleData {
  id: string;
  title: string;
  content: string;
  time: string;
  module?: string;
  author: {
    id: number;
    name: string;
    avatar: string;
    followers: number;
    following: number;
    articles: number;
    isFollowed: boolean;
  };
  likes: any[];
  comments: any[];
  browse: number;
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
  keyword?: string;
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

// 模块文章列表项接口
export interface ModuleArticleItem {
  id: string;
  title: string;
  summary: string;
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  publishTime: string;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  tags: string[];
  featured: boolean;
  coverImage?: string;
}

// 模块文章列表分页响应
export interface ModuleArticleListResponse {
  list: ModuleArticleItem[];
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
} 