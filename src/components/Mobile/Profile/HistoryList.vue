<template>
  <div class="history-list-component">
    <van-pull-refresh v-model="refreshing" @refresh="handleRefresh">
      <van-empty v-if="!loading && list.length === 0" description="暂无浏览记录" />
      
      <div v-else class="history-list">
        <div 
          v-for="item in list" 
          :key="item.id" 
          class="history-item"
          @click="$emit('view-item', item)"
        >
          <div class="history-header">
            <div class="author-info">
              <van-image
                round
                width="20"
                height="20"
                :src="item.authorAvatar"
              />
              <span class="author-name">{{ item.authorName }}</span>
            </div>
            <div class="view-time">{{ item.viewTime }}</div>
          </div>
          
          <div class="history-content">
            <div class="item-title">
              <van-tag plain type="primary" class="item-type">{{ item.type === 'post' ? '帖子' : '文章' }}</van-tag>
              {{ item.title }}
            </div>
            <div class="item-text">{{ item.content }}</div>
          </div>
          
          <div class="history-footer">
            <van-button 
              size="mini" 
              type="default" 
              plain
              class="delete-btn"
              @click.stop="$emit('delete-item', item.id)"
            >删除</van-button>
          </div>
        </div>
      </div>
      
      <van-loading v-if="loading" class="list-loading" size="24px">加载中...</van-loading>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue';

const props = defineProps<{
  list: any[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'view-item', item: any): void;
  (e: 'delete-item', id: number): void;
}>();

const refreshing = ref(false);

// 处理下拉刷新
const handleRefresh = () => {
  refreshing.value = true;
  // 触发父组件刷新事件
  setTimeout(() => {
    refreshing.value = false;
  }, 300);
  
  // 触发父组件刷新事件
  emit('refresh');
};

// 监听loading变化，当加载完成时关闭刷新状态
watch(() => props.loading, (newVal) => {
  if (!newVal) {
    refreshing.value = false;
  }
});
</script>

<style lang="scss" scoped>
.history-list-component {
  padding: 12px 0;
  
  .history-list {
    padding: 0 12px;
    
    .history-item {
      background-color: #fff;
      margin-bottom: 12px;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      
      .history-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        
        .author-info {
          display: flex;
          align-items: center;
          
          .author-name {
            font-size: 13px;
            color: #646566;
            margin-left: 6px;
          }
        }
        
        .view-time {
          font-size: 12px;
          color: #969799;
        }
      }
      
      .history-content {
        margin-bottom: 12px;
        
        .item-title {
          font-size: 15px;
          font-weight: 500;
          color: #323233;
          margin-bottom: 6px;
          line-height: 1.4;
          
          .item-type {
            margin-right: 6px;
          }
        }
        
        .item-text {
          font-size: 13px;
          color: #646566;
          line-height: 1.5;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
      
      .history-footer {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
  
  .list-loading {
    text-align: center;
    padding: 12px 0;
  }
}
</style> 