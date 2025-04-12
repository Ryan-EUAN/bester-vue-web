<template>
  <div class="blacklist">
    <van-nav-bar
      title="黑名单管理"
      left-arrow
      @click-left="goBack"
    />
    
    <div class="blacklist-header">
      <p class="blacklist-desc">将用户加入黑名单后，你将不再看到该用户的任何内容，该用户也无法向你发送私信或评论你的内容。</p>
    </div>
    
    <div class="user-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div v-if="blacklist.length === 0 && !loading && !refreshing" class="empty-tip">
            <van-empty description="暂无黑名单用户" />
          </div>
          
          <div v-for="user in blacklist" :key="user.id" class="user-item">
            <van-swipe-cell>
              <div class="user-card">
                <div class="user-info" @click="viewUser(user.id)">
                  <van-image
                    round
                    width="40"
                    height="40"
                    :src="user.avatar"
                  />
                  <div class="user-details">
                    <div class="username">{{ user.name }}</div>
                    <div class="user-desc">{{ user.description }}</div>
                  </div>
                </div>
                <van-button 
                  size="small" 
                  type="default" 
                  @click="removeFromBlacklist(user.id)"
                >
                  移出黑名单
                </van-button>
              </div>
              <template #right>
                <van-button 
                  square 
                  type="danger" 
                  text="删除" 
                  class="delete-button" 
                  @click="removeFromBlacklist(user.id)"
                />
              </template>
            </van-swipe-cell>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';

const router = useRouter();

// 黑名单列表
const blacklist = ref<any[]>([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);

// 页面加载时获取黑名单列表
onMounted(() => {
  loadBlacklist();
});

// 加载黑名单列表
const loadBlacklist = async () => {
  // 模拟API调用
  setTimeout(() => {
    // 模拟黑名单数据
    const mockData = [
      {
        id: '1',
        name: '用户1',
        avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        description: '这是一条用户简介，展示用户的个性签名'
      },
      {
        id: '2',
        name: '用户2',
        avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        description: '这是一条用户简介，展示用户的个性签名'
      },
      {
        id: '3',
        name: '用户3',
        avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        description: '这是一条用户简介，展示用户的个性签名'
      }
    ];
    
    blacklist.value = mockData;
    loading.value = false;
    finished.value = true;
  }, 1000);
};

// 下拉刷新
const onRefresh = () => {
  finished.value = false;
  
  // 重新加载数据
  setTimeout(() => {
    loadBlacklist();
    refreshing.value = false;
  }, 1000);
};

// 加载更多
const onLoad = () => {
  // 实际应用中应该分页加载
  setTimeout(() => {
    finished.value = true;
    loading.value = false;
  }, 1000);
};

// 查看用户资料
const viewUser = (userId: string) => {
  router.push(`/user/profile/${userId}`);
};

// 移出黑名单
const removeFromBlacklist = (userId: string) => {
  showDialog({
    title: '移出黑名单',
    message: '确定将该用户从黑名单中移除吗？移除后该用户将能够查看你的内容并与你互动。',
    showCancelButton: true,
  }).then(() => {
    // 模拟API调用
    blacklist.value = blacklist.value.filter(user => user.id !== userId);
    showToast('已将用户移出黑名单');
  }).catch(() => {
    // 用户取消操作
  });
};

// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<style lang="scss" scoped>
.blacklist {
  min-height: 100vh;
  background-color: #f7f8fa;
  
  .blacklist-header {
    padding: 16px;
    background-color: #fff;
    margin-bottom: 8px;
    
    .blacklist-desc {
      font-size: 14px;
      color: #969799;
      line-height: 1.5;
      margin: 0;
    }
  }
  
  .user-list {
    .empty-tip {
      padding: 40px 0;
    }
    
    .user-item {
      margin-bottom: 8px;
      
      .user-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background-color: #fff;
        
        .user-info {
          display: flex;
          align-items: center;
          flex: 1;
          
          .user-details {
            margin-left: 12px;
            
            .username {
              font-size: 15px;
              font-weight: 500;
              color: #323233;
              margin-bottom: 4px;
            }
            
            .user-desc {
              font-size: 12px;
              color: #969799;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              max-width: 200px;
            }
          }
        }
      }
      
      .delete-button {
        height: 100%;
      }
    }
  }
}
</style> 