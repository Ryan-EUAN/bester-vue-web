<template>
  <div class="post-container" :class="{ 'dark-theme': isDarkMode }">
    <!-- 左侧内容区 -->
    <div class="post-main">
      <!-- 帖子头部信息 -->
      <div class="post-header">
        <div class="post-title">
          <span class="title-tag">[{{ postData.module || '未分类' }}]</span>
          <span class="title-text">{{ postData.title }}</span>
          <span class="title-badge" @click="copyPostLink">复制链接</span>
        </div>
        <div class="post-meta">
          <div class="user-info">
            <a-avatar :size="40" :src="postData.author.avatar" />
            <div class="info-content">
              <div class="username">
                <span>{{ postData.author.name }}</span>
                <tag-outlined class="role-icon" />
                <span class="role-text">楼主</span>
              </div>
              <div class="post-time">发表于 {{ postData.time }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用浮动按钮组件 -->
      <FloatingActionButtons pageType="article" @refresh="refresh" />

      <!-- 帖子内容 -->
      <div class="post-content">
        <p>{{ postData.content }}</p>
        <!-- 媒体内容区域 -->
        <div class="media-preview" v-if="postData.images && postData.images.length > 0">
          <div class="media-grid">
            <template v-for="(media, index) in postData.images" :key="index">
              <!-- 图片项 -->
              <div v-if="media.type === 'image'" 
                   :class="['media-item', 'image-item', getMediaItemClass(index, postData.images.length)]">
                <div class="media-wrapper">
                  <a-image 
                    :src="media.url" 
                    :alt="media.name"
                    :preview="{
                      src: media.url,
                      mask: false
                    }"
                  />
                </div>
              </div>
              <!-- 视频项 -->
              <div v-else 
                   :class="['media-item', 'video-item', getMediaItemClass(index, postData.images.length)]">
                <div class="media-wrapper">
                  <video 
                    controls
                    :src="media.url"
                    class="video-player"
                    preload="metadata"
                    controlsList="nodownload"
                  ></video>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 帖子统计信息 -->
      <div class="post-stats">
        <div class="stat-item">
          <eye-outlined />
          <span>{{ postData.browse }} 次浏览</span>
        </div>
        <div class="stat-item">
          <message-outlined />
          <span>{{ postData.comments.length }} 条评论</span>
        </div>
        <div class="stat-item clickable" @click="handlePostLike">
          <like-outlined :class="{ active: postData.likes.includes(currentUserId) }" />
          <span :class="{ active: postData.likes.includes(currentUserId) }">{{ postData.likes.length }} 次点赞</span>
        </div>
      </div>

      <!-- 回复区域 -->
      <div class="post-reply">
        <div class="reply-header">
          <span class="reply-title">回复</span>
          <div class="reply-tools">
            <a-tooltip title="表情">
              <smile-outlined class="tool-icon" @click="showEmoji = true" />
            </a-tooltip>
            <a-tooltip title="图片">
              <picture-outlined class="tool-icon" />
            </a-tooltip>
            <a-tooltip title="@用户">
              <at-outlined class="tool-icon" />
            </a-tooltip>
          </div>
        </div>
        <div class="reply-content">
          <div v-if="currentReplyTo" class="reply-to">
            回复 {{ currentReplyTo.username }}
            <close-outlined class="close-icon" @click="currentReplyTo = null" />
          </div>
          <a-textarea v-model:value="replyContent" placeholder="说点什么吧..." :auto-size="{ minRows: 2, maxRows: 4 }"
            :maxLength="200" />
          <div class="reply-footer">
            <span class="word-count">{{ replyContent.length }}/200</span>
            <a-button type="primary" @click="handleReply" :loading="loading">回复</a-button>
          </div>
        </div>
      </div>

      <!-- 回复列表 -->
      <div class="reply-list">
        <div class="list-header">
          <span class="title">全部回复 ({{ pagination.total || replies.length }})</span>
          <a-select v-model:value="sortType" style="width: 120px">
            <a-select-option value="time">按时间排序</a-select-option>
            <a-select-option value="hot">按热度排序</a-select-option>
          </a-select>
        </div>
        <a-spin :spinning="loading">
          <div class="reply-items">
            <div v-for="reply in replies" :key="reply.id" class="reply-item">
              <div class="reply-user">
                <a-avatar :size="40" :src="reply.avatar" />
                <div class="user-info">
                  <div class="username">{{ reply.username }}</div>
                  <div class="reply-time">{{ reply.time }}</div>
                </div>
              </div>
              <div class="reply-body">
                <div class="reply-text">{{ reply.content }}</div>
                <div class="reply-actions">
                  <span class="action-item" @click="handleLike(reply)">
                    <like-outlined :class="{ active: reply.isLiked }" />
                    <span :class="{ active: reply.isLiked }">{{ reply.likes }}</span>
                  </span>
                  <span class="action-item" @click="showSubComments(reply)">
                    <comment-outlined />
                    <span>{{ reply.subComments?.length || 0 }}条评论</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
    </div>

    <!-- 修改后的右侧信息栏 -->
    <div class="post-sidebar">
      <!-- 作者信息卡片 -->
      <div class="author-card">
        <div class="author-header">
          <a-avatar :size="48" :src="postData.author.avatar" />
          <div class="author-info">
            <div class="author-name">{{ postData.author.name }}</div>
            <div class="author-title">作者</div>
          </div>
          <a-button type="primary" :ghost="!postData.author.isFollowed" @click="handleFollow" :loading="followLoading">
            {{ postData.author.isFollowed ? '已关注' : '关注' }}
          </a-button>
        </div>
        <div class="author-stats">
          <div class="stat-item">
            <span class="label">关注</span>
            <span class="value">{{ postData.author.following }}</span>
          </div>
          <div class="stat-item">
            <span class="label">粉丝</span>
            <span class="value">{{ postData.author.followers }}</span>
          </div>
          <div class="stat-item">
            <span class="label">帖子</span>
            <span class="value">{{ postData.author.articles }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 二级评论弹窗 -->
    <a-modal v-model:open="subCommentsVisible" :title="`${currentReply?.username || ''}的评论`" :footer="null"
      width="500px" destroyOnClose @cancel="handleCloseSubComments">
      <div class="sub-comments-container">
        <!-- 原评论内容 -->
        <div class="original-comment">
          <div class="comment-header">
            <span class="username">{{ currentReply?.username }}</span>
            <span class="time">{{ currentReply?.time }}</span>
          </div>
          <div class="comment-content">{{ currentReply?.content }}</div>
        </div>

        <!-- 二级评论输入框 -->
        <div class="sub-comment-input">
          <div v-if="modalReplyTo" class="reply-to">
            回复 {{ modalReplyTo.username }}
            <close-outlined class="close-icon" @click="modalReplyTo = null, modalReplyContent = ''" />
          </div>
          <a-textarea v-model:value="modalReplyContent" placeholder="说点什么吧..." :auto-size="{ minRows: 1, maxRows: 2 }"
            :maxLength="100" />
          <div class="input-footer">
            <span class="word-count">{{ getActualContentLength(modalReplyContent) }}/100</span>
            <a-button type="primary" size="small" @click="handleModalReply" :loading="modalLoading">
              回复
            </a-button>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="sub-comments-list">
          <div v-for="comment in currentReply?.subComments" :key="comment.id" class="sub-comment-item"
            @mouseover="hoveredComment = comment.id" @mouseleave="hoveredComment = null">
            <div class="comment-header">
              <span class="username">{{ comment.username }}</span>
              <span class="time">{{ comment.time }}</span>
              <div class="hover-actions" v-show="hoveredComment === comment.id">
                <span class="action" @click="handleSubLike(comment)">
                  <like-outlined :class="{ active: comment.isLiked }" />
                  <span :class="{ active: comment.isLiked }">{{ comment.likes || 0 }}</span>
                </span>
                <span class="action" @click="handleModalReplyToComment(comment)">
                  <comment-outlined />
                  <span>回复</span>
                </span>
              </div>
            </div>
            <div class="comment-content">
              <template v-if="comment.replyTo">
                <span class="reply-to-text">回复 @{{ comment.replyTo.username }}：</span>
              </template>
              {{ comment.content }}
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import {
  TagOutlined,
  EyeOutlined,
  MessageOutlined,
  SmileOutlined,
  PictureOutlined,
  LikeOutlined,
  CommentOutlined,
  CloseOutlined
} from '@ant-design/icons-vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import articleApi from '@/services/article';
import type { ArticleData, Reply, SubComment } from '@/types/article';
import router from '@/router';
import FloatingActionButtons from '@/components/common/FloatingActionButtons.vue';
import { useTheme } from '@/composables/useTheme';

const { isDarkMode } = useTheme();

const currentUserId = JSON.parse(localStorage.getItem('userInfo') || '{}').id || 0;
const postData = ref<ArticleData>({
  id: '',
  title: '',
  content: '',
  time: '',
  module: '',
  author: {
    id: 0,
    name: '',
    avatar: '',
    followers: 0,
    following: 0,
    articles: 0,
    isFollowed: false
  },
  likes: [],
  comments: [],
  browse: 0,
  images: []
});

// 分页相关数据
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
});

