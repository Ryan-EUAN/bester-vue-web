<template>
  <div class="my-replies">
    <a-card :bordered="false" title="最新回复">
      <a-list
        :loading="loading"
        :data-source="replies"
        :pagination="pagination"
        item-layout="vertical"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                <div class="reply-header">
                  <span class="reply-label">回复了文章</span>
                  <a :href="'/article/' + item.articleId">{{ item.articleTitle }}</a>
                  <span class="reply-time">{{ item.createTime }}</span>
                </div>
              </template>
            </a-list-item-meta>
            <div class="reply-content">{{ item.content }}</div>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Reply } from '@/types/article';
// import articleApi from '@/services/article';

const loading = ref(false);
const replies = ref<Reply[]>([]);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  onChange: (page: number, pageSize: number) => {
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
    fetchReplies();
  },
});

// 模拟数据
const mockReplies: Reply[] = [
  {
    id: "1",
    content: '这是一条测试回复内容，描述了一些观点和想法...',
    createTime: '2024-03-18 14:30:00',
    articleId: "1", 
    articleTitle: '测试文章标题',
    author: {
      id: "1",
      name: '测试用户',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'
    },
    username: '测试用户',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1',
    time: '2024-03-18 14:30:00',
    likes: 0,
    isLiked: false
  },
  // 可以添加更多模拟数据...
];

const fetchReplies = async () => {
  loading.value = true;
  try {
    // const res = await articleApi.GET_MY_REPLIES_API({
    //   pageNum: pagination.value.current,
    //   pageSize: pagination.value.pageSize,
    // });
    // replies.value = res.data.list;
    // pagination.value.total = res.data.total;

    // 使用模拟数据
    replies.value = mockReplies;
    pagination.value.total = mockReplies.length;
  } catch (error) {
    console.error('获取回复列表失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchReplies();
});
</script>

<style lang="less" scoped>
.my-replies {
  .reply-header {
    display: flex;
    align-items: center;
    gap: 12px;

    .reply-label {
      color: #999;
      font-size: 14px;
    }

    a {
      flex: 1;
      font-size: 15px;
      font-weight: 500;
      
      &:hover {
        color: #1890ff;
      }
    }

    .reply-time {
      font-size: 12px;
      color: #999;
      white-space: nowrap;
    }
  }

  .reply-content {
    margin: 8px 0;
    color: rgba(0, 0, 0, 0.45);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  :deep(.ant-list-item) {
    padding: 12px 0;
  }
}
</style> 