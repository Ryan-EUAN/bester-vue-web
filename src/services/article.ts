import request from '@/utils/request';
import type {
  ArticleData,
  Reply,
  PaginationParams,
  PaginationResponse,
  ReplyRequest,
  ModuleArticleListResponse
} from '@/types/article';
import { Result } from '@/model/result';
import type { ListInfoType } from "@/model/listInfo";
import type { PostData as PostCreateData } from '@/types/release';

// 发布文章
const publishArticle = (data: PostCreateData) => {
  return request({
    url: '/article/publish',
    method: 'post',
    data
  });
};

// 保存草稿
const saveDraft = (data: ArticleData) => {
  return request({
    url: '/article/draft',
    method: 'post',
    data
  });
};

// 定时发布
const scheduleArticle = (data: ArticleData) => {
  return request({
    url: '/article/schedule',
    method: 'post',
    data
  });
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
const GET_ARTICLE_LIST_API = (name: string): Promise<Result<ListInfoType[]>> => {
  return request({
    url: '/article/ranking/list?name=' + name,
    method: 'get'
  }) as Promise<Result<ListInfoType[]>>;
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
  return await request({
    url: `/web/article/view/${articleId}`,
    method: 'POST'
  }) as Result<any>
}

export default {
  publishArticle,
  saveDraft,
  scheduleArticle,
  uploadImage,
  uploadVideo,
  GET_ARTICLE_LIST_API,
  GET_ARTICLE_REPLIES_API,
  CREATE_REPLY_API,
  LIKE_REPLY_API,
  UNLIKE_REPLY_API,
  GET_SUB_COMMENTS_API,
  GET_ARTICLE_DETAIL_API,
  CREATE_SUB_REPLY_API,
  LIKE_ARTICLE_API,
  UNLIKE_ARTICLE_API,
  GET_MODULE_ARTICLES_API,
  FOLLOW_AUTHOR_API,
  UNFOLLOW_AUTHOR_API,
  UPDATE_ARTICLE_VIEW_COUNT_API
} 