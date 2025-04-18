<template>
  <div class="search-result-page" :class="{ 'dark-mode': isDarkMode }">
    <a-config-provider :locale="locale">
      <div class="search-header" :class="{ 'dark-mode': isDarkMode }">
        <h1>搜索到以下内容：</h1>
        <div class="search-actions">
          <a-select v-model:value="sortBy" style="width: 120px" @change="handleSortChange" 
            :class="{ 'dark-mode': isDarkMode }">
            <a-select-option value="index">默认排序</a-select-option>
            <a-select-option value="newest">最新发布</a-select-option>
            <a-select-option value="hotArticle">最多点赞</a-select-option>
            <a-select-option value="mostCommented">最多评论</a-select-option>
            <a-select-option value="hottest">最多浏览</a-select-option>
          </a-select>
          <a-input-search v-model:value="searchKeyword" placeholder="搜索" style="width: 300px" @search="handleSearch" 
            :loading="loading" :class="{ 'dark-mode': isDarkMode }" />
        </div>
      </div>

      <!-- 使用浮动按钮组件 -->
      <FloatingActionButtons 
        pageType="search" 
        @refresh="refresh" 
      />

      <!-- 使用文章列表组件 -->
      <ArticleListComponent
        :articles="articles"
        :loading="loading"
        :pagination="pagination"
        @pageChange="handlePageChange"
        @pageSizeChange="handlePageSizeChange"
        @navigate="handleNavigate"
      />
    </a-config-provider>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import type { ModuleArticleItem } from '@/types/article';
import articleApi from '@/services/article';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import FloatingActionButtons from '@/components/common/FloatingActionButtons.vue';
import ArticleListComponent from '@/components/common/ArticleListComponent.vue';
import { getCurrentTheme, onThemeChange } from '@/utils/themeUtils';

// 设置中文语言
const locale = zhCN;

// 主题相关
const isDarkMode = ref(getCurrentTheme() === 'dark');

// 监听主题变化
onMounted(() => {
  // 监听主题变化
  const unsubscribe = onThemeChange((theme) => {
    isDarkMode.value = theme === 'dark';
  });

  // 组件卸载时取消监听
  onUnmounted(() => {
    unsubscribe();
  });
});

const route = useRoute();
const router = useRouter();
const keyword = ref<string>('');
const searchKeyword = ref<string>('');
const loading = ref<boolean>(false);
const articles = ref<ModuleArticleItem[]>([]);
const sortBy = ref<string>('index');

// 分页相关
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
});

// 加载搜索结果
const loadSearchResults = async () => {
  if (!keyword.value.trim()) {
    message.warning('请输入搜索关键词');
    return;
  }

  try {
    loading.value = true;

    // 实际项目中应该调用API
    const res = await articleApi.SEARCH_ARTICLES_API({
      keyword: keyword.value,
      page: pagination.value.current,
      size: pagination.value.pageSize,
      sort: sortBy.value // 添加排序参数
    });
    
    // 使用后端返回的实际数据
    articles.value = res.data.list;
    pagination.value.total = res.data.total;
    pagination.value.totalPages = res.data.totalPages;
    loading.value = false;

  } catch (error) {
    message.error('搜索失败');
    loading.value = false;
    articles.value = [];
  }
};

// 处理排序变更
const handleSortChange = () => {
  pagination.value.current = 1;
  
  // 更新URL，包含排序参数
  router.replace({
    path: '/search',
    query: { 
      keyword: keyword.value,
      sort: sortBy.value
    }
  });
  
  loadSearchResults();
};

// 处理搜索
const handleSearch = (value: string) => {
  if (!value.trim()) {
    message.warning('请输入搜索关键词');
    return;
  }
  
  keyword.value = value;
  searchKeyword.value = value;
  pagination.value.current = 1;
  
  // 更新URL但不重新加载页面，保留排序参数
  router.replace({
    path: '/search',
    query: { 
      keyword: value,
      sort: sortBy.value
    }
  });
  
  loadSearchResults();
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.current = page;
  loadSearchResults();
};

// 处理每页显示数量变化
const handlePageSizeChange = (size: number) => {
  pagination.value.current = 1;
  pagination.value.pageSize = size;
  loadSearchResults();
};

