<template>
  <div class="release-container">
    <div class="main-content">
      <!-- 标题输入区 -->
      <div class="title-area">
        <a-input v-model:value="title" placeholder="输入标题..." :maxLength="20" :show-count="true" class="title-input"
          :bordered="false" />
      </div>

      <!-- 内容输入区 -->
      <div class="content-area">
        <a-textarea v-model:value="content" placeholder="有什么新鲜事想分享给大家？" :auto-size="{ minRows: 6, maxRows: 10 }"
          :maxLength="2000" class="content-input" />
        <!-- 图片预览区 -->
        <div class="image-preview" v-if="imageList.length">
          <div v-for="(img, index) in imageList" :key="index" class="image-item">
            <img :src="img" />
            <div class="delete-icon" @click="removeImage(index)">
              <close-outlined />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部工具栏 -->
      <div class="toolbar">
        <div class="left-tools">
          <a-popover v-model:open="emojiVisible" trigger="click" placement="bottomRight"
            overlayClassName="emoji-popover">
            <template #content>
              <div class="emoji-container">
                <!-- 表情分类导航 -->
                <div class="emoji-nav">
                  <a-tooltip v-for="category in emojiCategories" :key="category.key" :title="category.name">
                    <div :class="['nav-item', { active: currentCategory === category.key }]"
                      @click="currentCategory = category.key">
                      {{ category.icon }}
                    </div>
                  </a-tooltip>
                </div>
                <!-- 表情网格 -->
                <div class="emoji-content">
                  <!-- 添加清空按钮，仅在最近使用分类且有数据时显示 -->
                  <div v-if="currentCategory === 'recent' && currentEmojis.length > 0" class="clear-recent">
                    <a-button type="link" size="small" @click="clearRecentEmojis">
                      <delete-outlined />
                      <span>清空最近使用</span>
                    </a-button>
                  </div>
                  <div class="emoji-grid">
                    <a-tooltip v-for="emoji in currentEmojis" :key="emoji.key" :title="emoji.name">
                      <span class="emoji-item" @click="insertEmoji(emoji)">
                        {{ emoji.value }}
                      </span>
                    </a-tooltip>
                  </div>
                </div>
              </div>
            </template>
            <div class="tool-item">
              <smile-outlined />
              <span>表情</span>
            </div>
          </a-popover>
          <a-upload accept="image/*" :multiple="true" :max-count="9" :show-upload-list="false"
            @change="handleImageUpload">
            <div class="tool-item">
              <picture-outlined />
              <span>图片</span>
            </div>
          </a-upload>
          <a-upload accept="video/*" :max-count="1" :show-upload-list="false" @change="handleVideoUpload">
            <div class="tool-item">
              <video-camera-outlined />
              <span>视频</span>
            </div>
          </a-upload>
          <div class="tool-item" @click="insertTopic">
            <number-outlined />
            <span>话题</span>
          </div>
          <div class="tool-item">
            <thunderbolt-outlined />
            <span>头条文章</span>
          </div>
          <div class="tool-item" @click="showModuleModal" :class="toolItemStyle">
            <template v-if="selectedModule">
              <img :src="selectedModule.icon" class="module-icon" :alt="selectedModule.name" />
              <span>{{ selectedModule.name }}</span>
            </template>
            <template v-else>
              <appstore-outlined />
              <span>选择模块</span>
            </template>
          </div>
        </div>
        <div class="right-tools">
          <a-dropdown v-model:open="dropdownVisible" trigger="click">
            <div class="publish-type-selector">
              <clock-circle-outlined />
              <span>{{ getPublishTypeText }}</span>
            </div>
            <template #overlay>
              <a-menu @click="handleMenuClick">
                <a-menu-item key="now">
                  <clock-circle-outlined />
                  <span>立即发布</span>
                </a-menu-item>
                <a-menu-item key="timing">
                  <clock-circle-outlined />
                  <span>定时发布</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <a-modal v-model:open="showTimePicker" title="选择发布时间" :footer="null" :width="300" :closable="false"
            :maskClosable="false" destroyOnClose>
            <div class="time-picker-container">
              <a-date-picker v-model:value="selectedDate" :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm"
                :disabledDate="disabledDate" :disabledTime="disabledTime" @change="handleTimeChange" />
              <div class="time-picker-footer">
                <a-button size="small" @click="cancelTimePicker">取消</a-button>
                <a-button type="primary" size="small" @click="handleTimeConfirm">确定</a-button>
              </div>
            </div>
          </a-modal>

          <a-button type="primary" size="small" @click="publishPost">发送</a-button>
        </div>
      </div>
    </div>

    <!-- 修改模块选择模态框 -->
    <a-modal v-model:open="moduleModalVisible" title="选择模块" :footer="null" :width="800" destroyOnClose
      @cancel="handleModalCancel">
      <div class="module-selector">
        <a-tabs v-model:activeKey="currentCategory" class="module-tabs" :loading="loading">
          <a-tab-pane v-for="category in moduleData" :key="category.title" :tab="category.title">
            <div class="module-grid">
              <div v-for="module in category.plateInfos" :key="module.plateId"
                :class="['module-item', { active: selectedModule?.plateId === module.plateId }]"
                @click="selectModule(module)">
                <img :src="module.icon" :alt="module.name" class="module-icon" />
                <span class="module-name">{{ module.name }}</span>
                <div class="module-info">
                  <span>主题：{{ module.topics }}</span>
                  <span>帖子：{{ module.posts }}</span>
                </div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  SmileOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  NumberOutlined,
  ThunderboltOutlined,
  CloseOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons-vue';
