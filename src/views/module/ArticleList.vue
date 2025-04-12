<template>
  <div class="module-article-list">
    <a-config-provider :locale="locale">
      <a-card class="module-header" :bordered="false">
        <template #title>
          <div class="module-title">
            <h1>{{ moduleTitle }}</h1>
            <div class="module-description">{{ moduleDescription }}</div>
          </div>
        </template>
        <template #extra>
          <a-space>
            <a-select v-model:value="sortBy" style="width: 120px" @change="handleSortChange">
              <a-select-option value="newest">最新发布</a-select-option>
              <a-select-option value="hottest">最多浏览</a-select-option>
              <a-select-option value="mostCommented">最多评论</a-select-option>
              <a-select-option value="hotArticle">火热帖子</a-select-option>
            </a-select>
            <a-input-search v-model:value="searchKeyword" placeholder="搜索文章" style="width: 200px"
              @search="handleSearch" />
          </a-space>
        </template>
      </a-card>

      <!-- 使用浮动按钮组件 -->
      <FloatingActionButtons 
        pageType="module" 
        @refresh="refresh" 
      />

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
    </a-config-provider>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { EyeOutlined, MessageOutlined, LikeOutlined } from '@ant-design/icons-vue';
import type { ModuleArticleItem } from '@/types/article';
import articleApi from '@/services/article';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import FloatingActionButtons from '@/components/common/FloatingActionButtons.vue';

// 设置中文语言
const locale = zhCN;

const route = useRoute();
const router = useRouter();
const moduleId = ref<number>(0);
const moduleTitle = ref<string>('模块文章');
const moduleDescription = ref<string>('这里展示了模块下的所有文章');
const loading = ref<boolean>(false);
const articles = ref<ModuleArticleItem[]>([]);
const sortBy = ref<string>('newest');
const searchKeyword = ref<string>('');

// 分页相关
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
});

// 加载模块信息
const loadModuleInfo = async () => {
  try {
    // 首先尝试从本地存储获取模块信息
    const moduleInfoStr = localStorage.getItem('currentModuleInfo');
    if (moduleInfoStr) {
      const moduleInfo = JSON.parse(moduleInfoStr);
      moduleTitle.value = moduleInfo.title;
      moduleDescription.value = moduleInfo.description;
      return;
    }

    // 如果本地存储没有，则通过API获取模块信息
    // 实际项目中这里应该通过API获取模块信息
    // const res = await moduleApi.GET_MODULE_INFO_API(moduleId.value);
    // moduleTitle.value = res.data.title;
    // moduleDescription.value = res.data.description;

    // 如果API调用失败或未实现，使用静态数据
    moduleTitle.value = '技术开发专区';
    moduleDescription.value = '分享前沿技术、编程经验与技术见解，让开发更轻松';
  } catch (error) {
    message.error('获取模块信息失败');
    // 出错时也使用默认值
    moduleTitle.value = '技术开发专区';
    moduleDescription.value = '分享前沿技术、编程经验与技术见解，让开发更轻松';
  }
};

// 加载文章列表
const loadArticles = async () => {
  try {
    loading.value = true;

    // 实际项目中应该调用API
    const res = await articleApi.GET_MODULE_ARTICLES_API(moduleId.value, {
      page: pagination.value.current,
      size: pagination.value.pageSize,
      sort: sortBy.value,
      keyword: searchKeyword.value
    });
    
    // 使用后端返回的实际数据
    articles.value = res.data.list;
    pagination.value.total = res.data.total;
    pagination.value.totalPages = res.data.totalPages;
    loading.value = false;

  } catch (error) {
    message.error('获取文章列表失败');
    loading.value = false;
  }
};

// 处理排序变更
const handleSortChange = () => {
  pagination.value.current = 1;
  loadArticles();
};

// 处理搜索
const handleSearch = () => {
  pagination.value.current = 1;
  loadArticles();
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.current = page;
  loadArticles();
};

// 处理每页显示数量变化
const handlePageSizeChange = (size: number) => {
  pagination.value.current = 1;
  pagination.value.pageSize = size;
  loadArticles();
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
  
  // 保存当前页面路径信息到本地存储
  const currentPath = {
    path: route.fullPath,
    type: 'module',
    moduleId: moduleId.value,
    moduleName: moduleTitle.value
  };
  
  // 先清除文章详情页相关存储
  localStorage.removeItem('articleDetailPage');
  
  // 保存模块页信息
  localStorage.setItem('moduleListPage', JSON.stringify(currentPath));
  
  router.push(`/article/${articleId}`);
};

// 监听路由参数变化
watch(
  () => route.params.moduleId,
  (newModuleId) => {
    if (newModuleId) {
      moduleId.value = parseInt(newModuleId as string);
      pagination.value.current = 1;
      loadModuleInfo();
      loadArticles();
    }
  },
  { immediate: true }
);

onMounted(() => {
  // 从路由获取模块ID
  if (route.params.moduleId) {
    moduleId.value = parseInt(route.params.moduleId as string);
  } else {
    // 如果没有提供模块ID，检查本地存储中是否有保存的模块ID
    const lastVisited = localStorage.getItem('moduleListPage');
    if (lastVisited) {
      const lastPage = JSON.parse(lastVisited);
      if (lastPage.type === 'module' && lastPage.moduleId) {
        moduleId.value = lastPage.moduleId;
        // 可以选择是否跳转到保存的路径
        if (route.fullPath !== lastPage.path) {
          router.replace(lastPage.path);
          return;
        }
      } else {
        moduleId.value = 1; // 默认模块ID
      }
    } else {
      moduleId.value = 1; // 默认模块ID
    }
  }

  loadModuleInfo();
  loadArticles();
  
  // 加载完成后清除本地存储的模块信息，避免影响后续访问
  localStorage.removeItem('currentModuleInfo');
});

// 刷新功能
const refresh = () => {
  loadModuleInfo();
  loadArticles();
  message.success('刷新成功');
};
</script>

<style lang="less" scoped>
.module-article-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.module-header {
  margin-bottom: 20px;
  background: #fff;
  border-radius: 8px;

  .module-title {
    position: relative;
    
    h1 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }

    .module-description {
      margin-top: 8px;
      color: #666;
      font-size: 14px;
    }
  }
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