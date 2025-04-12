<template>
  <div class="post-list">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-empty v-if="!loading && posts.length === 0" description="暂无帖子" />
      
      <div v-else class="posts-container">
        <div v-for="post in posts" :key="post.id" class="post-item" @click="viewPost(post.id)">
          <div class="post-title">{{ post.title }}</div>
          <div class="post-content">{{ post.content }}</div>
          <div class="post-info">
            <span class="post-date">{{ post.createdAt }}</span>
            <div class="post-stats">
              <span class="stat-item">
                <van-icon name="eye-o" />
                {{ post.viewCount }}
              </span>
              <span class="stat-item">
                <van-icon name="comment-o" />
                {{ post.commentCount }}
              </span>
              <span class="stat-item">
                <van-icon name="like-o" />
                {{ post.likeCount }}
              </span>
            </div>
          </div>
          
          <div v-if="post.status === 'draft'" class="post-status draft">草稿</div>
        </div>
      </div>
      
      <van-loading v-if="loading" class="list-loading" />
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

defineProps<{
  posts: any[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const router = useRouter();
const refreshing = ref(false);

// 查看帖子详情
const viewPost = (id: number) => {
  router.push(`/post/${id}`);
};

// 下拉刷新
const onRefresh = () => {
  emit('refresh');
  setTimeout(() => {
    refreshing.value = false;
  }, 1000);
};
</script>

<style lang="scss" scoped>
.post-list {
  padding: 12px;
  
  .posts-container {
    .post-item {
      position: relative;
      background-color: #fff;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      
      .post-title {
        font-size: 16px;
        font-weight: 500;
        color: #323233;
        margin-bottom: 8px;
      }
      
      .post-content {
        font-size: 14px;
        color: #646566;
        margin-bottom: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .post-info {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #969799;
        
        .post-date {
          flex-shrink: 0;
        }
        
        .post-stats {
          display: flex;
          
          .stat-item {
            margin-left: 12px;
            display: flex;
            align-items: center;
            
            .van-icon {
              font-size: 14px;
              margin-right: 2px;
            }
          }
        }
      }
      
      .post-status {
        position: absolute;
        top: 16px;
        right: 16px;
        padding: 2px 6px;
        font-size: 10px;
        border-radius: 4px;
        
        &.draft {
          background-color: #ffe9e9;
          color: #ee0a24;
        }
      }
    }
  }
  
  .list-loading {
    padding: 20px 0;
    text-align: center;
  }
}
</style> 