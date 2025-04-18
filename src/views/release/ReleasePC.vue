<template>
  <div class="release-container" :class="{ 'dark-mode': isDarkMode }">
    <div class="main-content">
      <!-- 标题输入区 -->
      <div class="title-area">
        <a-input v-model:value="title" placeholder="输入标题..." :maxLength="20" :show-count="true" class="title-input"
          :bordered="false" />
      </div>

      <!-- 内容输入区 -->
      <div class="content-area">
        <a-textarea v-model:value="content" placeholder="有什么新鲜事想分享给大家？" :auto-size="{ minRows: 10, maxRows: 19 }"
          :maxLength="2000" class="content-input" />
        <!-- 媒体预览区 -->
        <div class="media-preview">
          <div class="media-grid">
            <template v-for="(media, index) in sortedMediaList" :key="index">
              <!-- 图片项 -->
              <div v-if="media.type === 'image'" 
                   :class="['media-item', 'image-item', getMediaItemClass(index)]">
                <div class="media-wrapper">
                  <a-image 
                    :src="media.url" 
                    :alt="media.name"
                    :preview="{
                      src: media.url,
                      mask: false
                    }"
                  />
                  <div class="delete-overlay">
                    <a-button type="primary" danger shape="circle" @click.stop="handleMediaDelete(media)">
                      <template #icon><icon.DeleteOutlined /></template>
                    </a-button>
                  </div>
                </div>
              </div>
              <!-- 视频项 -->
              <div v-else 
                   :class="['media-item', 'video-item', getMediaItemClass(index)]">
                <div class="media-wrapper">
                  <video 
                    controls
                    :src="media.url"
                    class="video-player"
                    preload="metadata"
                    controlsList="nodownload"
                  ></video>
                  <div class="delete-overlay">
                    <a-button type="primary" danger shape="circle" @click="handleMediaDelete(media)">
                      <template #icon><icon.DeleteOutlined /></template>
                    </a-button>
                  </div>
                </div>
              </div>
            </template>
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
                      <icon.DeleteOutlined />
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
              <icon.SmileOutlined />
              <span>表情</span>
            </div>
          </a-popover>
          <a-upload 
            accept="image/*" 
            :multiple="true" 
            :max-count="9" 
            :show-upload-list="false"
            :customRequest="handleCustomImageUpload"
            :beforeUpload="beforeUpload">
            <div class="tool-item">
              <icon.PictureOutlined />
              <span>图片</span>
            </div>
          </a-upload>
          <a-upload 
            accept="video/*" 
            :max-count="1" 
            :show-upload-list="false"
            :customRequest="handleCustomVideoUpload"
            :beforeUpload="beforeUpload">
            <div class="tool-item">
              <icon.VideoCameraOutlined />
              <span>视频</span>
            </div>
          </a-upload>
          <div class="tool-item" @click="insertTopic">
            <icon.NumberOutlined />
            <span>话题</span>
          </div>
          <div class="tool-item">
            <icon.ThunderboltOutlined />
            <span>头条文章</span>
          </div>
          <div class="tool-item" @click="showModuleModal" :class="toolItemStyle">
            <template v-if="selectedModule">
              <img :src="selectedModule.icon" class="module-icon" :alt="selectedModule.name" />
              <span>{{ selectedModule.name }}</span>
            </template>
            <template v-else>
              <icon.AppstoreOutlined />
              <span>选择模块</span>
            </template>
          </div>
        </div>
        <div class="right-tools">
          <template v-if="showTimePicker">
            <div class="time-picker-container">
              <a-date-picker style="width: 12vw;" v-model:value="selectedDate" :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm"
                :disabledDate="disabledDate" :disabledTime="disabledTime" @change="handleTimeChange" />
              <div class="time-picker-footer">
                <a-button size="small" @click="cancelTimePicker">取消</a-button>
                <a-button type="primary" size="small" @click="handleTimeConfirm">确定</a-button>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="publish-buttons">
              <a-dropdown v-model:open="dropdownVisible" trigger="hover" placement="bottom">
                <div class="publish-type-selector">
                  <component :is="publishType === 'now' ? icon.SendOutlined : icon.ClockCircleOutlined" />
                  <span>{{ getPublishTypeText }}</span>
                </div>
                <template #overlay>
                  <a-menu @click="handleMenuClick">
                    <a-menu-item key="now">
                      <icon.SendOutlined />
                      <span>立即发布</span>
                    </a-menu-item>
                    <a-menu-item key="timing">
                      <icon.ClockCircleOutlined />
                      <span>定时发布</span>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <a-button type="primary" size="small" @click="publishPost">发送</a-button>
            </div>
          </template>
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
import * as icon from '@ant-design/icons-vue';
import { emojiCategories, emojiData } from '@/utils/emojiData';
import moduleAPI from '@/services/module';
import articleApi from '@/services/article';
import { debounce } from 'lodash-es';
import dayjs, { Dayjs } from 'dayjs';
import type { ModuleInfo, CategoryData, PostData } from '@/types/release';
import router from '@/router';
import userStorage from '@/utils/userStorage';
import { getCurrentTheme, onThemeChange } from '@/utils/themeUtils';
import fileApi from '@/services/file';

