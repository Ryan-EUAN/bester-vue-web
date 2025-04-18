<template>
  <div class="my-articles">
    <div class="article-header-fixed">
      <a-card :bordered="false" :bodyStyle="{ padding: 0 }">
        <template #title>我的文章</template>
        <template #extra>
          <a-button type="primary" @click="$router.push('/release')">发布文章</a-button>
        </template>
      </a-card>
    </div>
    
    <div class="article-content-scroll">
      <a-list
        :loading="loading"
        :data-source="articles"
        :pagination="false"
        item-layout="vertical"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                <div class="article-header">
                  <a :href="'/article/' + item.id">{{ item.title }}</a>
                  <span class="article-time">发布于 {{ item.time }}</span>
                </div>
              </template>
            </a-list-item-meta>
            <div class="article-content">{{ item.content }}</div>
            <div v-if="item.images && item.images.length" class="article-images">
              <img v-for="(img, index) in item.images.slice(0, 3)" :key="index" :src="img" :alt="'图片' + (index + 1)" />
            </div>
            <template #actions>
              <span>
                <EyeOutlined style="margin-right: 4px" />
                {{ item.browse }}
              </span>
              <span>
                <LikeOutlined style="margin-right: 4px" />
                {{ item.likes.length }}
              </span>
              <span>
                <MessageOutlined style="margin-right: 4px" />
                {{ item.comments.length }}
              </span>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <div class="pagination-fixed">
      <a-pagination
        v-model:current="pagination.current"
        :total="pagination.total"
        :pageSize="pagination.pageSize"
        @change="pagination.onChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { EyeOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons-vue';
import type { Article } from '@/types/article';
import articleApi from '@/services/article';

const loading = ref(false);
const articles = ref<Article[]>([]);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  onChange: (page: number, pageSize: number) => {
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
    fetchArticles();
  },
});

const fetchArticles = async () => {
  loading.value = true;
  try {
    const res = await articleApi.GET_MY_ARTICLES_API({
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
    });
    articles.value = res.data.list;
    pagination.value.total = res.data.total;
  } catch (error) {
    console.error('获取文章列表失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchArticles();
});
</script>

<style lang="less" scoped>
.my-articles {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  .article-header-fixed {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;

    :deep(.ant-card) {
      background: transparent;
      
      .ant-card-head {
        min-height: 48px;
        padding: 0 20px;
        
        .ant-card-head-title {
          padding: 12px 0;
        }
        
        .ant-card-extra {
          padding: 12px 0;
        }
      }
    }
  }

  .article-content-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px;
    margin: 16px 0;

    .article-header {
      display: flex;
      align-items: center;
      gap: 12px;

      a {
        flex: 1;
        font-size: 16px;
        font-weight: 500;
      }

      .article-time {
        font-size: 12px;
        color: #999;
        white-space: nowrap;
      }
    }

    .article-content {
      margin: 8px 0;
      color: rgba(0, 0, 0, 0.45);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      line-height: 1.5;
    }

    .article-images {
      display: flex;
      gap: 8px;
      margin-top: 8px;

      img {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 4px;
      }
    }

    :deep(.ant-list-item-action) {
      margin-top: 12px;
    }
  }

  .pagination-fixed {
    position: sticky;
    bottom: 0;
    padding: 16px 0;
    background: #fff;
    border-top: 1px solid #f0f0f0;
    text-align: center;
    z-index: 10;
  }
}
</style> 