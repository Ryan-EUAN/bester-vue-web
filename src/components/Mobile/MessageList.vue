<template>
  <div class="message-list-component">
    <van-pull-refresh v-model="refreshing" @refresh="handleRefresh">
      <van-empty v-if="isEmpty" description="暂无消息" />
      
      <div v-else class="message-list">
        <div 
          v-for="item in list" 
          :key="item.id" 
          class="message-item"
          :class="{ unread: !item.isRead }"
          @click="$emit('read', item)"
        >
          <div class="message-avatar">
            <van-image round width="40" height="40" :src="item.senderAvatar" />
            <div v-if="!item.isRead" class="unread-dot"></div>
          </div>
          
          <div class="message-content">
            <div class="message-title">{{ item.title }}</div>
            <div class="message-text">{{ item.content }}</div>
            <div class="message-time">{{ item.time }}</div>
          </div>
          
          <van-icon name="delete-o" class="delete-icon" @click.stop="$emit('delete', item.id)" />
        </div>
      </div>
      
      <van-loading v-if="loading" class="list-loading" size="24px">加载中...</van-loading>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, watch } from 'vue';

interface MessageItem {
  id: string;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  senderAvatar: string;
  type: string;
}

const props = defineProps<{
  list: MessageItem[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'read', message: MessageItem): void;
  (e: 'delete', id: string): void;
}>();

const refreshing = ref(false);
const isEmpty = computed(() => !props.loading && (!props.list || props.list.length === 0));

// 处理下拉刷新
const handleRefresh = () => {
  refreshing.value = true;
  emit('refresh');
  
  // 如果父组件没有在合理时间内设置loading为false，自动重置刷新状态
  setTimeout(() => {
    refreshing.value = false;
  }, 3000);
};

// 监听loading变化，当加载完成时关闭刷新状态
watch(() => props.loading, (newVal) => {
  if (!newVal) {
    refreshing.value = false;
  }
});
</script>

<style lang="scss" scoped>
.message-list-component {
  padding: 12px;
  
  .message-list {
    .message-item {
      display: flex;
      align-items: flex-start;
      background-color: #fff;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
      position: relative;
      
      &.unread {
        background-color: #f0f9ff;
      }
      
      .message-avatar {
        position: relative;
        margin-right: 12px;
        
        .unread-dot {
          position: absolute;
          top: 0;
          right: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #ee0a24;
        }
      }
      
      .message-content {
        flex: 1;
        min-width: 0;
        
        .message-title {
          font-size: 15px;
          font-weight: 500;
          color: #323233;
          margin-bottom: 4px;
        }
        
        .message-text {
          font-size: 13px;
          color: #646566;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .message-time {
          font-size: 12px;
          color: #969799;
        }
      }
      
      .delete-icon {
        margin-left: 8px;
        font-size: 18px;
        color: #969799;
        padding: 4px;
      }
    }
  }
  
  .list-loading {
    text-align: center;
    padding: 20px 0;
  }
}
</style> 