// 回复列表数据
const replies = ref<Reply[]>([
  {
    id: 1,
    username: '用户A',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    content: '这个帖子很有意思',
    time: '2小时前',
    likes: 12,
    isLiked: false,
    createTime: '2024-01-20 10:00:00',
    articleId: '1',
    articleTitle: '示例文章标题',
    author: {
      id: 1,
      name: '用户A',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'
    },
    subComments: [
      {
        id: 101,
        username: '用户C',
        content: '确实不错',
        time: '1小时前',
        likes: 3,
        isLiked: false
      },
      {
        id: 102,
        username: '用户D',
        content: '支持一下',
        time: '30分钟前',
        likes: 1,
        isLiked: false
      }
    ]
  },
  {
    id: 2,
    username: '用户B',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    content: '支持楼主，写得很好',
    time: '1小时前',
    likes: 5,
    isLiked: true,
    createTime: '2024-01-20 11:00:00',
    articleId: '1',
    articleTitle: '示例文章标题',
    author: {
      id: 2,
      name: '用户B',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'
    },
    replyTo: {
      id: 1,
      username: '用户A'
    }
  }
]);

const replyContent = ref('');
const currentReplyTo = ref<{ id: number; username: string } | null>(null);
const showEmoji = ref(false);
const sortType = ref('time');
const loading = ref(false);
const subCommentsVisible = ref(false);
const currentReply = ref<Reply | null>(null);
const hoveredComment = ref<number | null>(null);

