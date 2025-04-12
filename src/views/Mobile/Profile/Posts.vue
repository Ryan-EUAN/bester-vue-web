<template>
  <div class="user-posts">
    <van-nav-bar
      title="我的帖子"
      left-arrow
      @click-left="goBack"
    />
    
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="全部">
        <post-list
          :posts="allPosts"
          :loading="loading"
          @refresh="loadPosts"
          @view="viewPost"
          @delete="confirmDeletePost"
        />
      </van-tab>
      <van-tab title="已发布">
        <post-list
          :posts="publishedPosts"
          :loading="loading"
          @refresh="loadPosts"
          @view="viewPost"
          @delete="confirmDeletePost"
        />
      </van-tab>
      <van-tab title="待审核">
        <post-list
          :posts="pendingPosts"
          :loading="loading"
          @refresh="loadPosts"
          @view="viewPost"
          @delete="confirmDeletePost"
        />
      </van-tab>
      <van-tab title="草稿">
        <post-list
          :posts="draftPosts"
          :loading="loading"
          @refresh="loadPosts"
          @edit="editPost"
          @delete="confirmDeletePost"
        />
      </van-tab>
    </van-tabs>
    
    <van-empty v-if="!loading && allPosts.length === 0" description="暂无帖子" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import PostList from '@/components/Mobile/Profile/PostList.vue';

const router = useRouter();
const loading = ref(false);
const activeTab = ref(0);
const posts = ref<any[]>([]);

// 按状态筛选帖子
const allPosts = computed(() => posts.value);

const publishedPosts = computed(() => {
  return posts.value.filter(post => post.status === 'published');
});

const pendingPosts = computed(() => {
  return posts.value.filter(post => post.status === 'pending');
});

const draftPosts = computed(() => {
  return posts.value.filter(post => post.status === 'draft');
});

// 加载帖子数据
const loadPosts = () => {
  loading.value = true;
  
  // 这里应该调用实际的API获取帖子数据
  setTimeout(() => {
    const mockPosts = [];
    
    // 已发布帖子
    for (let i = 0; i < 5; i++) {
      mockPosts.push({
        id: `published-${i + 1}`,
        title: `已发布帖子标题 ${i + 1}`,
        content: '这是帖子内容摘要，展示部分内容...',
        publishTime: new Date(Date.now() - i * 86400000).toLocaleString(),
        updateTime: new Date(Date.now() - i * 86400000).toLocaleString(),
        status: 'published',
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 50),
        cover: i % 2 === 0 ? 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' : ''
      });
    }
    
    // 待审核帖子
    for (let i = 0; i < 2; i++) {
      mockPosts.push({
        id: `pending-${i + 1}`,
        title: `待审核帖子标题 ${i + 1}`,
        content: '这是帖子内容摘要，展示部分内容...',
        publishTime: new Date(Date.now() - i * 43200000).toLocaleString(),
        updateTime: new Date(Date.now() - i * 43200000).toLocaleString(),
        status: 'pending',
        views: 0,
        likes: 0,
        comments: 0,
        cover: i % 2 === 0 ? 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' : ''
      });
    }
    
    // 草稿帖子
    for (let i = 0; i < 3; i++) {
      mockPosts.push({
        id: `draft-${i + 1}`,
        title: `草稿帖子标题 ${i + 1}`,
        content: '这是帖子内容摘要，展示部分内容...',
        publishTime: '',
        updateTime: new Date(Date.now() - i * 3600000).toLocaleString(),
        status: 'draft',
        views: 0,
        likes: 0,
        comments: 0,
        cover: ''
      });
    }
    
    posts.value = mockPosts;
    loading.value = false;
  }, 800);
};

// 查看帖子详情
const viewPost = (postId: string) => {
  router.push(`/post/${postId}`);
};

// 编辑草稿
const editPost = (postId: string) => {
  router.push(`/post/edit/${postId}`);
};

// 确认删除帖子
const confirmDeletePost = (postId: string) => {
  showDialog({
    title: '删除帖子',
    message: '确定要删除这篇帖子吗？',
    showCancelButton: true,
  }).then(() => {
    deletePost(postId);
  });
};

// 删除帖子
const deletePost = (postId: string) => {
  // 这里应该调用实际的API删除帖子
  posts.value = posts.value.filter(post => post.id !== postId);
  showToast('删除成功');
};

// 返回上一页
const goBack = () => {
  router.back();
};

onMounted(() => {
  loadPosts();
});
</script>

<style lang="scss" scoped>
.user-posts {
  min-height: 100vh;
  background-color: #f7f8fa;
}
</style> 