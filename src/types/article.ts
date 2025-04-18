// 媒体授权接口
export interface MediaAuthResponse {
  authorizedUrl: string;
  expireTime: number;
}
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
  likes: number[];
  comments: any[];
  browse: number;
  images: ImageInfo[];
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
  id: number | string;
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

// 用户帖子状态枚举
export enum UserPostStatus {
  PUBLISHED = 'published',  // 已发布
  PENDING = 'pending',      // 待审核
  DRAFT = 'draft',          // 草稿
  DELETED = 'deleted'       // 已删除
}

/**
 * 用户帖子数据类型
 */
export interface UserPost {
  id: string;               // 帖子ID
  title: string;            // 标题
  content: string;          // 内容
  status?: UserPostStatus;  // 状态
  createTime?: string;      // 创建时间
  updateTime?: string;      // 更新时间
  browse?: number;          // 浏览量
  comments?: any[];         // 评论
  images?: string[];        // 图片
  likes?: any[];            // 点赞
  plateId?: number;         // 板块ID
  sendId?: number;          // 发送者ID
  time?: string;            // 时间
}

/**
 * 用户帖子列表返回结构
 */
export interface UserPostsResponse {
  list: UserPost[];        // 帖子列表
  total: number;            // 总数量
}

export interface Article {
  id: string;
  title: string;
  content: string;
  createTime: string;
  updateTime: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  views: number;
  images?: string[];
  lastReply?: {
    id: string;
    content: string;
    createTime: string;
    author: {
      id: string;
      name: string;
      avatar: string;
    };
  };
}

export interface ArticleListResponse {
  total: number;
  list: Article[];
  pageSize: number;
  pageNum: number;
}

export interface Reply {
  id: number | string;
  content: string;
  createTime: string;
  articleId: string;
  articleTitle: string;
  author: {
    id: number | string;
    name: string;
    avatar: string;
  };
}

export interface ReplyListResponse {
  total: number;
  list: Reply[];
  pageSize: number;
  pageNum: number;
}

// 图片类型定义
export interface ImageInfo {
  url: string;
  name: string;
  type: string;
  key: string;
}

export interface MediaAuth {
  url: string;
  authorizedUrl: string;
  expireTime: number;
} 