// 弹窗内的状态
const modalReplyContent = ref('');
const modalReplyTo = ref<{ id: number; username: string } | null>(null);
const modalLoading = ref(false);

// 添加关注状态loading
const followLoading = ref(false);

// 加载回复列表
const loadReplies = async () => {
  // try {
  //   loading.value = true;
  //   const res = await articleApi.GET_POST_REPLIES_API(postData.value.id, {
  //     page: pagination.value.current,
  //     size: pagination.value.pageSize,
  //     sort: sortType.value
  //   });
  //   replies.value = res.data.list;
  //   pagination.value.total = res.data.total;
  // } catch (error) {
  //   message.error('加载回复失败');
  // } finally {
  //   loading.value = false;
  // }
};

// 处理回复提交
const handleReply = async () => {
  if (!replyContent.value.trim()) {
    message.warning('请输入回复内容');
    return;
  }

  // try {
  //   loading.value = true;
  //   await articleApi.CREATE_REPLY_API(postData.value.id, {
  //     content: replyContent.value,
  //     replyTo: currentReplyTo.value?.id
  //   });
  //   message.success('回复成功');
  //   replyContent.value = '';
  //   currentReplyTo.value = null;
  //   await loadReplies();
  // } catch (error) {
  //   message.error('回复失败');
  // } finally {
  //   loading.value = false;
  // }
};

// 处理点赞
const handleLike = async (reply: Reply) => {
  try {
    if (reply.isLiked) {
      await articleApi.UNLIKE_REPLY_API(Number(reply.id));
    } else {
      await articleApi.LIKE_REPLY_API(Number(reply.id));
    }
    reply.isLiked = !reply.isLiked;
    reply.likes += reply.isLiked ? 1 : -1;
  } catch (error) {
    message.error('操作失败');
  }
};

// 显示二级评论
const showSubComments = (reply: Reply) => {
  currentReply.value = reply;
  subCommentsVisible.value = true;
};

// 计算实际内容长度（不包括@用户名部分）
const getActualContentLength = (content: string): number => {
  if (!content) return 0;
  // 如果有@用户名，去掉@用户名部分再计算长度
  if (modalReplyTo.value) {
    const mentionText = `@${modalReplyTo.value.username} `;
    return content.replace(mentionText, '').length;
  }
  return content.length;
};

// 修改处理弹窗内的回复函数
const handleModalReply = async () => {
  const actualContent = modalReplyContent.value;
  if (modalReplyTo.value) {
    if (getActualContentLength(actualContent) === 0) {
      message.warning('请输入回复内容');
      return;
    }
  } else if (!actualContent.trim()) {
    message.warning('请输入回复内容');
    return;
  }

  // try {
  //   modalLoading.value = true;
  //   await articleApi.CREATE_SUB_REPLY_API(currentReply.value!.id, {
  //     content: modalReplyContent.value,
  //     replyTo: modalReplyTo.value?.id
  //   });
  //   message.success('回复成功');
  //   modalReplyContent.value = '';
  //   modalReplyTo.value = null;
  //   // 重新加载二级评论列表
  //   await loadSubComments(currentReply.value!.id);
  // } catch (error) {
  //   message.error('回复失败');
  // } finally {
  //   modalLoading.value = false;
  // }
};

