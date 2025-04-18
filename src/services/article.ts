import request from '@/utils/request';
import type {
  ArticleData,
  Reply,
  PaginationParams,
  PaginationResponse,
  ReplyRequest,
  ModuleArticleListResponse,
  UserPostStatus,
  UserPostsResponse,
  ArticleListResponse,
  ReplyListResponse,
  MediaAuthResponse
} from '@/types/article';
import type { Result } from '@/model/result';
import type { ListInfoType as ListInfoTypeModel } from "@/model/listInfo";
import type { PostData as PostCreateData } from '@/types/release';
import UserInfoUtil from '@/utils/userInfo';

// 发布文章
const publishArticle = (data: PostCreateData): Promise<Result<any>> => {
  return request({
    url: '/article/publish',
    method: 'post',
    data
  }) as Promise<Result<any>>;
};

// 保存草稿
const saveDraft = (data: ArticleData): Promise<Result<any>> => {
  return request({
    url: '/article/draft',
    method: 'post',
    data
  }) as Promise<Result<any>>;
};

// 定时发布
const scheduleArticle = (data: ArticleData): Promise<Result<any>> => {
  return request({
    url: '/article/schedule',
    method: 'post',
    data
  }) as Promise<Result<any>>;
};

// 上传图片
const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 上传视频
const uploadVideo = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/upload/video',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 获取文章列表
const GET_ARTICLE_LIST_API = (name: string): Promise<Result<ListInfoTypeModel[]>> => {
  return request({
    url: '/article/ranking/list?name=' + name,
    method: 'get'
  }) as Promise<Result<ListInfoTypeModel[]>>;
};

// 获取文章详情
const GET_ARTICLE_DETAIL_API = (id: string): Promise<Result<ArticleData>> => {
  return request({
    url: '/article/details/' + id,
    method: 'get'
  }) as Promise<Result<ArticleData>>;
};

// 获取文章回复列表
const GET_ARTICLE_REPLIES_API = (articleId: number, params: PaginationParams): Promise<Result<PaginationResponse<Reply>>> => {
  return request({
    url: '/article/' + articleId + '/replies',
    method: 'get',
    params
  }) as Promise<Result<PaginationResponse<Reply>>>;
};

// 创建回复
const CREATE_REPLY_API = (articleId: number, data: ReplyRequest): Promise<Result<Reply>> => {
  return request({
    url: '/article/' + articleId + '/reply',
    method: 'post',
    data
  }) as Promise<Result<Reply>>;
};

// 创建二级回复
const CREATE_SUB_REPLY_API = (replyId: number, data: ReplyRequest): Promise<Result<Reply>> => {
  return request({
    url: '/article/reply/' + replyId + '/comment',
    method: 'post',
    data
  }) as Promise<Result<Reply>>;
};

// 点赞回复
const LIKE_REPLY_API = (replyId: number): Promise<Result<void>> => {
  return request({
    url: '/article/reply/' + replyId + '/like',
    method: 'post'
  }) as Promise<Result<void>>;
};

// 取消点赞回复
const UNLIKE_REPLY_API = (replyId: number): Promise<Result<void>> => {
  return request({
    url: '/article/reply/' + replyId + '/unlike',
    method: 'post'
  }) as Promise<Result<void>>;
};

// 获取二级评论列表
const GET_SUB_COMMENTS_API = (replyId: number, params: PaginationParams): Promise<Result<PaginationResponse<Reply>>> => {
  return request({
    url: '/article/reply/' + replyId + '/comments',
    method: 'get',
    params
  }) as Promise<Result<PaginationResponse<Reply>>>;
};

// 点赞文章
const LIKE_ARTICLE_API = (articleId: string): Promise<Result<void>> => {
  return request({
    url: '/article/reply/' + articleId + '/like?state=true',
    method: 'post'
  }) as Promise<Result<void>>;
};

// 取消点赞文章
const UNLIKE_ARTICLE_API = (articleId: string): Promise<Result<void>> => {
  return request({
    url: '/article/reply/' + articleId + '/like?state=false',
    method: 'post'
  }) as Promise<Result<void>>;
};

// 获取模块内文章列表
const GET_MODULE_ARTICLES_API = (moduleId: number, params: PaginationParams): Promise<Result<ModuleArticleListResponse>> => {
  return request({
    url: `/article/list?module=${moduleId}`,
    method: 'get',
    params
  }) as Promise<Result<ModuleArticleListResponse>>;
};

