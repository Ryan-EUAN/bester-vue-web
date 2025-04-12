<template>
  <div class="post-item" @click="$emit('click')">
    <div class="post-header">
      <div class="author-info">
        <van-image
          round
          width="40"
          height="40"
          :src="post.author.avatar"
          class="avatar"
        />
        <div class="author-detail">
          <div class="author-name">{{ post.author.name }}</div>
          <div class="publish-time">{{ post.publishTime }}</div>
        </div>
      </div>
      <div class="more-actions">
        <van-icon name="ellipsis" @click.stop="showActions" />
      </div>
    </div>
    
    <div class="post-content">
      <div class="post-title">{{ post.title }}</div>
      <div class="post-text">{{ post.content }}</div>
      
      <!-- 图片展示区域 -->
      <div v-if="post.images && post.images.length > 0" class="post-images">
        <van-image
          v-for="(image, index) in post.images"
          :key="index"
          fit="cover"
          :src="image"
          class="content-image"
        />
      </div>
      
      <!-- 标签区域 -->
      <div v-if="post.tags && post.tags.length > 0" class="post-tags">
        <span 
          v-for="(tag, index) in post.tags" 
          :key="index" 
          class="tag"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
    
    <div class="post-footer">
      <div class="action-item">
        <van-icon name="eye-o" />
        <span>{{ formatNumber(post.viewCount) }}</span>
      </div>
      <div class="action-item">
        <van-icon name="comment-o" />
        <span>{{ formatNumber(post.commentCount) }}</span>
      </div>
      <div class="action-item">
        <van-icon name="like-o" />
        <span>{{ formatNumber(post.likeCount) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { showToast, showDialog } from 'vant';

// 定义帖子类型
interface PostAuthor {
  id: number;
  name: string;
  avatar: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: PostAuthor;
  publishTime: string;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  tags?: string[];
  images?: string[];
}

defineProps<{
  post: Post;
}>();

defineEmits<{
  (e: 'click'): void;
}>();

// 格式化数字，大于1000显示为1k+
const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

// 显示操作菜单
const showActions = (event: Event) => {
  event.stopPropagation();
  // 使用Dialog替代ActionSheet
  showDialog({
    title: '帖子操作',
    message: '请选择您要进行的操作',
    showCancelButton: true,
    confirmButtonText: '收藏',
    cancelButtonText: '取消'
  }).then(() => {
    showToast('收藏成功');
  }).catch(() => {
    // 用户点击取消
  });
};
</script>

<style lang="scss" scoped>
.post-item {
  margin-bottom: 12px;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  .post-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    
    .author-info {
      display: flex;
      align-items: center;
      
      .avatar {
        margin-right: 10px;
      }
      
      .author-detail {
        .author-name {
          font-size: 14px;
          font-weight: 500;
          color: #323233;
        }
        
        .publish-time {
          font-size: 12px;
          color: #969799;
          margin-top: 2px;
        }
      }
    }
    
    .more-actions {
      color: #969799;
      padding: 4px;
    }
  }
  
  .post-content {
    .post-title {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
      margin-bottom: 8px;
      line-height: 1.4;
    }
    
    .post-text {
      font-size: 14px;
      color: #646566;
      line-height: 1.5;
      margin-bottom: 10px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .post-images {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -2px 10px;
      
      .content-image {
        width: calc(33.333% - 4px);
        height: 80px;
        margin: 2px;
        border-radius: 4px;
        object-fit: cover;
      }
    }
    
    .post-tags {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 10px;
      
      .tag {
        font-size: 12px;
        color: #1989fa;
        margin-right: 8px;
      }
    }
  }
  
  .post-footer {
    display: flex;
    border-top: 1px solid #f5f5f5;
    padding-top: 10px;
    
    .action-item {
      display: flex;
      align-items: center;
      margin-right: 20px;
      font-size: 14px;
      color: #969799;
      
      .van-icon {
        margin-right: 4px;
        font-size: 16px;
      }
    }
  }
}
</style> 