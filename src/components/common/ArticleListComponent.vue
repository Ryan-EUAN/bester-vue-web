<template>
  <div class="article-list-component">
    <a-spin :spinning="loading">
      <div class="article-list">
        <a-empty v-if="articles.length === 0" description="暂无文章" />
        <template v-else>
          <a-card v-for="article in articles" :key="article.id" class="article-item" :bordered="false"
            @click="navigateToArticle(article.id)">
            <a-row :gutter="24">
              <a-col :span="article.coverImage ? 16 : 24">
                <div class="article-content">
                  <div class="article-title">{{ article.title }}</div>
                  <div class="article-summary">{{ article.summary }}</div>
                  <div class="article-meta">
                    <a-space>
                      <a-avatar :size="24" :src="article.author.avatar" />
                      <span class="author-name">{{ article.author.name }}</span>
                      <a-divider type="vertical" />
                      <span class="publish-time">{{ article.publishTime.replace('T', ' ') }}</span>
                      <a-divider type="vertical" />
                      <span class="view-count">
                        <eye-outlined /> {{ article.viewCount }}
                      </span>
                      <span class="comment-count">
                        <message-outlined /> {{ article.commentCount }}
                      </span>
                      <span class="like-count">
                        <like-outlined /> {{ article.likeCount }}
                      </span>
                    </a-space>
                  </div>
                  <div class="article-tags">
                    <a-tag v-for="tag in article.tags" :key="tag" color="blue">{{ tag }}</a-tag>
                    <a-tag v-if="article.featured" color="red">精选</a-tag>
                  </div>
                </div>
              </a-col>
              <a-col :span="8" v-if="article.coverImage">
                <div class="article-cover">
                  <img :src="article.coverImage" :alt="article.title" />
                </div>
              </a-col>
            </a-row>
          </a-card>
        </template>
      </div>

      <div class="pagination-container">
        <a-pagination 
          v-model:current="pagination.current" 
          :total="pagination.total" 
          :pageSize="pagination.pageSize"
          show-size-changer 
          @change="handlePageChange" 
          @showSizeChange="handlePageSizeChange" 
          :showTotal="(total: number) => `共 ${total} 条`" />
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import {  defineProps, defineEmits } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { EyeOutlined, MessageOutlined, LikeOutlined } from '@ant-design/icons-vue';
import type { ModuleArticleItem } from '@/types/article';
import articleApi from '@/services/article';

// @ts-ignore
const props = defineProps({
  articles: {
    type: Array as () => ModuleArticleItem[],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['pageChange', 'pageSizeChange', 'navigate']);

const router = useRouter();
const route = useRoute();

// 处理分页变化
const handlePageChange = (page: number) => {
  emit('pageChange', page);
};

// 处理每页显示数量变化
const handlePageSizeChange = (current: number, size: number) => {
  console.log('handlePageSizeChange', current, size);
  emit('pageSizeChange', size);
};

// 导航到文章详情页
const navigateToArticle = async (articleId: string) => {
  // 更新文章查看次数
  try {
    await articleApi.UPDATE_ARTICLE_VIEW_COUNT_API(articleId);
  } catch (error) {
    console.error('更新文章查看次数失败:', error);
    // 继续导航，不影响用户体验
  }
  
  emit('navigate', articleId);
  
  // 保存当前页面路径信息到本地存储
  const currentPath = {
    path: route.fullPath,
    type: route.name === 'search' ? 'search' : 'module',
    query: route.name === 'search' ? route.query.keyword : null
  };
  
  // 先清除文章详情页相关存储
  localStorage.removeItem('articleDetailPage');
  
  // 保存页面信息
  localStorage.setItem(route.name === 'search' ? 'searchListPage' : 'moduleListPage', JSON.stringify(currentPath));
  
  router.push(`/article/${articleId}`);
};
</script>

<style lang="less" scoped>
.article-list-component {
  width: 100%;
}

.article-list {
  margin-bottom: 20px;

  .article-item {
    margin-bottom: 16px;
    border-radius: 8px;
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .article-content {
      .article-title {
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 8px;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }

      .article-summary {
        color: #666;
        font-size: 14px;
        margin-bottom: 16px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .article-meta {
        margin-bottom: 12px;
        font-size: 12px;
        color: #999;

        .author-name {
          color: #666;
          font-weight: 500;
        }

        .publish-time {
          color: #999;
        }

        .view-count,
        .comment-count,
        .like-count {
          display: inline-flex;
          align-items: center;
          margin-right: 12px;

          .anticon {
            margin-right: 4px;
          }
        }
      }

      .article-tags {
        .ant-tag {
          margin-right: 8px;
          margin-bottom: 8px;
        }
      }
    }

    .article-cover {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        max-height: 180px;
        object-fit: cover;
        border-radius: 4px;
      }
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
</style> 