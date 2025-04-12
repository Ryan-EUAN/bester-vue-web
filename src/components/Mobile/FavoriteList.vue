<template>
  <div class="favorite-list-component">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-empty v-if="!loading && (!list || list.length === 0)" description="暂无收藏内容" />
      
      <div v-else class="favorite-list">
        <div 
          v-for="item in list" 
          :key="item.id" 
          class="favorite-item"
          @click="$emit('view', item)"
        >
          <div class="item-main">
            <div class="item-cover" v-if="item.cover">
              <van-image :src="item.cover" fit="cover" />
            </div>
            
            <div class="item-content" :class="{ 'no-cover': !item.cover }">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-desc">{{ item.description }}</div>
              <div class="item-info">
                <span class="item-type">{{ getTypeName(item.type) }}</span>
                <span class="item-time">{{ item.time }}</span>
              </div>
            </div>
          </div>
          
          <div class="item-actions">
            <van-icon 
              name="delete-o" 
              class="action-icon" 
              @click.stop="$emit('cancel', item)" 
            />
          </div>
        </div>
      </div>
      
      <van-loading v-if="loading" class="list-loading" size="24px">加载中...</van-loading>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

interface FavoriteItem {
  id: string;
  title: string;
  description: string;
  type: string;
  cover?: string;
  time: string;
  url: string;
}

defineProps<{
  list: FavoriteItem[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'view', item: FavoriteItem): void;
  (e: 'cancel', item: FavoriteItem): void;
}>();

const refreshing = ref(false);

const onRefresh = () => {
  refreshing.value = true;
  emit('refresh');
  setTimeout(() => {
    refreshing.value = false;
  }, 3000);
};

const getTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    article: '文章',
    post: '帖子',
    video: '视频'
  };
  return typeMap[type] || '内容';
};
</script>

<style lang="scss" scoped>
.favorite-list-component {
  padding: 12px;
  
  .favorite-list {
    .favorite-item {
      display: flex;
      justify-content: space-between;
      background-color: #fff;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
      
      .item-main {
        display: flex;
        flex: 1;
        overflow: hidden;
        
        .item-cover {
          width: 80px;
          height: 80px;
          margin-right: 12px;
          flex-shrink: 0;
          border-radius: 4px;
          overflow: hidden;
          
          .van-image {
            width: 100%;
            height: 100%;
          }
        }
        
        .item-content {
          flex: 1;
          min-width: 0;
          
          &.no-cover {
            width: 100%;
          }
          
          .item-title {
            font-size: 15px;
            font-weight: 500;
            color: #323233;
            margin-bottom: 6px;
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          
          .item-desc {
            font-size: 13px;
            color: #646566;
            margin-bottom: 6px;
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          
          .item-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #969799;
            
            .item-type {
              padding: 2px 6px;
              background-color: #f2f3f5;
              border-radius: 4px;
            }
          }
        }
      }
      
      .item-actions {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        
        .action-icon {
          padding: 6px;
          font-size: 18px;
          color: #969799;
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