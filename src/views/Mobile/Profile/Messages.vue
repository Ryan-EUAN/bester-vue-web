<template>
  <div class="user-messages">
    <van-nav-bar
      title="我的消息"
      left-arrow
      @click-left="goBack"
    />
    
    <van-tabs v-model:active="activeTab" sticky swipeable>
      <van-tab title="全部">
        <message-list
          :list="allMessages"
          :loading="loading"
          @refresh="loadMessages"
          @read="markAsRead"
          @delete="deleteMessage"
        />
      </van-tab>
      <van-tab title="通知">
        <message-list
          :list="notifications"
          :loading="loading" 
          @refresh="loadMessages"
          @read="markAsRead"
          @delete="deleteMessage"
        />
      </van-tab>
      <van-tab title="点赞">
        <message-list
          :list="likes"
          :loading="loading" 
          @refresh="loadMessages"
          @read="markAsRead"
          @delete="deleteMessage"
        />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import MessageList from '@/components/Mobile/MessageList.vue';

const router = useRouter();
const loading = ref(false);
const activeTab = ref(0);
const messages = ref<any[]>([]);

// 按类型过滤消息
const allMessages = computed(() => messages.value);

const notifications = computed(() => {
  return messages.value.filter(msg => msg.type === 'notification');
});

const likes = computed(() => {
  return messages.value.filter(msg => msg.type === 'like');
});

// 加载消息数据
const loadMessages = () => {
  loading.value = true;
  
  // 这里应该调用实际的API获取消息数据
  // 模拟数据加载
  setTimeout(() => {
    const mockMessages = [];
    
    // 模拟通知消息
    for (let i = 0; i < 5; i++) {
      mockMessages.push({
        id: `notification-${i + 1}`,
        type: 'notification',
        title: `系统通知 ${i + 1}`,
        content: `这是一条系统通知内容，告知您最新活动和平台公告信息...`,
        time: new Date(Date.now() - i * 7200000).toLocaleString(),
        isRead: i > 1,
        senderAvatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
      });
    }
    
    // 模拟点赞消息
    for (let i = 0; i < 8; i++) {
      mockMessages.push({
        id: `like-${i + 1}`,
        type: 'like',
        title: `用户${i + 10}点赞了您的${i % 2 === 0 ? '帖子' : '评论'}`,
        content: `帖子内容: "${i % 2 === 0 ? '这是帖子标题...' : '这是评论内容...'}"`,
        time: new Date(Date.now() - i * 5400000).toLocaleString(),
        isRead: i > 2,
        senderAvatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
      });
    }
    
    messages.value = mockMessages;
    loading.value = false;
  }, 1000);
};

// 标记消息为已读
const markAsRead = (message: any) => {
  // 这里应该调用实际的API标记消息为已读
  if (!message.isRead) {
    message.isRead = true;
    showToast('已标记为已读');
  }
};

// 删除消息
const deleteMessage = (id: string) => {
  showDialog({
    title: '删除消息',
    message: '确定要删除这条消息吗？',
    showCancelButton: true,
  }).then(() => {
    // 用户点击确认按钮
    messages.value = messages.value.filter(item => item.id !== id);
    showToast('已删除');
  });
};

// 返回上一页
const goBack = () => {
  router.back();
};

onMounted(() => {
  loadMessages();
});
</script>

<style lang="scss" scoped>
.user-messages {
  min-height: 100vh;
  background-color: #f7f8fa;
}
</style> 