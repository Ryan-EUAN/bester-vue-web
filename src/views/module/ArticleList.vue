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
              <a-select-option value="index">默认排序</a-select-option>
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
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import type { ModuleArticleItem } from '@/types/article';
import articleApi from '@/services/article';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import FloatingActionButtons from '@/components/common/FloatingActionButtons.vue';
import ArticleListComponent from '@/components/common/ArticleListComponent.vue';

// 设置中文语言
const locale = zhCN;

const route = useRoute();
const router = useRouter();
const moduleId = ref<number>(0);
const moduleTitle = ref<string>('模块文章');
const moduleDescription = ref<string>('这里展示了模块下的所有文章');
const loading = ref<boolean>(false);
const articles = ref<ModuleArticleItem[]>([]);
const sortBy = ref<string>('index');
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

// 处理导航
// @ts-ignore
const handleNavigate = (articleId: string) => {
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
</style>