// 关注作者
const FOLLOW_AUTHOR_API = (authorId: number): Promise<Result<void>> => {
  return request({
    url: `/article/author/${authorId}/follow`,
    method: 'post'
  }) as Promise<Result<void>>;
};

// 取消关注作者
const UNFOLLOW_AUTHOR_API = (authorId: number): Promise<Result<void>> => {
  return request({
    url: `/article/author/${authorId}/unfollow`,
    method: 'post'
  }) as Promise<Result<void>>;
};

/**
 * 更新文章查看次数
 * 
 * @param {string} articleId - 文章ID
 * @returns {Promise<Result<any>>} - 返回更新结果
 */
async function UPDATE_ARTICLE_VIEW_COUNT_API(articleId: string): Promise<Result<any>> {
  if (!UserInfoUtil.isLoggedIn()) {
    return {
      code: 200,
      message: 'success',
      data: null
    } as Result<any>;
  }
  return await request({
    url: `/web/article/view/${articleId}`,
    method: 'POST'
  }) as Result<any>
}

/**
 * 获取用户帖子列表
 * @param params 查询参数
 * @returns 帖子列表和总数
 */
async function GET_USER_POSTS_API(params?: {
  status?: UserPostStatus;
  page?: number;
  size?: number;
}): Promise<Result<UserPostsResponse>> {
  return await request({
    url: '/article/user/posts',
    method: 'GET',
    params
  }) as Result<UserPostsResponse>;
}

/**
 * 删除用户帖子
 * @param postId 帖子ID
 * @returns 操作结果
 */
async function DELETE_USER_POST_API(postId: string): Promise<Result<null>> {
  return await request({
    url: `/article/user/posts/${postId}`,
    method: 'DELETE'
  }) as Result<null>;
}

/**
 * 取消发布帖子（将待审核的帖子转为草稿）
 * @param postId 帖子ID
 * @returns 操作结果
 */
async function CANCEL_USER_POST_PUBLISH_API(postId: string): Promise<Result<null>> {
  return await request({
    url: `/article/user/posts/${postId}/cancel`,
    method: 'PUT'
  }) as Result<null>;
}

// 搜索文章API
const SEARCH_ARTICLES_API = (params: PaginationParams): Promise<Result<ModuleArticleListResponse>> => {
  return request({
    url: '/article/search',
    method: 'get',
    params
  }) as Promise<Result<ModuleArticleListResponse>>;
};

// 获取我的文章列表
const GET_MY_ARTICLES_API = (params: { pageSize: number; pageNum: number }): Promise<Result<ArticleListResponse>> => {
  return request({
    url: '/article/my-articles',
    method: 'get',
    params
  }) as Promise<Result<ArticleListResponse>>;
};

// 获取我的最新回复列表
const GET_MY_REPLIES_API = (params: { pageSize: number; pageNum: number }): Promise<Result<ReplyListResponse>> => {
  return request({
    url: '/article/my-replies',
    method: 'get',
    params
  }) as Promise<Result<ReplyListResponse>>;
};

// 获取媒体授权
const GET_MEDIA_AUTH_API = (mediaUrl: string): Promise<Result<MediaAuthResponse>> => {
  return request({
    url: '/file/media/auth',
    method: 'post',
    data: { url: mediaUrl }
  }) as Promise<Result<MediaAuthResponse>>;
};

export default {
  publishArticle,
  saveDraft,
  scheduleArticle,
  uploadImage,
  uploadVideo,
  GET_ARTICLE_LIST_API,
  GET_ARTICLE_DETAIL_API,
  GET_ARTICLE_REPLIES_API,
  CREATE_REPLY_API,
  CREATE_SUB_REPLY_API,
  LIKE_REPLY_API,
  UNLIKE_REPLY_API,
  GET_SUB_COMMENTS_API,
  LIKE_ARTICLE_API,
  UNLIKE_ARTICLE_API,
  GET_MODULE_ARTICLES_API,
  FOLLOW_AUTHOR_API,
  UNFOLLOW_AUTHOR_API,
  UPDATE_ARTICLE_VIEW_COUNT_API,
  GET_USER_POSTS_API,
  DELETE_USER_POST_API,
  CANCEL_USER_POST_PUBLISH_API,
  SEARCH_ARTICLES_API,
  GET_MY_ARTICLES_API,
  GET_MY_REPLIES_API,
  GET_MEDIA_AUTH_API
}; 