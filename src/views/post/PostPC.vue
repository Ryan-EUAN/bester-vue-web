<template>
  <div class="post-container">
    <!-- 左侧内容区 -->
    <div class="post-main">
      <!-- 帖子头部信息 -->
      <div class="post-header">
        <div class="post-title">
          <span class="title-tag">[插件]</span>
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

      <!-- 帖子内容 -->
      <div class="post-content">
        <p>{{ postData.content }}</p>
        <div v-if="postData.images.length > 0" class="image-container">
          <img v-for="(image, index) in postData.images" :key="index" :src="image" alt="帖子图片" />
        </div>
      </div>

      <!-- 帖子统计信息 -->
      <div class="post-stats">
        <div class="stat-item">
          <eye-outlined />
          <span>{{ postData.reposts }} 次转发</span>
        </div>
        <div class="stat-item">
          <message-outlined />
          <span>{{ postData.comments.length }} 条评论</span>
        </div>
        <div class="stat-item clickable" @click="handlePostLike">
          <like-outlined :class="{ active: postData.likes.includes(currentUserId) }" />
          <span>{{ postData.likes.length }} 次点赞</span>
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
                    <span>{{ reply.likes }}</span>
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
            <span class="value">{{ postData.author.posts }}</span>
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
                  <span>{{ comment.likes || 0 }}</span>
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
import postApi from '@/services/post';
import type { PostData, Reply, SubComment } from '@/types/post';
import router from '@/router';

const currentUserId = JSON.parse(localStorage.getItem('userInfo') || '{}').id || 0;
const postData = ref<PostData>({
  id: '',
  title: '',
  content: '',
  time: '',
  author: {
    id: 0,
    name: '',
    avatar: '',
    followers: 0,
    following: 0,
    posts: 0
  },
  likes: [],
  comments: [],
  reposts: 0,
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

// 加载回复列表
const loadReplies = async () => {
  // try {
  //   loading.value = true;
  //   const res = await postApi.GET_POST_REPLIES_API(postData.value.id, {
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
  //   await postApi.CREATE_REPLY_API(postData.value.id, {
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
  // try {
  //   if (reply.isLiked) {
  //     await postApi.UNLIKE_REPLY_API(reply.id);
  //   } else {
  //     await postApi.LIKE_REPLY_API(reply.id);
  //   }
  //   reply.isLiked = !reply.isLiked;
  //   reply.likes += reply.isLiked ? 1 : -1;
  // } catch (error) {
  //   message.error('操作失败');
  // }
};

// 处理回复评论
// const handleReplyToComment = (reply: Reply) => {
//   currentReplyTo.value = {
//     id: reply.id,
//     username: reply.username
//   };
//   replyContent.value = `@${reply.username} `;
//   // 滚动到回复框
//   document.querySelector('.post-reply')?.scrollIntoView({ behavior: 'smooth' });
// };

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
  //   await postApi.CREATE_SUB_REPLY_API(currentReply.value!.id, {
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
const loadSubComments = async (replyId: number) => {
  // try {
  //   const res = await postApi.GET_SUB_COMMENTS_API(replyId, {
  //     page: 1,
  //     size: 100 // 二级评论一般较少，可以一次性加载
  //   });
  //   if (currentReply.value) {
  //     currentReply.value.subComments = res.data.list;
  //   }
  // } catch (error) {
  //   message.error('加载评论失败');
  // }
};

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
  const postId = String(route.query.id);
  if (!postId) {
    message.error('帖子不存在');
    router.push("/")
    return;
  }
  try {
    const response = await postApi.GET_POST_DETAIL_API(postId);
    if (response.code !== 200) {
      message.error(response.message || '帖子不存在');
      router.push("/")
      return;
    }
    console.log('结果', response.data);
    postData.value = response.data;
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    message.error('获取帖子详情失败');
    router.push("/")
  }
});

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
  try {
    if (postData.value.likes.includes(currentUserId)) {
      await postApi.UNLIKE_POST_API(postData.value.id);
      postData.value.likes = postData.value.likes.filter(id => id !== currentUserId);
    } else {
      await postApi.LIKE_POST_API(postData.value.id);
      postData.value.likes.push(currentUserId);
    }
    message.success(postData.value.likes.includes(currentUserId) ? '点赞成功' : '已取消点赞');
  } catch (err) {
    console.error('点赞操作失败:', err);
    message.error('操作失败，请稍后重试');
  }
};
</script>

<style lang="less" scoped>
.post-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  gap: 20px;
}

