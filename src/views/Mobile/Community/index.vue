<template>
  <div class="mobile-community">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="社区"
      :border="false"
      class="community-nav"
    >
      <template #right>
        <van-icon name="search" size="24" @click="onSearch" />
      </template>
    </van-nav-bar>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 分类标签 -->
      <category-tabs 
        :categories="categories" 
        v-model:active="activeCategory"
        @change="onCategoryChange"
      />

      <!-- 帖子列表 -->
      <div class="post-list-container">
        <!-- 下拉刷新 -->
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <!-- 上拉加载 -->
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <post-item 
              v-for="post in postList" 
              :key="post.id" 
              :post="post" 
              @click="navigateToPost(post.id)"
            />
          </van-list>
        </van-pull-refresh>
      </div>
    </div>

    <!-- 发帖悬浮按钮 -->
    <div class="floating-button" @click="onCreatePost">
      <van-icon name="edit" size="24" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import CategoryTabs from '@/components/Mobile/Community/CategoryTabs.vue';
import PostItem from '@/components/Mobile/Community/PostItem.vue';

const router = useRouter();

// 分类数据
const categories = ref([
  { id: 0, name: '推荐' },
  { id: 1, name: '游戏讨论' },
  { id: 2, name: '攻略心得' },
  { id: 3, name: '新闻资讯' },
  { id: 4, name: '同人创作' },
  { id: 5, name: '问答' }
]);

// 当前激活的分类
const activeCategory = ref(0);

// 分页和加载状态
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

// 帖子列表
const postList = ref<any[]>([]);

// 加载帖子列表
const loadPosts = async (isRefresh = false) => {
  try {
    // 这里应该调用真实的API请求帖子数据
    // const res = await api.getPosts({
    //   categoryId: activeCategory.value,
    //   pageNum: pageNum.value,
    //   pageSize: pageSize.value
    // });

    // 模拟API响应数据
    const mockPosts = Array(10).fill(0).map((_, index) => ({
      id: isRefresh ? 1000 + index : pageNum.value * 100 + index,
      title: `帖子标题 ${isRefresh ? '(新)' : ''} ${pageNum.value}-${index + 1}`,
      content: '这是帖子内容的简要描述，展示部分文字...',
      author: {
        id: index + 1,
        name: `用户${index + 1}`,
        avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
      },
      publishTime: new Date().toLocaleString(),
      viewCount: Math.floor(Math.random() * 1000),
      commentCount: Math.floor(Math.random() * 100),
      likeCount: Math.floor(Math.random() * 50),
      tags: ['标签1', '标签2'],
      images: index % 3 === 0 ? ['https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'] : []
    }));

    // 模拟请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 如果是刷新，则替换数据
    if (isRefresh) {
      postList.value = mockPosts;
      pageNum.value = 2;
    } else {
      postList.value = [...postList.value, ...mockPosts];
      pageNum.value++;
    }

    // 模拟数据加载完成
    if (pageNum.value > 3) {
      finished.value = true;
    }
  } catch (error) {
    console.error('加载帖子失败:', error);
    showToast('加载失败，请重试');
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

// 上拉加载
const onLoad = () => {
  loadPosts();
};

// 下拉刷新
const onRefresh = () => {
  finished.value = false;
  pageNum.value = 1;
  loadPosts(true);
};

// 切换分类
const onCategoryChange = (index: number) => {
  // 重置数据状态
  postList.value = [];
  pageNum.value = 1;
  finished.value = false;
  loadPosts();
};

// 搜索
const onSearch = () => {
  router.push('/search?type=post');
};

// 跳转到帖子详情
const navigateToPost = (id: number) => {
  router.push(`/post/${id}`);
};

// 创建帖子
const onCreatePost = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    showToast('请先登录');
    router.push('/auth/loginMobile');
    return;
  }
  
  router.push('/post/create');
};

// 组件挂载时加载数据
onMounted(() => {
  loadPosts();
});
</script>

<style lang="scss" scoped>
.mobile-community {
  min-height: 100vh;
  background-color: #f7f8fa;
  position: relative;
  padding-bottom: 60px;
  
  .community-nav {
    background-color: #fff;
    
    :deep(.van-nav-bar__title) {
      font-size: 18px;
      font-weight: 500;
    }
  }
  
  .content-area {
    padding-bottom: 16px;
  }
  
  .post-list-container {
    padding: 0 12px;
  }
  
  .floating-button {
    position: fixed;
    right: 20px;
    bottom: 80px;
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #1989fa, #39a9fc);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 3px 8px rgba(25, 137, 250, 0.35);
    z-index: 10;
  }
}
</style> 