const title = ref('');
const content = ref('');
const emojiVisible = ref(false);
const publishType = ref<'now' | 'timing'>('now');
const currentCategory = ref('emoji');
const RECENT_EMOJIS_KEY = 'recent_emojis';
const MAX_RECENT = 20;
const showTimePicker = ref(false);
const selectedDate = ref<Dayjs | null>(null);
const dropdownVisible = ref(false);

// 主题相关
const isDarkMode = ref(getCurrentTheme() === 'dark');

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

// 清理所有上传的媒体文件
const cleanupMediaFiles = async () => {
  try {
    // 删除所有已上传的图片
    const imagePromises = imageList.value.map(img => fileApi.DELETE_FILE_API(img.key));
    // 删除所有已上传的视频
    const videoPromises = videoList.value.map(video => fileApi.DELETE_FILE_API(video.key));
    
    await Promise.all([...imagePromises, ...videoPromises]);
    
    // 清空列表
    imageList.value = [];
    videoList.value = [];
  } catch (error) {
    console.error('清理媒体文件失败:', error);
  }
};

// 组件挂载时加载最近使用的表情
onMounted(() => {
  // 检查是否已登录
  const token = localStorage.getItem('token');
  const userInfo = localStorage.getItem('userInfo');

  if (!token || !userInfo) {
    window.dispatchEvent(new CustomEvent('showLoginModal', {
      detail: {
        redirect: '/release'
      }
    }));
    return;
  }
  
  loadRecentEmojis();

  // 监听主题变化
  const unsubscribe = onThemeChange((theme) => {
    isDarkMode.value = theme === 'dark';
  });

  // 添加页面刷新和关闭事件监听
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    cleanupMediaFiles();
    e.preventDefault();
    e.returnValue = '';
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  // 组件卸载时清理
  onUnmounted(() => {
    unsubscribe();
    window.removeEventListener('beforeunload', handleBeforeUnload);
    debouncedFetchModuleList.cancel();
    // 如果不是发布成功状态，清理文件
    if (!isPublishSuccess.value) {
      cleanupMediaFiles();
    }
  });
});

// 修改视频信息类型定义
interface VideoInfo {
  url: string;    // 视频播放地址
  key: string;    // 存储标识
  name: string;   // 文件名
  type: string;   // 媒体类型
  poster?: string; // 可选：视频封面图
}

// 修改图片列表类型
interface ImageItem {
  url: string;
  key: string;
}

// 修改图片列表的 ref 类型
const imageList = ref<ImageItem[]>([]);

// 修改视频列表的 ref 类型
const videoList = ref<VideoInfo[]>([]);

// 计算剩余可上传数量
const remainingMediaCount = computed(() => {
  const totalCount = 8; // 总共允许9个媒体文件
  const currentCount = videoList.value.length + imageList.value.length;
  return totalCount - currentCount;
});

// 计算剩余可上传视频数量
const remainingVideoCount = computed(() => {
  const maxVideos = 4; // 最多4个视频
  return Math.min(maxVideos - videoList.value.length, remainingMediaCount.value);
});

// 计算剩余可上传图片数量
const remainingImageCount = computed(() => {
  const maxImages = 9 - videoList.value.length; // 根据视频数量动态调整
  return Math.min(maxImages - imageList.value.length, remainingMediaCount.value);
});

