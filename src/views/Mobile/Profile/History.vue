<template>
  <div class="user-history">
    <van-nav-bar
      title="浏览历史"
      left-arrow
      @click-left="goBack"
    />
    
    <van-tabs v-model:active="activeTab" sticky swipeable>
      <van-tab title="全部">
        <history-list
          :list="historyList"
          :loading="loading"
          @refresh="loadHistoryData"
          @view-item="viewHistoryItem"
          @delete-item="deleteHistoryItem"
        />
      </van-tab>
      <van-tab title="帖子">
        <history-list
          :list="postsHistory"
          :loading="loading"
          @refresh="loadHistoryData"
          @view-item="viewHistoryItem"
          @delete-item="deleteHistoryItem"
        />
      </van-tab>
      <van-tab title="文章">
        <history-list
          :list="articlesHistory"
          :loading="loading"
          @refresh="loadHistoryData"
          @view-item="viewHistoryItem"
          @delete-item="deleteHistoryItem"
        />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import HistoryList from '@/components/Mobile/Profile/HistoryList.vue';

const router = useRouter();
const loading = ref(false);
const activeTab = ref(0);
const historyList = ref<any[]>([]);

// 根据类型过滤历史记录
const postsHistory = computed(() => {
  return historyList.value.filter(item => item.type === 'post');
});

const articlesHistory = computed(() => {
  return historyList.value.filter(item => item.type === 'article');
});

// 加载历史数据
const loadHistoryData = () => {
  loading.value = true;
  
  // 这里应该调用实际的API获取浏览历史数据
  // 模拟数据加载
  setTimeout(() => {
    // 模拟数据
    const mockHistoryData = Array(20).fill(0).map((_, index) => ({
      id: index + 1,
      type: index % 3 === 0 ? 'article' : 'post',
      title: `${index % 3 === 0 ? '文章' : '帖子'}标题 ${index + 1}`,
      content: `这是${index % 3 === 0 ? '文章' : '帖子'}的简短描述内容，展示部分文字...`,
      authorName: `作者${index % 10 + 1}`,
      authorAvatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      viewTime: new Date(Date.now() - index * 3600000).toLocaleString()
    }));
    
    historyList.value = mockHistoryData;
    loading.value = false;
  }, 1000);
};

// 查看历史记录项
const viewHistoryItem = (item: any) => {
  if (item.type === 'post') {
    router.push(`/post/${item.id}`);
  } else {
    router.push(`/article/${item.id}`);
  }
};

// 删除历史记录
const deleteHistoryItem = (id: number) => {
  showDialog({
    title: '删除记录',
    message: '确定要删除这条浏览记录吗？',
    showCancelButton: true,
  }).then(() => {
    // 用户点击确认按钮
    historyList.value = historyList.value.filter(item => item.id !== id);
    showToast('已删除');
  });
};

// 返回上一页
const goBack = () => {
  router.back();
};

onMounted(() => {
  loadHistoryData();
});
</script>

<style lang="scss" scoped>
.user-history {
  min-height: 100vh;
  background-color: #f7f8fa;
}
</style> 