import { emojiCategories, emojiData } from '@/utils/emojiData';
import moduleAPI from '@/services/module';
import articleApi from '@/services/article';
import { debounce } from 'lodash-es';
import dayjs, { Dayjs } from 'dayjs';
import type { ModuleInfo, CategoryData, PostData } from '@/types/release';
import router from '@/router';
import userStorage from '@/utils/userStorage';

const title = ref('');
const content = ref('');
const imageList = ref<string[]>([]);
const emojiVisible = ref(false);
const publishType = ref<'now' | 'timing'>('now');
const currentCategory = ref('emoji');
const RECENT_EMOJIS_KEY = 'recent_emojis';
const MAX_RECENT = 20;
const showTimePicker = ref(false);
const selectedDate = ref<Dayjs | null>(null);
const dropdownVisible = ref(false);

// 从 localStorage 获取最近使用的表情
const loadRecentEmojis = () => {
  try {
    const saved = localStorage.getItem(RECENT_EMOJIS_KEY);
    if (saved) {
      emojiData.recent = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载最近使用的表情失败:', error);
  }
};

// 保存最近使用的表情到 localStorage
const saveRecentEmojis = (emojis: any[]) => {
  try {
    localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(emojis));
  } catch (error) {
    console.error('保存最近使用的表情失败:', error);
  }
};

// 添加到最近使用
const addToRecent = (emoji: any) => {
  const recentList = emojiData.recent;
  // 移除已存在的相同表情
  const index = recentList.findIndex(item => item.value === emoji.value);
  if (index > -1) {
    recentList.splice(index, 1);
  }
  // 添加到开头
  recentList.unshift(emoji);
  // 限制数量
  if (recentList.length > MAX_RECENT) {
    recentList.pop();
  }
  // 保存到 localStorage
  saveRecentEmojis(recentList);
};

// 插入表情并关闭选择器
const insertEmoji = (emoji: any) => {
  const emojiObj = typeof emoji === 'string'
    ? { key: emoji, name: emoji, value: emoji, type: 'emoji' }
    : emoji;

  content.value += emojiObj.value;
  addToRecent(emojiObj);
};

// 当前分类的表情
const currentEmojis = computed(() => {
  return emojiData[currentCategory.value] || [];
});

