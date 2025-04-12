<template>
  <div class="chat-list">
    <van-nav-bar
      title="我的私信"
      left-arrow
      @click-left="goBack"
    >
      <template #right>
        <van-icon name="search" size="18" @click="showSearch = true" />
      </template>
    </van-nav-bar>
    
    <!-- 搜索框 -->
    <van-search
      v-model="searchText"
      placeholder="搜索聊天记录"
      v-show="showSearch"
      @cancel="cancelSearch"
      @search="onSearch"
      show-action
    />
    
    <!-- 聊天列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-empty v-if="!loading && chatList.length === 0" description="暂无私信" />
      
      <div v-else class="chat-list-content">
        <div 
          v-for="chat in chatList" 
          :key="chat.id" 
          class="chat-item"
          @click="enterChat(chat)"
        >
          <div class="avatar-wrapper">
            <van-badge :content="chat.unreadCount || ''" :max="99" v-if="chat.unreadCount > 0">
              <van-image
                round
                width="50"
                height="50"
                :src="chat.avatar"
              />
            </van-badge>
            <van-image
              v-else
              round
              width="50"
              height="50"
              :src="chat.avatar"
            />
          </div>
          
          <div class="chat-info">
            <div class="chat-header">
              <div class="chat-name">{{ chat.name }}</div>
              <div class="chat-time">{{ chat.lastTime }}</div>
            </div>
            <div class="chat-content">
              <div class="chat-message">{{ chat.lastMessage }}</div>
              <div class="chat-actions">
                <van-icon 
                  name="delete-o" 
                  class="delete-icon" 
                  @click.stop="confirmDeleteChat(chat)" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <van-loading v-if="loading" class="list-loading" size="24px">加载中...</van-loading>
    </van-pull-refresh>
    
    <!-- 底部工具栏 -->
    <van-action-bar>
      <van-action-bar-button 
        icon="chat-o" 
        text="发起新聊天" 
        type="primary" 
        @click="showNewChatPopup = true"
      />
    </van-action-bar>
    
    <!-- 发起新聊天弹出层 -->
    <van-popup 
      v-model:show="showNewChatPopup" 
      position="bottom" 
      round 
      :style="{ height: '60%' }"
    >
      <div class="new-chat-popup">
        <div class="popup-header">
          <div class="popup-title">发起新聊天</div>
          <van-icon name="cross" @click="showNewChatPopup = false" />
        </div>
        
        <van-search 
          v-model="searchUser" 
          placeholder="搜索用户" 
          @search="searchUsers"
        />
        
        <div class="user-list">
          <div v-if="searchUser && !searchResult.length" class="search-empty">
            未找到用户
          </div>
          
          <div 
            v-for="user in searchResult" 
            :key="user.id" 
            class="user-item"
            @click="startNewChat(user)"
          >
            <van-image
              round
              width="40"
              height="40"
              :src="user.avatar"
            />
            <div class="user-name">{{ user.name }}</div>
          </div>
          
          <div v-if="!searchUser" class="recent-title">最近联系人</div>
          
          <div v-if="!searchUser" class="user-list-content">
            <div 
              v-for="user in recentUsers" 
              :key="user.id" 
              class="user-item"
              @click="startNewChat(user)"
            >
              <van-image
                round
                width="40"
                height="40"
                :src="user.avatar"
              />
              <div class="user-name">{{ user.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';

const router = useRouter();
const loading = ref(false);
const refreshing = ref(false);
const showSearch = ref(false);
const searchText = ref('');
const showNewChatPopup = ref(false);
const searchUser = ref('');
const searchResult = ref<any[]>([]);
const chatList = ref<any[]>([]);
const recentUsers = ref<any[]>([]);

// 刷新聊天列表
const onRefresh = () => {
  loadChatList();
};

// 加载聊天列表
const loadChatList = () => {
  loading.value = true;
  
  // 这里应该调用实际的API获取聊天列表
  // 模拟数据加载
  setTimeout(() => {
    const mockChats = [];
    
    // 添加一些模拟聊天
    for (let i = 1; i <= 10; i++) {
      mockChats.push({
        id: `chat-${i}`,
        userId: i,
        name: `用户${i}`,
        avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        lastMessage: i % 3 === 0 ? '[图片]' : `这是最后一条消息内容 ${i}`,
        lastTime: formatChatTime(new Date(Date.now() - i * 3600000 * (i % 5 + 1))),
        unreadCount: i % 4 === 0 ? Math.floor(Math.random() * 10) + 1 : 0
      });
    }
    
    chatList.value = mockChats;
    loading.value = false;
    refreshing.value = false;
  }, 1000);
};

// 获取最近联系人
const loadRecentUsers = () => {
  // 这里应该调用实际的API获取最近联系人
  // 模拟数据
  setTimeout(() => {
    const users = [];
    
    for (let i = 1; i <= 8; i++) {
      users.push({
        id: i,
        name: `联系人${i}`,
        avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
      });
    }
    
    recentUsers.value = users;
  }, 500);
};

// 搜索聊天记录
const onSearch = () => {
  if (!searchText.value.trim()) {
    return;
  }
  
  // 这里应该调用实际的API搜索聊天记录
  showToast('搜索功能开发中');
};

// 取消搜索
const cancelSearch = () => {
  searchText.value = '';
  showSearch.value = false;
};

// 确认删除聊天
const confirmDeleteChat = (chat: any) => {
  showDialog({
    title: '删除聊天',
    message: `确定要删除与 "${chat.name}" 的聊天吗？`,
    showCancelButton: true,
  }).then(() => {
    deleteChat(chat.id);
  });
};

// 删除聊天
const deleteChat = (chatId: string) => {
  // 这里应该调用实际的API删除聊天
  chatList.value = chatList.value.filter(item => item.id !== chatId);
  showToast('已删除聊天');
};

// 进入聊天详情
const enterChat = (chat: any) => {
  router.push(`/chat/${chat.userId}`);
};

// 搜索用户
const searchUsers = () => {
  if (!searchUser.value.trim()) {
    searchResult.value = [];
    return;
  }
  
  // 这里应该调用实际的API搜索用户
  // 模拟搜索结果
  setTimeout(() => {
    const users = [];
    
    for (let i = 1; i <= 3; i++) {
      users.push({
        id: i + 100,
        name: `${searchUser.value}用户${i}`,
        avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
      });
    }
    
    searchResult.value = users;
  }, 500);
};

// 开始新聊天
const startNewChat = (user: any) => {
  // 关闭弹出层
  showNewChatPopup.value = false;
  
  // 跳转到聊天详情
  router.push(`/chat/${user.id}`);
};

// 格式化聊天时间
const formatChatTime = (date: Date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 24 * 60 * 60 * 1000;
  const dateTime = date.getTime();
  
  if (dateTime >= today) {
    // 今天
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } else if (dateTime >= yesterday) {
    // 昨天
    return '昨天';
  } else {
    // 更早
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

onMounted(() => {
  loadChatList();
  loadRecentUsers();
});
</script>

<style lang="scss" scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f8fa;
  
  .chat-list-content {
    padding: 0 12px;
    
    .chat-item {
      display: flex;
      align-items: center;
      background-color: #fff;
      margin-bottom: 12px;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      
      .avatar-wrapper {
        margin-right: 12px;
      }
      
      .chat-info {
        flex: 1;
        min-width: 0;
        
        .chat-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          
          .chat-name {
            font-size: 16px;
            font-weight: 500;
            color: #323233;
          }
          
          .chat-time {
            font-size: 12px;
            color: #969799;
            flex-shrink: 0;
          }
        }
        
        .chat-content {
          display: flex;
          align-items: center;
          
          .chat-message {
            flex: 1;
            font-size: 14px;
            color: #646566;
            margin-right: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .chat-actions {
            .delete-icon {
              font-size: 18px;
              color: #969799;
              padding: 4px;
            }
          }
        }
      }
    }
  }
  
  .list-loading {
    text-align: center;
    padding: 20px 0;
  }
  
  .new-chat-popup {
    padding: 16px;
    
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .popup-title {
        font-size: 16px;
        font-weight: 500;
        color: #323233;
      }
      
      .van-icon {
        font-size: 20px;
        color: #969799;
      }
    }
    
    .recent-title {
      font-size: 14px;
      color: #969799;
      margin: 16px 0 8px;
    }
    
    .user-list {
      margin-top: 16px;
      max-height: 70%;
      overflow-y: auto;
      
      .search-empty {
        text-align: center;
        padding: 32px 0;
        color: #969799;
      }
      
      .user-item {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f2f3f5;
        
        .user-name {
          margin-left: 12px;
          font-size: 15px;
          color: #323233;
        }
      }
    }
  }
}
</style> 