// 修改视频上传前检查
const beforeUpload = (file: File) => {
  // 图片类型检查
  if (file.type.startsWith('image/')) {
    if (remainingImageCount.value <= 0) {
      message.warning('已达到图片上传上限');
      return false;
    }
    const isValidImage = file.type === 'image/jpeg' || 
                        file.type === 'image/png' || 
                        file.type === 'image/gif' ||
                        file.type === 'image/webp';
    if (!isValidImage) {
      message.error('只支持 JPG/PNG/GIF/WEBP 格式的图片！');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！');
      return false;
    }
  }
  // 视频类型检查
  if (file.type.startsWith('video/')) {
    if (remainingVideoCount.value <= 0) {
      message.warning('已达到视频上传上限');
      return false;
    }
    const isValidVideo = file.type === 'video/mp4' || 
                        file.type === 'video/webm';
    if (!isValidVideo) {
      message.error('只支持 MP4/WEBM 格式的视频！');
      return false;
    }
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      message.error('视频大小不能超过 50MB！');
      return false;
    }
  }
  return true;
};

// 修改视频上传处理函数
const handleCustomVideoUpload = async (options: any) => {
  // @ts-ignore
  const { file, onSuccess, onError, onProgress } = options;
  try {
    console.log('开始上传视频:', file.name);
    const res = await fileApi.UPLOAD_FILE_API(file, 'video');
    if (res.code === 200 && res.data) {
      console.log('视频上传成功，数据:', res.data);
      // 检查返回的数据结构
      if (!res.data.url || !res.data.key) {
        message.error('视频上传返回数据格式错误');
        onError();
        return;
      }

      // 添加到视频列表
      videoList.value.push({
        url: res.data.url,      // 视频播放地址
        key: res.data.key,      // 视频存储的唯一标识
        name: res.data.key.split('/').pop() || '',  // 从key中提取文件名
        type: 'video',           // 标记为视频类型
        poster: res.data.url.replace(/\.[^.]+$/, '.jpg')  // 可选：视频封面图，如果后端支持的话
      });
      
      console.log('当前视频列表:', videoList.value);
      onSuccess(res.data);
      message.success('视频上传成功');
    } else {
      console.error('视频上传失败:', res);
      onError();
      message.error('视频上传失败');
    }
  } catch (error) {
    console.error('视频上传出错:', error);
    onError();
    message.error('视频上传失败');
  }
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
    // 设置默认时间为一小时后
    selectedDate.value = dayjs().add(1, 'hour');
    showTimePicker.value = true;
    dropdownVisible.value = false;
  }
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
  publishType.value = 'timing';
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

// 添加发布状态标记
const isPublishSuccess = ref(false);