// 组件挂载时加载最近使用的表情
onMounted(() => {
  // 检查是否已登录
  const token = localStorage.getItem('token');
  const userInfo = localStorage.getItem('userInfo');

  if (!token || !userInfo) {
    // 未登录，触发显示登录窗口事件
    window.dispatchEvent(new CustomEvent('showLoginModal', {
      detail: {
        redirect: '/release'
      }
    }));
    // 不再强制跳转，与路由守卫行为保持一致
    return;
  }
  
  // 已登录，继续正常加载
  loadRecentEmojis();
});

// 处理图片上传
const handleImageUpload = (info: any) => {
  if (info.file.status === 'done') {
    const url = info.file.response.url; // 根据实际接口返回格式调整
    imageList.value.push(url);
  }
};

// 处理视频上传
const handleVideoUpload = (info: any) => {
  if (info.file.status === 'done') {
    message.success('视频上传成功');
    // 处理视频上传后的逻辑
  }
};

// 移除图片
const removeImage = (index: number) => {
  imageList.value.splice(index, 1);
};

// 插入话题
const insertTopic = () => {
  content.value += ' #话题# ';
};

// 获取显示文本
const getPublishTypeText = computed(() => {
  if (publishType.value === 'now') return '立即发布';
  if (!selectedDate.value) return '定时发布';

  const now = dayjs();
  const selected = selectedDate.value;

  return selected.isSame(now, 'day')
    ? `今天 ${selected.format('HH:mm')}`
    : selected.isSame(now.add(1, 'day'), 'day')
      ? `明天 ${selected.format('HH:mm')}`
      : selected.format('MM-DD HH:mm');
});

// 处理下拉菜单点击
const handleMenuClick = (e: { key: string }) => {
  if (e.key === 'now') {
    publishType.value = 'now';
    selectedDate.value = null;
  } else if (e.key === 'timing') {
    publishType.value = 'timing';
    // 设置默认时间为一小时后
    selectedDate.value = dayjs().add(1, 'hour');
    // 显示时间选择器
    showTimePicker.value = true;
  }
  dropdownVisible.value = false;
};

// 处理时间变更
const handleTimeChange = (value: Dayjs | null) => {
  selectedDate.value = value;
};

// 处理时间选择确认
const handleTimeConfirm = () => {
  if (!selectedDate.value) {
    message.warning('请选择发布时间');
    return;
  }
  showTimePicker.value = false;
};

// 取消时间选择
const cancelTimePicker = () => {
  showTimePicker.value = false;
  publishType.value = 'now';
  selectedDate.value = null;
};

// 禁用过去的时间和两天后的时间
const disabledDate = (current: Dayjs) => {
  const today = dayjs().startOf('day');
  const twodays = dayjs().add(2, 'days').endOf('day');
  return current && (current < today || current > twodays);
};

// 禁用今天已经过去的时间
const disabledTime = (date: Dayjs) => {
  const now = dayjs();

  // 如果选择的是今天，则禁用已经过去的时间
  if (date && date.isSame(now, 'day')) {
    return {
      disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
      disabledMinutes: (hour: number) =>
        hour === now.hour() ? Array.from({ length: now.minute() }, (_, i) => i) : [],
    };
  }
  return {};
};

// 模块数据
const moduleData = ref<CategoryData[]>([]);
const moduleModalVisible = ref(false);
const selectedModule = ref<ModuleInfo | null>(null);

// 添加加载状态
const loading = ref(false);
// 添加最后请求时间
const lastFetchTime = ref(0);
// 设置请求间隔时间（10秒）
const FETCH_INTERVAL = 10000;

// 添加数据转换函数，用于处理后端返回的数据
const transformModuleData = (data: any[]): CategoryData[] => {
  return data.map(category => ({
    title: category.title,
    plateInfos: category.plateInfos.map((plate: any) => ({
      plateId: plate.id,
      name: plate.name,
      icon: plate.icon,
      count: plate.count,
      topics: plate.topics,
      posts: plate.posts,
      lastPost: plate.lastPost,
      path: plate.path
    }))
  }));
};

