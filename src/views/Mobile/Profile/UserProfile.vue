<template>
  <div class="user-profile">
    <van-nav-bar
      title="用户主页"
      left-arrow
      @click-left="goBack"
    />
    
    <div class="profile-header">
      <div class="header-background"></div>
      
      <div class="user-info">
        <van-image
          round
          width="80"
          height="80"
          :src="userInfo.avatar"
          class="avatar"
        />
        
        <div class="user-detail">
          <div class="username">{{ userInfo.name }}</div>
          <div class="user-id">ID: {{ userInfo.id }}</div>
        </div>
        
        <div class="follow-action">
          <van-button 
            size="small" 
            :type="userInfo.isFollowed ? 'default' : 'primary'" 
            :plain="userInfo.isFollowed"
            @click="handleFollow"
          >
            {{ userInfo.isFollowed ? '已关注' : '关注' }}
          </van-button>
        </div>
      </div>
      
      <!-- 数据统计 -->
      <div class="user-stats">
        <div class="stat-item" @click="goToFollows">
          <div class="stat-value">{{ userInfo.following }}</div>
          <div class="stat-label">关注</div>
        </div>
        <div class="stat-item" @click="goToFollows">
          <div class="stat-value">{{ userInfo.followers }}</div>
          <div class="stat-label">粉丝</div>
        </div>
        <div class="stat-item" @click="goToUserPosts">
          <div class="stat-value">{{ userInfo.posts }}</div>
          <div class="stat-label">帖子</div>
        </div>
      </div>
    </div>
    
    <!-- 个人简介 -->
    <div class="user-bio-section">
      <h3 class="section-title">个人简介</h3>
      <p class="bio-text">{{ userInfo.bio || '这个人很懒，什么都没有留下...' }}</p>
    </div>
    
    <!-- 用户帖子列表 -->
    <div class="user-posts-section">
      <h3 class="section-title">发布的帖子</h3>
      
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-empty v-if="!loading && posts.length === 0" description="暂无帖子" />
        
        <div v-else class="posts-list">
          <div v-for="post in posts" :key="post.id" class="post-item" @click="viewPost(post.id)">
            <div class="post-title">{{ post.title }}</div>
            <div class="post-content">{{ post.content }}</div>
            <div class="post-footer">
              <span class="publish-time">{{ post.publishTime }}</span>
              <div class="action-icons">
                <span class="icon-item">
                  <van-icon name="eye-o" />
                  <span>{{ post.viewCount }}</span>
                </span>
                <span class="icon-item">
                  <van-icon name="comment-o" />
                  <span>{{ post.commentCount }}</span>
                </span>
                <span class="icon-item">
                  <van-icon name="like-o" />
                  <span>{{ post.likeCount }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';

const router = useRouter();
const route = useRoute();
const userId = ref(route.params.id);

const loading = ref(false);
const refreshing = ref(false);

// 用户信息
const userInfo = ref({
  id: userId.value,
  name: '加载中...',
  avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
  bio: '',
  isFollowed: false,
  following: 0,
  followers: 0,
  posts: 0
});

// 用户帖子列表
const posts = ref<any[]>([]);

// 加载用户信息
const loadUserInfo = async () => {
  try {
    // 这里应该调用实际的API获取用户信息
    // 模拟API请求
    setTimeout(() => {
      userInfo.value = {
        id: userId.value,
        name: `用户${userId.value}`,
        avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        bio: userId.value as string === '1' ? '这是我的个人简介，这里有一些我的基本信息和兴趣爱好...' : '',
        isFollowed: Math.random() > 0.5,
        following: Math.floor(Math.random() * 100),
        followers: Math.floor(Math.random() * 200),
        posts: Math.floor(Math.random() * 50)
      };
    }, 500);
  } catch (error) {
    console.error('加载用户信息失败:', error);
    showToast('加载用户信息失败');
  }
};

// 加载用户帖子
const loadUserPosts = async () => {
  loading.value = true;
  try {
    // 这里应该调用实际的API获取用户帖子
    // 模拟API请求
    setTimeout(() => {
      posts.value = Array(5).fill(0).map((_, index) => ({
        id: index + 1,
        title: `${userInfo.value.name}的帖子 ${index + 1}`,
        content: '这是帖子内容摘要，展示部分文字内容...',
        publishTime: new Date(Date.now() - index * 86400000).toLocaleString(),
        viewCount: Math.floor(Math.random() * 1000),
        commentCount: Math.floor(Math.random() * 100),
        likeCount: Math.floor(Math.random() * 50)
      }));
      loading.value = false;
      refreshing.value = false;
    }, 1000);
  } catch (error) {
    console.error('加载用户帖子失败:', error);
    showToast('加载帖子失败');
    loading.value = false;
    refreshing.value = false;
  }
};

// 关注/取消关注
const handleFollow = () => {
  // 这里应该调用实际的API处理关注/取消关注
  userInfo.value.isFollowed = !userInfo.value.isFollowed;
  
  if (userInfo.value.isFollowed) {
    userInfo.value.followers++;
    showToast('已关注');
  } else {
    userInfo.value.followers--;
    showToast('已取消关注');
  }
};

// 查看用户关注/粉丝列表
const goToFollows = () => {
  // 这里可以添加跳转逻辑
  showToast('功能开发中');
};

// 查看用户所有帖子
const goToUserPosts = () => {
  // 这里可以添加跳转逻辑
  showToast('功能开发中');
};

// 查看帖子详情
const viewPost = (postId: number) => {
  router.push(`/post/${postId}`);
};

// 下拉刷新
const onRefresh = () => {
  loadUserInfo();
  loadUserPosts();
};

// 返回上一页
const goBack = () => {
  router.back();
};

onMounted(() => {
  loadUserInfo();
  loadUserPosts();
});
</script>

<style lang="scss" scoped>
.user-profile {
  min-height: 100vh;
  background-color: #f7f8fa;
  
  .profile-header {
    position: relative;
    background-color: #fff;
    padding-bottom: 16px;
    margin-bottom: 12px;
    
    .header-background {
      height: 120px;
      background: linear-gradient(135deg, #1989fa, #39a9fc);
    }
    
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: -40px;
      position: relative;
      
      .avatar {
        border: 2px solid #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .user-detail {
        margin-top: 12px;
        text-align: center;
        
        .username {
          font-size: 18px;
          font-weight: 600;
          color: #323233;
        }
        
        .user-id {
          font-size: 12px;
          color: #969799;
          margin-top: 4px;
        }
      }
      
      .follow-action {
        margin-top: 12px;
      }
    }
    
    .user-stats {
      display: flex;
      margin-top: 16px;
      
      .stat-item {
        flex: 1;
        text-align: center;
        padding: 8px 0;
        position: relative;
        
        &:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 25%;
          height: 50%;
          width: 1px;
          background-color: #ebedf0;
        }
        
        .stat-value {
          font-size: 18px;
          font-weight: 500;
          color: #323233;
        }
        
        .stat-label {
          font-size: 12px;
          color: #969799;
          margin-top: 4px;
        }
      }
    }
  }
  
  .user-bio-section, .user-posts-section {
    background-color: #fff;
    padding: 16px;
    margin-bottom: 12px;
    
    .section-title {
      margin: 0 0 12px;
      font-size: 16px;
      font-weight: 500;
      color: #323233;
    }
    
    .bio-text {
      margin: 0;
      font-size: 14px;
      color: #646566;
      line-height: 1.5;
    }
  }
  
  .user-posts-section {
    padding-bottom: 0;
    
    .posts-list {
      .post-item {
        padding: 16px;
        border-bottom: 1px solid #f5f5f5;
        
        &:last-child {
          border-bottom: none;
        }
        
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
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .post-footer {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #969799;
          
          .action-icons {
            display: flex;
            
            .icon-item {
              margin-left: 12px;
              display: flex;
              align-items: center;
              
              .van-icon {
                margin-right: 4px;
                font-size: 14px;
              }
            }
          }
        }
      }
    }
  }
}
</style> 