// 处理弹窗内的回复评论
const handleModalReplyToComment = (comment: SubComment) => {
  modalReplyTo.value = {
    id: comment.id,
    username: comment.username
  };
  modalReplyContent.value = `@${comment.username} `;
};

// 关闭弹窗时清空状态
const handleCloseSubComments = () => {
  currentReply.value = null;
  subCommentsVisible.value = false;
  modalReplyContent.value = '';
  modalReplyTo.value = null;
};

// 处理二级评论点赞
const handleSubLike = (comment: SubComment) => {
  comment.isLiked = !comment.isLiked;
  comment.likes += comment.isLiked ? 1 : -1;
};

// 加载二级评论列表
// const loadSubComments = async (replyId: number) => {
// try {
//   const res = await articleApi.GET_SUB_COMMENTS_API(replyId, {
//     page: 1,
//     size: 100 // 二级评论一般较少，可以一次性加载
//   });
//   if (currentReply.value) {
//     currentReply.value.subComments = res.data.list;
//   }
// } catch (error) {
//   message.error('加载评论失败');
// }
// };

// 监听排序方式变化
watch(sortType, () => {
  pagination.value.current = 1;
  loadReplies();
});

// 组件挂载时加载回复列表
onMounted(() => {
  loadReplies();
});

onMounted(async () => {
  const route = useRoute();
  const postId = String(route.params.id);
  if (!postId) {
    message.error('帖子不存在');
    router.push("/")
    return;
  }

  // 存储当前文章ID到本地存储
  saveCurrentPageToLocalStorage(postId);

  try {
    await loadPostData(postId);
  } catch (error) {
    message.error('获取帖子详情失败');
    router.push("/")
  }
});

// 保存当前页面信息到本地存储
const saveCurrentPageToLocalStorage = (postId: string) => {
  const currentPath = {
    path: window.location.pathname,
    type: 'post',
    postId: postId
  };

  // 保存当前文章详情页信息
  localStorage.setItem('articleDetailPage', JSON.stringify(currentPath));
};

// 加载文章数据
const loadPostData = async (postId: string) => {
  try {
    const response = await articleApi.GET_ARTICLE_DETAIL_API(postId);
    if (response.code !== 200) {
      message.error(response.message || '帖子不存在');
      router.push("/")
      return;
    }
    postData.value = response.data;
  } catch (error) {
    throw error;
  }
};

// 刷新功能
const refresh = async () => {
  const route = useRoute();
  const postId = String(route.params.id);
  if (postId) {
    try {
      message.loading('正在刷新数据...');
      await loadPostData(postId);
      await loadReplies();
      message.success('刷新成功');
    } catch (error) {
      message.error('刷新失败');
    }
  }
};

// 复制链接功能
const copyPostLink = async () => {
  try {
    const currentUrl = window.location.href;
    await navigator.clipboard.writeText(currentUrl);
    message.success('链接已复制到剪贴板，快去分享给你的朋友们吧！');
  } catch (err) {
    console.error('复制失败:', err);
    message.error('复制失败，请手动复制');
  }
};

// 处理帖子点赞
const handlePostLike = async () => {
  if (currentUserId === 0) {
    message.error('请先登录');
    return;
  }
  if (postData.value.likes.includes(currentUserId)) {
    await articleApi.UNLIKE_ARTICLE_API(postData.value.id);
    postData.value.likes = postData.value.likes.filter(id => id !== currentUserId);
  } else {
    await articleApi.LIKE_ARTICLE_API(postData.value.id);
    postData.value.likes.push(currentUserId);
  }
  message.success(postData.value.likes.includes(currentUserId) ? '点赞成功' : '已取消点赞');
};

// 处理关注/取消关注
const handleFollow = async () => {
  if (currentUserId === 0) {
    message.error('请先登录');
    return;
  }

  try {
    followLoading.value = true;
    if (postData.value.author.isFollowed) {
      // 取消关注
      await articleApi.UNFOLLOW_AUTHOR_API(postData.value.author.id);
      postData.value.author.isFollowed = false;
      postData.value.author.followers--;
      message.success('已取消关注');
    } else {
      // 关注
      await articleApi.FOLLOW_AUTHOR_API(postData.value.author.id);
      postData.value.author.isFollowed = true;
      postData.value.author.followers++;
      message.success('关注成功');
    }
  } catch (error: any) {
    message.error(error.message);
  } finally {
    followLoading.value = false;
  }
};