// 修改获取模块列表函数
const debouncedFetchModuleList = debounce(async () => {
  try {
    loading.value = true;
    const now = Date.now();
    if (now - lastFetchTime.value < FETCH_INTERVAL) {
      loading.value = false;
      return;
    }

    const response = await moduleAPI.GET_MODULE_DATA_API();
    // 使用转换函数处理数据
    moduleData.value = transformModuleData(response.data);
    lastFetchTime.value = now;

    if (moduleData.value.length > 0) {
      currentCategory.value = moduleData.value[0].title;
    }
  } catch (error) {
    message.error('获取模块列表失败');
  } finally {
    loading.value = false;
  }
}, 300);

// 显示模块选择模态框
const showModuleModal = async () => {
  moduleModalVisible.value = true;
  // 每次打开模态框时重新获取数据
  await debouncedFetchModuleList();
};

// 处理模态框关闭
const handleModalCancel = () => {
  moduleModalVisible.value = false;
};

// 修改发布帖子函数
const publishPost = async () => {
  // 检查模块选择
  if (!selectedModule.value) {
    message.warning('请先选择模块');
    return;
  }

  // 检查内容
  if (!content.value.trim()) {
    message.warning('请输入内容');
    return;
  }

  // 检查定时发布时间
  if (publishType.value === 'timing' && !selectedDate.value) {
    message.warning('请选择发布时间');
    return;
  }

  try {
    const postData: PostData = {
      title: title.value,
      content: content.value,
      images: imageList.value,
      timing: publishType.value === 'timing',
      plateId: selectedModule.value.plateId
    };

    // 只有在定时发布时才添加发布时间
    if (publishType.value === 'timing' && selectedDate.value) {
      postData.publishTime = selectedDate.value.valueOf();
    }

    console.log('postData', postData); // 添加日志
    const res = await articleApi.publishArticle(postData);
    console.log('res', res);
    message.success('发布成功');
    userStorage.addPosts();
    router.push('/')
  } catch (error) {
    message.error('发布失败');
  }
};

// 修改选择模块函数
const selectModule = (module: ModuleInfo) => {
  console.log('Selected module:', module); // 添加日志
  selectedModule.value = {
    plateId: module.plateId,  // 使用 plateId
    name: module.name,
    icon: module.icon,
    count: module.count,
    topics: module.topics,
    posts: module.posts,
    lastPost: module.lastPost,
    path: module.path
  };
  moduleModalVisible.value = false;
};

// 组件卸载时清除防抖函数
onUnmounted(() => {
  debouncedFetchModuleList.cancel();
});

// 修改样式计算属性
const toolItemStyle = computed(() => ({
  'tool-item': true,
  'selected': selectedModule.value !== null
}));

// 清空最近使用的表情
const clearRecentEmojis = () => {
  emojiData.recent = [];
  saveRecentEmojis([]);
};
</script>

<style lang="less" scoped>
.release-container {
  background-color: #fff;
  display: flex;
  justify-content: center;
  padding: 20px;
  min-height: 100vh;
}

.main-content {
  width: 800px; // 使用固定宽度替代 60vw
  max-width: 90%; // 在小屏幕上自适应

  .title-area {
    padding: 20px 24px 0;
    border-bottom: 1px solid #e8e8e8;

    .title-input {
      font-size: 16px;
      font-weight: 500;

      :deep(.ant-input) {
        border: none;
        padding: 8px 0;

        &:focus {
          box-shadow: none;
        }
      }
    }
  }

  .content-area {
    padding: 20px 24px;

    .content-input {
      resize: none;
      font-size: 16px;
    }

    .image-preview {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); // 使用固定像素
      gap: 12px;
      margin-top: 16px;

      .image-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 4px;
        overflow: hidden;

        .delete-icon {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px;
        }
      }
    }
  }

  .toolbar {
    border-top: 1px solid #e8e8e8;
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;

    .left-tools {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      .tool-item {
        padding: 6px 8px;
        font-size: 14px;
        gap: 4px;
      }
    }

    .right-tools {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }
}

