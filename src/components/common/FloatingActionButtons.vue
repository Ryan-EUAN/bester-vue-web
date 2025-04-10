<template>
  <div class="floating-buttons">
    <a-tooltip placement="left" title="返回">
      <a-button v-if="showBack" type="primary" shape="circle" @click="goBack" class="float-btn">
        <arrow-left-outlined />
      </a-button>
    </a-tooltip>
    <a-tooltip placement="left" title="刷新">
      <a-button v-if="showRefresh" type="primary" shape="circle" @click="refresh" class="float-btn">
        <reload-outlined />
      </a-button>
    </a-tooltip>
    <a-tooltip placement="left" title="发帖">
      <a-button v-if="showPost" type="primary" shape="circle" @click="goToPost" class="float-btn">
        <edit-outlined />
      </a-button>
    </a-tooltip>
    <a-tooltip placement="left" title="回到主页">
      <a-button v-if="showHome" type="primary" shape="circle" @click="goHome" class="float-btn">
        <home-outlined />
      </a-button>
    </a-tooltip>
    <a-tooltip placement="left" title="意见反馈">
      <a-button v-if="showFeedback" type="primary" shape="circle" @click="showFeedbackModal" class="float-btn">
        <question-circle-outlined />
      </a-button>
    </a-tooltip>
  </div>

  <!-- 反馈弹窗 -->
  <a-modal v-model:open="feedbackVisible" title="意见反馈" @ok="handleFeedbackSubmit" :confirmLoading="feedbackLoading">
    <a-form :model="feedbackForm" layout="vertical">
      <a-form-item label="反馈类型" name="type">
        <a-select v-model:value="feedbackForm.type">
          <a-select-option value="bug">Bug/故障</a-select-option>
          <a-select-option value="suggestion">功能建议</a-select-option>
          <a-select-option value="other">其他</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="反馈内容" name="content">
        <a-textarea v-model:value="feedbackForm.content" :rows="4" placeholder="请详细描述您的问题或建议..." />
      </a-form-item>
      <a-form-item label="联系方式 (选填)" name="contact">
        <a-input v-model:value="feedbackForm.contact" placeholder="邮箱/手机号，方便我们联系您" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { 
  ArrowLeftOutlined, 
  ReloadOutlined, 
  HomeOutlined, 
  QuestionCircleOutlined,
  EditOutlined
} from '@ant-design/icons-vue';

const props = defineProps({
  showBack: {
    type: Boolean,
    default: true
  },
  showRefresh: {
    type: Boolean,
    default: true
  },
  showHome: {
    type: Boolean,
    default: true
  },
  showFeedback: {
    type: Boolean,
    default: true
  },
  showPost: {
    type: Boolean,
    default: true
  },
  backPath: {
    type: String,
    default: ''
  },
  pageType: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['refresh', 'customBack']);

const router = useRouter();
const feedbackVisible = ref(false);
const feedbackLoading = ref(false);
const feedbackForm = ref({
  type: 'suggestion',
  content: '',
  contact: '',
  pageUrl: window.location.href
});

// 返回上一页
const goBack = () => {
  // 如果父组件想要自定义返回逻辑
  emit('customBack');
  
  // 如果指定了返回路径
  if (props.backPath) {
    router.push(props.backPath);
    return;
  }

  // 根据页面类型处理回退逻辑
  if (props.pageType === 'article') {
    // 检查是否有模块列表页记录
    const moduleListPage = localStorage.getItem('moduleListPage');
    
    // 清除文章详情页本地存储
    localStorage.removeItem('articleDetailPage');
    
    if (moduleListPage) {
      // 如果有模块列表页记录，返回模块列表页
      const modulePage = JSON.parse(moduleListPage);
      router.push(modulePage.path);
    } else {
      // 否则返回首页
      router.push('/');
    }
  } else if (props.pageType === 'module') {
    // 清除文章列表页本地存储
    localStorage.removeItem('moduleListPage');
    // 导航到首页
    router.push('/');
  } else {
    // 默认返回行为
    router.back();
  }
};

// 刷新
const refresh = () => {
  emit('refresh');
};

// 回到主页
const goHome = () => {
  // 清除所有相关的本地存储
  localStorage.removeItem('moduleListPage');
  localStorage.removeItem('articleDetailPage');
  
  // 导航到首页
  router.push('/');
};

// 显示反馈弹窗
const showFeedbackModal = () => {
  feedbackVisible.value = true;
  // 重置表单
  feedbackForm.value = {
    type: 'suggestion',
    content: '',
    contact: '',
    pageUrl: window.location.href
  };
};

// 提交反馈
const handleFeedbackSubmit = async () => {
  if (!feedbackForm.value.content.trim()) {
    message.warning('请填写反馈内容');
    return;
  }

  try {
    feedbackLoading.value = true;
    // 这里应该调用实际的API提交反馈
    // await feedbackApi.SUBMIT_FEEDBACK(feedbackForm.value);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    message.success('感谢您的反馈！');
    feedbackVisible.value = false;
  } catch (error) {
    message.error('提交失败，请稍后再试');
  } finally {
    feedbackLoading.value = false;
  }
};

// 跳转到发布帖子页面
const goToPost = () => {
  // 判断用户是否已登录
  const token = localStorage.getItem('token');
  const userInfo = localStorage.getItem('userInfo');
  
  if (!token || !userInfo) {
    // 未登录情况，触发显示登录窗口事件
    message.warning('请先登录后发帖');
    window.dispatchEvent(new CustomEvent('showLoginModal', {
      detail: {
        redirect: '/release',
        message: '请先登录后发帖'
      }
    }));
    return;
  }
  
  // 导航到发布页面
  router.push('/release');
};
</script>

<style lang="less" scoped>
.floating-buttons {
  position: fixed;
  bottom: 50px;
  right: 50px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
  
  .float-btn {
    width: 45px;
    height: 45px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
  }
}
</style> 