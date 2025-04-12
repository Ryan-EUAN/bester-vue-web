<template>
  <div class="user-favorites">
    <van-nav-bar
      title="我的收藏"
      left-arrow
      @click-left="goBack"
    />
    
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="全部">
        <favorite-list
          :list="favoriteList"
          :loading="loading"
          @refresh="loadFavorites"
          @view="viewItem"
          @cancel="confirmCancelFavorite"
        />
      </van-tab>
      <van-tab title="文章">
        <favorite-list
          :list="articleList"
          :loading="loading"
          @refresh="loadFavorites"
          @view="viewItem"
          @cancel="confirmCancelFavorite"
        />
      </van-tab>
      <van-tab title="帖子">
        <favorite-list
          :list="postList"
          :loading="loading"
          @refresh="loadFavorites"
          @view="viewItem"
          @cancel="confirmCancelFavorite"
        />
      </van-tab>
      <van-tab title="视频">
        <favorite-list
          :list="videoList"
          :loading="loading"
          @refresh="loadFavorites"
          @view="viewItem"
          @cancel="confirmCancelFavorite"
        />
      </van-tab>
    </van-tabs>
    
    <van-empty v-if="!loading && favoriteList.length === 0" description="暂无收藏内容" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';

const router = useRouter();
const loading = ref(false);
const activeTab = ref(0);
const favoriteList = ref<any[]>([]);

// 使用现有组件渲染收藏列表
const FavoriteList = {
  props: {
    list: Array,
    loading: Boolean
  },
  emits: ['refresh', 'view', 'cancel'],
  template: `
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
  `,
  setup(props: any, { emit }: any) {
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
    
    return {
      refreshing,
      onRefresh,
      getTypeName
    };
  }
};

// 按类型筛选收藏
const articleList = computed(() => {
  return favoriteList.value.filter(item => item.type === 'article');
});

const postList = computed(() => {
  return favoriteList.value.filter(item => item.type === 'post');
});

const videoList = computed(() => {
  return favoriteList.value.filter(item => item.type === 'video');
});

// 加载收藏数据
const loadFavorites = () => {
  loading.value = true;
  
  // 这里应该调用实际的API获取收藏数据
  setTimeout(() => {
    const mockFavorites = [];
    
    // 文章收藏
    for (let i = 0; i < 5; i++) {
      mockFavorites.push({
        id: `article-${i + 1}`,
        title: `收藏的文章标题 ${i + 1}`,
        description: '这是文章内容摘要，展示部分内容简介...',
        type: 'article',
        cover: i % 2 === 0 ? 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' : '',
        time: new Date(Date.now() - i * 86400000).toLocaleString(),
        url: `/article/${i + 1}`
      });
    }
    
    // 帖子收藏
    for (let i = 0; i < 3; i++) {
      mockFavorites.push({
        id: `post-${i + 1}`,
        title: `收藏的帖子标题 ${i + 1}`,
        description: '这是帖子内容摘要，展示部分内容简介...',
        type: 'post',
        cover: i % 2 === 0 ? 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' : '',
        time: new Date(Date.now() - i * 43200000).toLocaleString(),
        url: `/post/${i + 1}`
      });
    }
    
    // 视频收藏
    for (let i = 0; i < 2; i++) {
      mockFavorites.push({
        id: `video-${i + 1}`,
        title: `收藏的视频标题 ${i + 1}`,
        description: '这是视频内容简介，视频时长3分钟...',
        type: 'video',
        cover: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        time: new Date(Date.now() - i * 172800000).toLocaleString(),
        url: `/video/${i + 1}`
      });
    }
    
    favoriteList.value = mockFavorites;
    loading.value = false;
  }, 800);
};

// 查看收藏内容
const viewItem = (item: any) => {
  router.push(item.url);
};

// 确认取消收藏
const confirmCancelFavorite = (item: any) => {
  showDialog({
    title: '取消收藏',
    message: '确定要取消收藏这个内容吗？',
    showCancelButton: true,
  }).then(() => {
    cancelFavorite(item.id);
  });
};

// 取消收藏
const cancelFavorite = (id: string) => {
  // 这里应该调用实际的API取消收藏
  favoriteList.value = favoriteList.value.filter(item => item.id !== id);
  showToast('已取消收藏');
};

// 返回上一页
const goBack = () => {
  router.back();
};

onMounted(() => {
  loadFavorites();
});
</script>

<style lang="scss" scoped>
.user-favorites {
  min-height: 100vh;
  background-color: #f7f8fa;
  
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
              align-items: center;
              font-size: 12px;
              color: #969799;
              
              .item-type {
                background-color: #f7f8fa;
                padding: 2px 6px;
                border-radius: 4px;
                margin-right: 8px;
              }
            }
          }
        }
        
        .item-actions {
          display: flex;
          align-items: center;
          margin-left: 8px;
          
          .action-icon {
            font-size: 18px;
            color: #969799;
            padding: 4px;
          }
        }
      }
    }
    
    .list-loading {
      text-align: center;
      padding: 20px 0;
    }
  }
}
</style> 