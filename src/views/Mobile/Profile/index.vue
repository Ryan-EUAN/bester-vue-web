<template>
  <div class="mobile-profile">
    <!-- 用户信息头部 -->
    <div class="user-header">
      <div class="header-background"></div>

      <div class="user-info">
        <van-image round width="80" height="80" :src="userInfo.avatar" class="avatar" />
        <div v-if="userInfo.isLogin" class="user-detail">
          <div class="username">{{ userInfo.name }}</div>
          <div class="user-id">ID: {{ userInfo.id }}</div>
        </div>
        <div v-else class="user-detail not-login" @click="goToLogin">
          <div class="login-tip">点击登录</div>
          <div class="login-desc">登录后享受更多精彩服务</div>
        </div>
      </div>

      <!-- 数据统计 -->
      <div class="user-stats">
        <div class="stat-item" @click="goToFollows('following')">
          <div class="stat-value">{{ userInfo.following || 0 }}</div>
          <div class="stat-label">关注</div>
        </div>
        <div class="stat-item" @click="goToFollows('followers')">
          <div class="stat-value">{{ userInfo.followers || 0 }}</div>
          <div class="stat-label">粉丝</div>
        </div>
        <div class="stat-item" @click="goToMyPosts">
          <div class="stat-value">{{ userInfo.posts || 0 }}</div>
          <div class="stat-label">帖子</div>
        </div>
      </div>
    </div>

    <!-- 功能区域 -->
    <div class="function-section">
      <van-cell-group inset class="function-group">
        <van-cell v-for="item in mainFunctions" :key="item.id" :title="item.title" is-link :icon="item.icon"
          :to="item.path" class="function-cell" />
      </van-cell-group>

      <van-cell-group inset title="更多服务" class="function-group">
        <van-cell v-for="item in moreFunctions" :key="item.id" :title="item.title" is-link :icon="item.icon"
          :to="item.path" class="function-cell" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';

const router = useRouter();
const DEFAULT_AVATAR = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg';

// 用户信息
const userInfo = ref({
  isLogin: false,
  id: '',
  name: '',
  avatar: DEFAULT_AVATAR,
  followers: 0,
  following: 0,
  posts: 0
});

// 主要功能列表
const mainFunctions = [
  { id: 1, title: '个人资料', icon: 'contact', path: '/user/edit-profile' },
  { id: 2, title: '我的收藏', icon: 'star-o', path: '/user/favorites' },
  { id: 3, title: '浏览历史', icon: 'clock-o', path: '/user/history' },
  { id: 4, title: '我的消息', icon: 'comment-o', path: '/user/messages' },
  // { id: 5, title: '我的帖子', icon: 'records', path: '/user/posts' }
];

// 更多功能
const moreFunctions = [
  { id: 1, title: '实名认证', icon: 'idcard', path: '/user/verify' },
  { id: 2, title: '账号安全', icon: 'shield-o', path: '/user/security' },
  { id: 3, title: '隐私设置', icon: 'eye-o', path: '/user/privacy' },
  { id: 4, title: '帮助与反馈', icon: 'question-o', path: '/user/help' },
  { id: 5, title: '设置', icon: 'setting-o', path: '/user/settings' }
];

// 加载用户信息
const loadUserInfo = () => {
  const token = localStorage.getItem('token');
  const storedUserInfo = localStorage.getItem('userInfo');

  if (token && storedUserInfo) {
    try {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      userInfo.value = {
        isLogin: true,
        id: parsedUserInfo.id || '',
        name: parsedUserInfo.name || '用户',
        avatar: parsedUserInfo.avatar || DEFAULT_AVATAR,
        followers: parsedUserInfo.followers || 0,
        following: parsedUserInfo.following || 0,
        posts: parsedUserInfo.posts || 0
      };
    } catch (error) {
      console.error('解析用户信息失败:', error);
      resetUserInfo();
    }
  } else {
    resetUserInfo();
  }
};

// 重置用户信息
const resetUserInfo = () => {
  userInfo.value = {
    isLogin: false,
    id: '',
    name: '',
    avatar: DEFAULT_AVATAR,
    followers: 0,
    following: 0,
    posts: 0
  };
};

// 前往登录页
const goToLogin = () => {
  router.push('/auth/loginMobile');
};

// 前往关注/粉丝列表
const goToFollows = (type: 'following' | 'followers') => {
  if (!userInfo.value.isLogin) {
    goToLogin();
    return;
  }

  try {
    console.log(`正在跳转到${type === 'following' ? '关注' : '粉丝'}列表页面...`);
    router.push(`/user/${type}`);
  } catch (error) {
    console.error(`跳转到${type}页面失败:`, error);
    showToast(`跳转失败，请重试`);
  }
};

// 前往我的帖子
const goToMyPosts = () => {
  if (!userInfo.value.isLogin) {
    goToLogin();
    return;
  }
  router.push('/user/posts');
};

// 监听登录成功事件
const listenLoginEvent = () => {
  window.addEventListener('userInfoUpdated', loadUserInfo);
  window.addEventListener('loginSuccess', loadUserInfo);
};

// 组件挂载时加载用户信息并添加事件监听
onMounted(() => {
  loadUserInfo();
  listenLoginEvent();
});
</script>

<style lang="scss" scoped>
.mobile-profile {
  min-height: 100vh;
  background-color: #f7f8fa;

  .user-header {
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

        &.not-login {
          cursor: pointer;

          .login-tip {
            font-size: 18px;
            font-weight: 600;
            color: #323233;
          }

          .login-desc {
            font-size: 12px;
            color: #969799;
            margin-top: 4px;
          }
        }
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

  .function-section {
    padding: 0 0 60px;

    .function-group {
      margin-bottom: 12px;

      :deep(.van-cell-group__title) {
        font-size: 14px;
        color: #969799;
        padding: 16px 16px 8px;
      }

      .function-cell {
        :deep(.van-cell__title) {
          font-size: 15px;
          font-weight: 400;
        }

        :deep(.van-icon) {
          font-size: 18px;
          color: #1989fa;
        }
      }
    }
  }
}
</style>