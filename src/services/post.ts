import request from '@/utils/request';
import type { PostData, Reply, PaginationParams, PaginationResponse, ReplyRequest } from '@/types/post';
import { Result } from '@/model/result';
import type { ListInfoType } from "@/model/listInfo";
// import type { PostData as PostDetailData } from '@/types/post';
import type { PostData as PostCreateData } from '@/types/release';

// 发布帖子
const publishPost = (data: PostCreateData) => {
  return request({
    url: '/posts/publish',
    method: 'post',
    data
  });
};

// 保存草稿
const saveDraft = (data: PostData) => {
  return request({
    url: '/posts/draft',
    method: 'post',
    data
  });
};

// 定时发布
const schedulePost = (data: PostData) => {
  return request({
    url: '/posts/schedule',
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

// 获取帖子列表
const GET_POST_LIST_API = (name: string): Promise<Result<ListInfoType[]>> => {
  return request({
    url: '/posts/ranking/list?name=' + name,
    method: 'get'
  }) as Promise<Result<ListInfoType[]>>;
};

// 获取帖子详情
const GET_POST_DETAIL_API = (id: string): Promise<Result<PostData>> => {
  return request({
    url: '/posts/' + id,
    method: 'get'
  }) as Promise<Result<PostData>>;
};

// 获取帖子回复列表
const GET_POST_REPLIES_API = (postId: number, params: PaginationParams): Promise<Result<PaginationResponse<Reply>>> => {
  return request({
    url: '/posts/' + postId + '/replies',
    method: 'get',
    params
  }) as Promise<Result<PaginationResponse<Reply>>>;
};

// 创建回复
const CREATE_REPLY_API = (postId: number, data: ReplyRequest): Promise<Result<Reply>> => {
  return request({
    url: '/posts/' + postId + '/reply',
    method: 'post',
    data
  }) as Promise<Result<Reply>>;
};

// 创建二级回复
const CREATE_SUB_REPLY_API = (replyId: number, data: ReplyRequest): Promise<Result<Reply>> => {
  return request({
    url: '/posts/reply/' + replyId + '/comment',
    method: 'post',
    data
  }) as Promise<Result<Reply>>;
};

// 点赞回复
const LIKE_REPLY_API = (replyId: number): Promise<Result<void>> => {
  return request({
    url: '/posts/reply/' + replyId + '/like',
    method: 'post'
  }) as Promise<Result<void>>;
};

// 取消点赞回复
const UNLIKE_REPLY_API = (replyId: number): Promise<Result<void>> => {
  return request({
    url: '/posts/reply/' + replyId + '/unlike',
    method: 'post'
  }) as Promise<Result<void>>;
};

// 获取二级评论列表
const GET_SUB_COMMENTS_API = (replyId: number, params: PaginationParams): Promise<Result<PaginationResponse<Reply>>> => {
  return request({
    url: '/posts/reply/' + replyId + '/comments',
    method: 'get',
    params
  }) as Promise<Result<PaginationResponse<Reply>>>;
};

// 点赞帖子
const LIKE_POST_API = (postId: string): Promise<Result<void>> => {
  return request({
    url: '/posts/reply/' + postId + '/like',
    method: 'post'
  }) as Promise<Result<void>>;
};

// 取消点赞帖子
const UNLIKE_POST_API = (postId: string): Promise<Result<void>> => {
  return request({
    url: '/posts/reply/' + postId + '/unlike', 
    method: 'post'
  }) as Promise<Result<void>>;
};

export default {
  publishPost,
  saveDraft,
  schedulePost,
  uploadImage,
  uploadVideo,
  GET_POST_LIST_API,
  GET_POST_REPLIES_API,
  CREATE_REPLY_API,
  LIKE_REPLY_API,
  UNLIKE_REPLY_API,
  GET_SUB_COMMENTS_API,
  GET_POST_DETAIL_API,
  CREATE_SUB_REPLY_API,
  LIKE_POST_API,
  UNLIKE_POST_API
}