// 获取媒体项的类名
const getMediaItemClass = (index: number, total: number) => {
  // 单个媒体项
  if (total === 1) return 'full-width';
  
  // 两个媒体项
  if (total === 2) return 'half-width';
  
  // 三个或更多媒体项
  if (total >= 3) {
    if (total === 3 && index === 2) return 'full-width-last';
    return 'third-width';
  }
  
  return '';
};
</script>

<style lang="less" scoped>
@import url('./post.less');

/* 点赞按钮激活效果 */
.active {
  color: #1890ff !important;
  /* 使用网站主题蓝色 */
  font-weight: 500;
}

.stat-item.clickable,
.action-item,
.action {
  transition: all 0.3s;

  &:hover {
    color: #1890ff;
  }
}

/* 回复操作样式 */
.reply-actions,
.hover-actions {

  .action-item,
  .action {
    cursor: pointer;
    margin-right: 16px;

    &:last-child {
      margin-right: 0;
    }
  }
}

/* 二级评论样式 */
.sub-comments-container {
  .sub-comment-item {
    position: relative;

    .hover-actions {
      position: absolute;
      right: 0;
      top: 0;
      display: flex;
      align-items: center;
    }
  }
}

/* 浮动按钮样式 */
.floating-buttons {
  position: fixed;
  bottom: 50px;
  right: 50px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;

  .float-btn {
    width: 45px;
    height: 45px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
  }
}

.post-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  min-height: 100vh;

  &.dark-theme {
    background: #141414;
    color: rgba(255, 255, 255, 0.85);

    .post-header {
      background: #1f1f1f;
      border-color: #303030;

      .post-title {
        .title-text {
          color: rgba(255, 255, 255, 0.85);
        }

        .title-tag {
          background: #2a2a2a;
          color: rgba(255, 255, 255, 0.65);
        }

        .title-badge {
          background: #2a2a2a;
          color: rgba(255, 255, 255, 0.65);
        }
      }

      .post-meta {
        .user-info {
          .info-content {
            .username {
              color: rgba(255, 255, 255, 0.85);
            }

            .post-time {
              color: rgba(255, 255, 255, 0.45);
            }
          }
        }
      }
    }

    .post-content {
      color: rgba(255, 255, 255, 0.65);
    }
  }

  .post-content {
    padding: 20px;
    line-height: 1.8;
    font-size: 16px;
    color: #333;

    .media-preview {
      margin-top: 16px;
      width: 100%;
      max-width: 800px;

      .media-grid {
        display: grid;
        gap: 8px;
        grid-template-columns: repeat(4, 1fr);
        
        .media-item {
          position: relative;
          width: 100%;
          
          &.full-width {
            grid-column: span 2;
            max-width: 400px;
          }
          
          &.half-width {
            grid-column: span 2;
          }
          
          &.third-width {
            grid-column: span 1;
          }
          
          &.full-width-last {
            grid-column: span 2;
          }
          
          .media-wrapper {
            position: relative;
            width: 100%;
            border-radius: 4px;
            overflow: hidden;
            aspect-ratio: 16/9;
            background: #000;
          }
        }
        
        .image-item .media-wrapper {
          :deep(.ant-image) {
            width: 100%;
            height: 100%;
            
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }
        
        .video-item .media-wrapper {
          .video-player {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
  }
}

.media-preview {
  margin-top: 16px;
  width: 100%;
  max-width: 800px;

  .media-grid {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(4, 1fr);
    
    .media-item {
      position: relative;
      width: 100%;
      
      &.full-width {
        grid-column: span 2;
        max-width: 400px;
      }
      
      &.half-width {
        grid-column: span 2;
      }
      
      &.third-width {
        grid-column: span 1;
      }
      
      &.full-width-last {
        grid-column: span 2;
      }
      
      .media-wrapper {
        position: relative;
        width: 100%;
        border-radius: 4px;
        overflow: hidden;
        aspect-ratio: 16/9;
        background: #000;
      }
    }
    
    .image-item .media-wrapper {
      :deep(.ant-image) {
        width: 100%;
        height: 100%;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
    
    .video-item .media-wrapper {
      .video-player {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}

/* 暗色模式样式 */
.dark-mode {
  .media-preview {
    .media-grid {
      .media-item .media-wrapper {
        background: #141414;
      }
    }
  }
}
</style>