.emoji-container {
  width: 420px; // 使用固定宽度
  height: 360px;
  max-width: 90vw; // 在小屏幕上自适应

  .emoji-nav {
    padding: 8px 12px;
    display: flex; // 添加横向布局
    gap: 4px; // 添加间距
    justify-content: space-between; // 均匀分布
    width: 100%; // 占满整行

    .nav-item {
      padding: 6px 12px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s;
      flex: 1; // 平均分配空间

      &:hover {
        background-color: #f5f5f5;
      }

      &.active {
        background-color: #e6f7ff;
        color: #1890ff;
      }
    }
  }

  .emoji-content {
    height: calc(100% - 48px); // 减去导航的高度
    overflow-y: auto;

    .emoji-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr); // 固定8列布局
      gap: 8px;
      padding: 12px;

      .emoji-item {
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background-color: #f5f5f5;
        }
      }
    }
  }
}

// 媒体查询优化
@media screen and (max-width: 768px) {
  .main-content {
    width: 100%;

    .toolbar {
      .left-tools {
        justify-content: flex-start; // 改为左对齐
        gap: 8px; // 减小间距
      }
    }
  }

  .emoji-container {
    width: 320px; // 小屏幕下的固定宽度
  }
}

@media screen and (max-width: 480px) {
  .main-content {
    .toolbar {
      .tool-item {
        padding: 4px 6px; // 减小内边距

        span {
          display: none; // 隐藏文字
        }
      }
    }
  }
}

// 工具项样式优化
.tool-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  padding: 6px 8px;
  white-space: nowrap;
  border-radius: 4px;
  transition: all 0.3s;

  .module-icon {
    width: 18px;
    height: 18px;
  }

  &.selected {
    color: #1890ff;
    background-color: #e6f7ff;
  }

  &:hover {
    color: #1890ff;
    background-color: #f5f5f5;
  }
}

:deep(.emoji-popover) {
  .ant-popover-inner {
    padding: 0;
  }

  .ant-popover-inner-content {
    padding: 0;
  }
}

.module-selector {
  .module-tabs {
    :deep(.ant-tabs-nav) {
      margin-bottom: 16px;

      &::before {
        border-bottom: 1px solid #f0f0f0;
      }

      .ant-tabs-tab {
        padding: 12px 20px;
        font-size: 1rem;
        transition: all 0.3s;

        &:hover {
          color: #1890ff;
        }

        &.ant-tabs-tab-active {
          .ant-tabs-tab-btn {
            color: #1890ff;
            font-weight: 500;
          }
        }
      }

      .ant-tabs-ink-bar {
        background: #1890ff;
        height: 2px;
      }
    }
  }

  .module-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding: 4px;

    .module-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid #e8e8e8;
      background: #fff;
      min-width: 0;

      &:hover {
        background-color: #f5f5f5;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &.active {
        background-color: #e6f7ff;
        border-color: #1890ff;

        .module-name {
          color: #1890ff;
        }
      }

      .module-icon {
        width: 48px;
        height: 48px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 12px;
        transition: all 0.3s ease;
      }

      .module-name {
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 8px;
        width: 100%;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .module-info {
        width: 100%;
        font-size: 12px;
        color: #999;
        display: flex;
        justify-content: center;
        gap: 12px;

        span {
          white-space: nowrap;
        }
      }

      &:hover {
        .module-icon {
          transform: scale(1.1);
        }
      }
    }
  }
}

:deep(.ant-modal-content) {
  .ant-modal-header {
    border-bottom: none;
    padding: 24px 24px 0;

    .ant-modal-title {
      font-size: 1.125rem;
      font-weight: 600;
    }
  }

  .ant-modal-body {
    padding: 24px;
  }
}

// 添加滚动条的全局样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

:deep(.time-picker-popover) {
  .ant-popover-inner-content {
    padding: 12px;
  }

  .ant-popover-arrow {
    left: 50% !important;
  }
}

.time-picker-container {
  .time-picker-footer {
    margin-top: 12px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .ant-picker {
    width: 240px;
  }
}
</style>