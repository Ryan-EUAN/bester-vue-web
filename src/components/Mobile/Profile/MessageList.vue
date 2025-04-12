<template>
  <div class="message-list-component">
    <van-pull-refresh v-model="refreshing" @refresh="handleRefresh">
      <van-empty v-if="!loading && messages.length === 0" description="暂无消息" />
      
      <div v-else class="message-list">
        <div 
          v-for="message in messages" 
          :key="message.id" 
          class="message-item"
          :class="{ unread: !message.isRead }"
          @click="handleMessageClick(message)"
        >
          <div class="message-avatar">
            <van-badge :dot="!message.isRead" position="top-right">
              <van-image
                round
                width="40"
                height="40"
                :src="message.from.avatar"
              />
            </van-badge>
          </div>
          
          <div class="message-content">
            <div class="message-header">
              <div class="message-title">{{ message.from.name }}</div>
              <div class="message-time">{{ message.time }}</div>
            </div>
            <div class="message-text">{{ message.content }}</div>
          </div>
          
          <van-icon 
            name="delete-o" 
            class="delete-icon" 
            @click.stop="$emit('delete', message)" 
          />
        </div>
      </div>
      
      <van-loading v-if="loading" class="list-loading" size="24px">加载中...</van-loading>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue';

const props = defineProps<{
  messages: any[];
  loading: boolean;
}>();

defineEmits<{
  (e: 'refresh'): void;
  (e: 'read', message: any): void;
  (e: 'delete', message: any): void;
}>();

const refreshing = ref(false);

// 处理下拉刷新
const handleRefresh = () => {
  refreshing.value = true;
  
  // 触发父组件刷新事件
  emit('refresh');
};

// 处理消息点击
const handleMessageClick = (message: any) => {
  if (!message.isRead) {
    emit('read', message);
  } else {
    // 对于已读消息，也可以触发相同的动作
    emit('read', message);
  }
};

const emit = defineEmits(['refresh', 'read', 'delete']);

// 监听loading变化，当加载完成时关闭刷新状态
watch(() => props.loading, (newVal) => {
  if (!newVal) {
    refreshing.value = false;
  }
});
</script>

<style lang="scss" scoped>
.message-list-component {
  padding: 12px 0;
  
  .message-list {
    padding: 0 12px;
    
    .message-item {
      display: flex;
      align-items: flex-start;
      background-color: #fff;
      margin-bottom: 12px;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      position: relative;
      
      &.unread {
        background-color: #f0f9ff;
      }
      
      .message-avatar {
        flex-shrink: 0;
        margin-right: 12px;
      }
      
      .message-content {
        flex: 1;
        min-width: 0;
        
        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          
          .message-title {
            font-size: 15px;
            font-weight: 500;
            color: #323233;
          }
          
          .message-time {
            font-size: 12px;
            color: #969799;
            margin-left: 8px;
            white-space: nowrap;
          }
        }
        
        .message-text {
          font-size: 14px;
          color: #646566;
          line-height: 1.5;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
      
      .delete-icon {
        position: absolute;
        right: 16px;
        bottom: 12px;
        font-size: 18px;
        color: #969799;
        padding: 4px;
      }
    }
  }
  
  .list-loading {
    text-align: center;
    padding: 12px 0;
  }
}
</style> 