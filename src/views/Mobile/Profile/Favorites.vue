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
import FavoriteList from '@/components/Mobile/FavoriteList.vue';

const router = useRouter();
const loading = ref(false);
const activeTab = ref(0);
const favoriteList = ref<any[]>([]);

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
}
</style> 