.post-main {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.post-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;

  .post-title {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 16px;

    .title-tag {
      color: #1890ff;
      margin-right: 8px;
    }

    .title-badge {
      font-size: 12px;
      color: #999;
      margin-left: 12px;
      cursor: pointer;

      &:hover {
        color: #1890ff;
      }
    }
  }

  .post-meta {
    padding: 16px 0;

    .user-info {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      .info-content {
        .username {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;

          .role-icon {
            color: #1890ff;
            font-size: 14px;
          }

          .role-text {
            color: #1890ff;
            font-size: 12px;
          }
        }

        .post-time {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
      }
    }
  }
}

.post-content {
  padding: 20px;
  font-size: 14px;
  line-height: 1.6;

  .image-container {
    margin-top: 16px;

    img {
      max-width: 100%;
      border-radius: 4px;
    }
  }
}

.post-stats {
  display: flex;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: 24px;
    color: #666;
    font-size: 14px;

    .anticon {
      font-size: 16px;
    }

    &.clickable {
      cursor: pointer;

      &:hover {
        color: #1890ff;
      }
    }
  }
}

.post-reply {
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fff;

  .reply-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .reply-title {
      font-size: 16px;
      font-weight: 500;
    }

    .reply-tools {
      display: flex;
      gap: 16px;

      .tool-icon {
        font-size: 18px;
        color: #666;
        cursor: pointer;

        &:hover {
          color: #1890ff;
        }
      }
    }
  }

  .reply-content {
    .reply-to {
      margin-bottom: 8px;
      padding: 8px 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      font-size: 14px;
      color: #666;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .close-icon {
        cursor: pointer;

        &:hover {
          color: #1890ff;
        }
      }
    }

    .ant-textarea {
      border-radius: 4px;
      resize: none;
      font-size: 14px;

      &:hover,
      &:focus {
        border-color: #1890ff;
      }
    }

    .reply-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;

      .word-count {
        color: #999;
        font-size: 12px;
      }
    }
  }
}

.reply-list {
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .title {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .reply-items {
    .reply-item {
      padding: 16px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .reply-user {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;

        .user-info {
          .username {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 4px;
          }

          .reply-time {
            font-size: 12px;
            color: #999;
          }
        }
      }

      .reply-body {
        margin-left: 52px;

        .reply-text {
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .reply-actions {
          display: flex;
          gap: 16px;

          .action-item {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #666;
            cursor: pointer;
            font-size: 12px;

            &:hover {
              color: #1890ff;
            }

            .anticon {
              font-size: 14px;

              &.active {
                color: #1890ff;
              }
            }
          }
        }
      }
    }
  }
}

.post-sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .author-card {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .author-header {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;

      .author-info {
        .author-name {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .author-title {
          font-size: 12px;
          color: #666;
        }
      }
    }

    .author-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;

      .stat-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .label {
          color: #666;
          font-size: 12px;
        }

        .value {
          color: #333;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }

  .stat-card {
    margin-top: 0;
  }
}

.sub-comments-container {
  .original-comment {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 16px;

    .comment-header {
      margin-bottom: 8px;

      .username {
        font-weight: 500;
        margin-right: 12px;
      }

      .time {
        color: #999;
        font-size: 12px;
      }
    }

    .comment-content {
      font-size: 14px;
      line-height: 1.6;
    }
  }

  .sub-comment-input {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    .reply-to {
      margin-bottom: 8px;
      padding: 8px 12px;
      background-color: #fff;
      border-radius: 4px;
      font-size: 14px;
      color: #666;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .close-icon {
        cursor: pointer;

        &:hover {
          color: #1890ff;
        }
      }
    }

    .ant-textarea {
      margin-bottom: 12px;
      background-color: #fff;
      border-radius: 4px;
      resize: none;
      font-size: 14px;

      &:hover,
      &:focus {
        border-color: #1890ff;
      }
    }

    .input-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .word-count {
        color: #999;
        font-size: 12px;
      }
    }
  }

  .sub-comments-list {
    .sub-comment-item {
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .comment-header {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        .username {
          font-weight: 500;
          margin-right: 12px;
        }

        .time {
          color: #999;
          font-size: 12px;
        }

        .hover-actions {
          margin-left: auto;
          display: flex;
          gap: 16px;

          .action {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #666;
            cursor: pointer;
            font-size: 12px;

            &:hover {
              color: #1890ff;
            }

            .anticon {
              font-size: 14px;

              &.active {
                color: #1890ff;
              }
            }
          }
        }
      }

      .comment-content {
        font-size: 14px;
        line-height: 1.6;
        color: #333;
        padding-right: 16px;

        .reply-to-text {
          color: #1890ff;
          margin-right: 4px;
        }
      }
    }
  }
}

// 优化弹窗整体样式
:deep(.ant-modal-content) {
  .ant-modal-header {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px;
    margin-bottom: 0;

    .ant-modal-title {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .ant-modal-body {
    padding: 20px 24px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .ant-modal-close {
    top: 16px;
    right: 16px;
  }
}
</style>