// 修改发布帖子函数
const publishPost = async () => {
  // 检查模块选择
  if (!selectedModule.value) {
    message.warning('请先选择模块');
    return;
  }

  // 检查内容：当没有图片和视频时，必须有文字内容
  const hasMedia = imageList.value.length > 0 || videoList.value.length > 0;
  if (!hasMedia && !content.value.trim()) {
    message.warning('请输入内容或上传图片/视频');
    return;
  }

  // 检查定时发布时间
  if (publishType.value === 'timing' && !selectedDate.value) {
    message.warning('请选择发布时间');
    return;
  }

  try {
    // 处理所有媒体信息
    const media = [
      ...imageList.value.map(img => ({
        url: img.url,
        key: img.key,
        name: img.key.split('/').pop() || '',
        type: 'image'
      })),
      ...videoList.value.map(video => ({
        url: video.url,
        key: video.key,
        name: video.name,
        type: 'video',
        poster: video.url.replace(/\.[^.]+$/, '.jpg')
      }))
    ];

    const postData: PostData = {
      title: title.value,
      content: content.value.trim(),
      images: media,
      timing: publishType.value === 'timing',
      plateId: selectedModule.value.plateId
    };

    if (publishType.value === 'timing' && selectedDate.value) {
      postData.publishTime = selectedDate.value.valueOf();
    }

    const res = await articleApi.publishArticle(postData);
    if (res.code === 200) {
      isPublishSuccess.value = true;
      message.success('发布成功');
      userStorage.addPosts();
      router.push('/');
    } else {
      message.error('发布失败');
    }
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

// 自定义图片上传处理函数
const handleCustomImageUpload = async (options: any) => {
  const { file, onSuccess, onError } = options;
  
  try {
    const response = await fileApi.UPLOAD_FILE_API(file, 'image');
    console.log('上传响应:', response); // 添加日志
    
    if (response && response.code === 200 && response.data) { // 修改判断条件
      // 添加到图片列表
      imageList.value.push({
        url: response.data.url,
        key: response.data.key
      });
      
      // 调用成功回调
      onSuccess(response.data);
      message.success('图片上传成功');
    } else {
      console.error('上传失败，响应数据:', response); // 添加错误日志
      throw new Error(response?.message || '上传失败');
    }
  } catch (error: any) {
    console.error('图片上传失败:', error);
    onError(error);
    message.error(typeof error === 'string' ? error : (error.message || '图片上传失败，请重试'));
  }
};

// 合并并排序媒体列表
const sortedMediaList = computed(() => {
  const allMedia = [
    ...imageList.value.map(img => ({
      ...img,
      type: 'image',
      name: img.key.split('/').pop() || ''
    })),
    ...videoList.value.map(video => ({
      url: video.url,
      key: video.key,
      type: 'video',
      name: video.name
    }))
  ];
  
  return allMedia;
});

// 获取媒体项的类名
const getMediaItemClass = (index: number) => {
  const totalCount = sortedMediaList.value.length;
  
  // 单个媒体项
  if (totalCount === 1) return 'full-width';
  
  // 两个媒体项
  if (totalCount === 2) return 'half-width';
  
  // 三个或更多媒体项
  if (totalCount >= 3) {
    if (totalCount === 3 && index === 2) return 'full-width-last';
    return 'third-width';
  }
  
  return '';
};

// 统一的媒体删除处理函数
const handleMediaDelete = async (media: any) => {
  try {
    const res = await fileApi.DELETE_FILE_API(media.key);
    if (res.code === 200) {
      if (media.type === 'image') {
        imageList.value = imageList.value.filter(item => item.key !== media.key);
      } else {
        videoList.value = videoList.value.filter(item => item.key !== media.key);
      }
      message.success('删除成功');
    } else {
      message.error('删除失败');
    }
  } catch (error) {
    console.error('删除出错:', error);
    message.error('删除失败');
  }
};
</script>

<style lang="less" scoped>
@import './releasePC.less';

.image-preview {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;

  .image-item {
    position: relative;
    aspect-ratio: 1;
    
    .image-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      overflow: hidden;

      :deep(.ant-image) {
        width: 100%;
        height: 100%;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .delete-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover {
        .delete-overlay {
          opacity: 1;
        }
      }
    }
  }
}

.image-preview a-image-group {
  display: contents;
}

// 暗色模式样式
.dark-mode {
  .image-preview {
    .image-item {
      .delete-overlay {
        background: rgba(0, 0, 0, 0.65);
      }
    }
  }
}

.video-preview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
  
  .video-item {
    position: relative;
    width: 100%;
    
    .video-wrapper {
      position: relative;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      background: #000;
      aspect-ratio: 16/9;
      
      .video-player {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .delete-overlay {
        position: absolute;
        top: 8px;
        right: 8px;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover {
        .delete-overlay {
          opacity: 1;
        }
      }
    }
  }
}

// 暗色模式样式
.dark-mode {
  .video-preview {
    .video-item {
      .video-wrapper {
        background: #141414;
      }
    }
  }
}

.media-preview {
  margin-top: 16px;
  width: 100%;
  max-width: 800px;

  .media-grid {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(4, 1fr);
    
    .media-item {
      position: relative;
      width: 100%;
      
      &.full-width {
        grid-column: span 2;
        max-width: 400px;
      }
      
      &.half-width {
        grid-column: span 2;
      }
      
      &.third-width {
        grid-column: span 1;
      }
      
      &.full-width-last {
        grid-column: span 2;
      }
      
      .media-wrapper {
        position: relative;
        width: 100%;
        border-radius: 4px;
        overflow: hidden;
        aspect-ratio: 16/9;
        background: #000;
        
        &:hover .delete-overlay {
          opacity: 1;
        }
      }
    }
    
    .image-item .media-wrapper {
      :deep(.ant-image) {
        width: 100%;
        height: 100%;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
    
    .video-item .media-wrapper {
      .video-player {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .delete-overlay {
      position: absolute;
      top: 4px;
      right: 4px;
      opacity: 0;
      transition: opacity 0.3s;
      background: rgba(0, 0, 0, 0.45);
      border-radius: 50%;
      padding: 2px;
      
      .ant-btn {
        width: 24px;
        height: 24px;
        font-size: 12px;
      }
    }
  }
}

// 暗色模式样式
.dark-mode {
  .media-preview {
    .media-grid {
      .media-item .media-wrapper {
        background: #141414;
      }
      
      .delete-overlay {
        background: rgba(0, 0, 0, 0.65);
      }
    }
  }
}
</style>