// 处理导航
const handleNavigate = (articleId: string) => {
  console.log('handleNavigate', articleId);
  
  // 保存当前页面路径信息到本地存储
  const currentPath = {
    path: route.fullPath,
    type: 'search',
    keyword: keyword.value,
    sort: sortBy.value
  };
  
  // 先清除文章详情页相关存储
  localStorage.removeItem('articleDetailPage');
  
  // 保存搜索页信息
  localStorage.setItem('searchListPage', JSON.stringify(currentPath));
};

// 刷新功能
const refresh = () => {
  loadSearchResults();
  message.success('刷新成功');
};

// 监听URL参数变化
watch(
  () => [route.query.keyword, route.query.sort],
  ([newKeyword, newSort]) => {
    if (newKeyword) {
      keyword.value = newKeyword as string;
      searchKeyword.value = newKeyword as string;
    }
    
    if (newSort) {
      sortBy.value = newSort as string;
    }
    
    if (newKeyword || newSort) {
      pagination.value.current = 1;
      loadSearchResults();
    }
  },
  { immediate: true }
);

onMounted(() => {
  // 从URL获取搜索关键词和排序方式
  if (route.query.keyword) {
    keyword.value = route.query.keyword as string;
    searchKeyword.value = keyword.value;
    
    if (route.query.sort) {
      sortBy.value = route.query.sort as string;
    }
    
    loadSearchResults();
  } else {
    // 如果没有提供关键词，检查本地存储中是否有保存的搜索关键词
    const lastSearched = localStorage.getItem('searchListPage');
    if (lastSearched) {
      const lastPage = JSON.parse(lastSearched);
      if (lastPage.type === 'search' && lastPage.keyword) {
        keyword.value = lastPage.keyword;
        searchKeyword.value = keyword.value;
        
        // 还原排序方式
        if (lastPage.sort) {
          sortBy.value = lastPage.sort;
        }
        
        // 更新URL
        router.replace({
          path: '/search',
          query: { 
            keyword: keyword.value,
            sort: sortBy.value
          }
        });
        
        loadSearchResults();
      }
    }
  }
});
</script>

<style lang="less" scoped>
.search-result-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  transition: all 0.3s ease;

  &.dark-mode {
    background-color: transparent;
  }
}

.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  background: #fff;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  h1 {
    margin: 0;
    font-size: 20px;
    color: #333;
    flex: 1;
  }
  
  .search-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &.dark-mode {
    background: #1f1f1f;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

    h1 {
      color: #e0e0e0;
    }

    :deep(.ant-select) {
      &.dark-mode {
        background-color: #2d2d2d;
        
        .ant-select-selector {
          background-color: #2d2d2d;
          border-color: #434343;
          color: #e0e0e0;
        }

        .ant-select-arrow {
          color: #888;
        }

        &:hover .ant-select-selector {
          border-color: #177ddc;
        }
      }
    }

    :deep(.ant-select-dropdown) {
      background-color: #1f1f1f;
      
      .ant-select-item {
        color: #e0e0e0;
        
        &:hover {
          background-color: #2d2d2d;
        }
        
        &-selected {
          background-color: #177ddc;
          color: #fff;
        }
      }
    }

    :deep(.ant-input-search) {
      &.dark-mode {
        .ant-input {
          background-color: #2d2d2d;
          border-color: #434343;
          color: #e0e0e0;

          &::placeholder {
            color: #888;
          }

          &:hover, &:focus {
            border-color: #177ddc;
          }
        }

        .ant-input-search-button {
          background-color: #177ddc;
          border-color: #177ddc;
          color: #fff;

          &:hover {
            background-color: #1890ff;
            border-color: #1890ff;
          }
        }
      }
    }
  }
}

// 深色模式下的分页样式
:deep(.ant-pagination) {
  .dark-mode & {
    .ant-pagination-item {
      background-color: #2d2d2d;
      border-color: #434343;
      
      a {
        color: #e0e0e0;
      }
      
      &:hover {
        border-color: #177ddc;
        
        a {
          color: #177ddc;
        }
      }
      
      &-active {
        background-color: #177ddc;
        border-color: #177ddc;
        
        a {
          color: #fff;
        }
      }
    }

    .ant-pagination-prev,
    .ant-pagination-next {
      button {
        background-color: #2d2d2d;
        border-color: #434343;
        color: #e0e0e0;
        
        &:hover {
          border-color: #177ddc;
          color: #177ddc;
        }
      }
    }
  }
}

// 深色模式下的加载状态样式
:deep(.ant-spin) {
  .dark-mode & {
    color: #177ddc;
    
    .ant-spin-dot-item {
      background-color: #177ddc;
    }
  }
}
</style> 