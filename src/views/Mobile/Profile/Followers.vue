<template>
  <div class="user-followers">
    <van-nav-bar
      title="我的粉丝"
      left-arrow
      @click-left="goBack"
    />
    
    <van-search
      v-model="searchText"
      placeholder="搜索粉丝用户"
      shape="round"
      @search="onSearch"
    />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-empty v-if="!loading && followersList.length === 0" description="暂无粉丝" />
      
      <div v-else class="followers-list">
        <div 
          v-for="item in followersList" 
          :key="item.id" 
          class="user-item"
          @click="goToUserProfile(item.id)"
        >
          <van-image
            round
            width="50"
            height="50"
            :src="item.avatar || defaultAvatar"
            class="avatar"
            @error="onImageError"
          />
          
          <div class="user-info">
            <div class="username">{{ item.name }}</div>
            <div class="follow-time">关注于 {{ item.followTime }}</div>
          </div>
          
          <van-button 
            size="small" 
            :type="item.isFollowed ? 'default' : 'primary'" 
            :plain="item.isFollowed"
            class="follow-btn"
            @click.stop="handleFollow(item)"
          >
            {{ item.isFollowed ? '已关注' : '关注' }}
          </van-button>
        </div>
      </div>
      
      <van-loading v-if="loading" class="list-loading" size="24px">加载中...</van-loading>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';

const router = useRouter();
const loading = ref(false);
const refreshing = ref(false);
const searchText = ref('');
const followersList = ref<any[]>([]);
const defaultAvatar = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg';

// 加载粉丝数据
const loadFollowersData = (isRefresh = false) => {
  loading.value = true;
  
  try {
    // 这里应该调用实际的API获取粉丝数据
    // 模拟数据加载
    setTimeout(() => {
      const mockUsers = Array(15).fill(0).map((_, index) => ({
        id: index + 100,
        name: `粉丝${index + 1}`,
        avatar: `https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg`,
        isFollowed: index % 3 === 0, // 部分已关注回
        followTime: new Date(Date.now() - index * 86400000 * 2).toLocaleString()
      }));
      
      if (searchText.value) {
        followersList.value = mockUsers.filter(user => 
          user.name.includes(searchText.value)
        );
      } else {
        followersList.value = mockUsers;
      }
      
      loading.value = false;
      refreshing.value = false;
    }, 1000);
  } catch (error) {
    console.error('加载粉丝数据失败:', error);
    showToast('加载失败，请重试');
    loading.value = false;
    refreshing.value = false;
  }
};

// 搜索用户
const onSearch = () => {
  loadFollowersData();
};

// 下拉刷新
const onRefresh = () => {
  loadFollowersData(true);
};

// 处理关注/取消关注
const handleFollow = (user: any) => {
  try {
    // 这里应该调用实际的API处理关注/取消关注
    user.isFollowed = !user.isFollowed;
    
    if (user.isFollowed) {
      showToast('已关注');
    } else {
      showToast('已取消关注');
    }
  } catch (error) {
    console.error('关注操作失败:', error);
    showToast('操作失败，请重试');
  }
};

// 处理图片加载错误
const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.src = defaultAvatar;
  }
};

// 前往用户主页
const goToUserProfile = (userId: number) => {
  router.push(`/user/profile/${userId}`);
};

// 返回上一页
const goBack = () => {
  router.back();
};

onMounted(() => {
  loadFollowersData();
});
</script>

<style lang="scss" scoped>
.user-followers {
  min-height: 100vh;
  background-color: #f7f8fa;
  
  .followers-list {
    padding: 0 12px;
    
    .user-item {
      display: flex;
      align-items: center;
      background-color: #fff;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      
      .avatar {
        flex-shrink: 0;
        margin-right: 12px;
      }
      
      .user-info {
        flex: 1;
        min-width: 0;
        
        .username {
          font-size: 15px;
          font-weight: 500;
          color: #323233;
          margin-bottom: 4px;
        }
        
        .follow-time {
          font-size: 12px;
          color: #969799;
        }
      }
      
      .follow-btn {
        flex-shrink: 0;
        margin-left: 8px;
      }
    }
  }
  
  .list-loading {
    padding: 20px 0;
    text-align: center;
  }
}
</style> 