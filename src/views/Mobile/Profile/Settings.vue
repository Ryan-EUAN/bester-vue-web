<template>
  <div class="user-settings">
    <van-nav-bar
      title="设置"
      left-arrow
      @click-left="goBack"
    />
    
    <div class="settings-container">
      <!-- 通知设置 -->
      <div class="settings-section">
        <div class="section-title">通知设置</div>
        <van-cell-group inset>
          <van-cell center title="接收新消息通知">
            <template #right-icon>
              <van-switch v-model="notificationSettings.newMessage" size="24" />
            </template>
          </van-cell>
          <van-cell center title="系统通知">
            <template #right-icon>
              <van-switch v-model="notificationSettings.systemNotice" size="24" />
            </template>
          </van-cell>
          <van-cell center title="声音">
            <template #right-icon>
              <van-switch v-model="notificationSettings.sound" size="24" />
            </template>
          </van-cell>
          <van-cell center title="振动">
            <template #right-icon>
              <van-switch v-model="notificationSettings.vibrate" size="24" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      
      <!-- 内容设置 -->
      <div class="settings-section">
        <div class="section-title">内容设置</div>
        <van-cell-group inset>
          <van-cell title="默认浏览内容" is-link @click="showContentTypePopup = true">
            <template #value>
              <span>{{ contentTypeOptions[contentSettings.defaultType] }}</span>
            </template>
          </van-cell>
          <van-cell title="字体大小" is-link @click="showFontSizePopup = true">
            <template #value>
              <span>{{ fontSizeOptions[contentSettings.fontSize] }}</span>
            </template>
          </van-cell>
          <van-cell center title="无图模式">
            <template #right-icon>
              <van-switch v-model="contentSettings.noImageMode" size="24" />
            </template>
          </van-cell>
          <van-cell center title="自动播放视频（仅WIFI）">
            <template #right-icon>
              <van-switch v-model="contentSettings.autoPlayVideo" size="24" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      
      <!-- 通用设置 -->
      <div class="settings-section">
        <div class="section-title">通用设置</div>
        <van-cell-group inset>
          <van-cell title="清除缓存" is-link @click="showClearCacheDialog">
            <template #value>
              <span>{{ cacheSize }}</span>
            </template>
          </van-cell>
          <van-cell title="多语言" is-link @click="showLanguagePopup = true">
            <template #value>
              <span>{{ languageOptions[generalSettings.language] }}</span>
            </template>
          </van-cell>
          <van-cell center title="自动检查更新">
            <template #right-icon>
              <van-switch v-model="generalSettings.autoCheckUpdate" size="24" />
            </template>
          </van-cell>
          <van-cell center title="夜间模式">
            <template #right-icon>
              <van-switch v-model="generalSettings.darkMode" size="24" @change="toggleDarkMode" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      
      <!-- 其他设置 -->
      <div class="settings-section">
        <div class="section-title">其他设置</div>
        <van-cell-group inset>
          <van-cell title="用户协议" is-link @click="gotoUserAgreement" />
          <van-cell title="隐私政策" is-link @click="gotoPrivacyPolicy" />
        </van-cell-group>
      </div>
    </div>
    
    <!-- 内容类型选择弹窗 -->
    <van-popup
      v-model:show="showContentTypePopup"
      round
      position="bottom"
    >
      <van-picker
        :columns="Object.values(contentTypeOptions).map(text => ({ text }))"
        @confirm="onContentTypeConfirm"
        @cancel="showContentTypePopup = false"
        :default-index="contentSettings.defaultType"
        show-toolbar
        title="默认浏览内容"
      />
    </van-popup>
    
    <!-- 字体大小选择弹窗 -->
    <van-popup
      v-model:show="showFontSizePopup"
      round
      position="bottom"
    >
      <van-picker
        :columns="Object.values(fontSizeOptions).map(text => ({ text }))"
        @confirm="onFontSizeConfirm"
        @cancel="showFontSizePopup = false"
        :default-index="contentSettings.fontSize"
        show-toolbar
        title="字体大小"
      />
    </van-popup>
    
    <!-- 语言选择弹窗 -->
    <van-popup
      v-model:show="showLanguagePopup"
      round
      position="bottom"
    >
      <van-picker
        :columns="Object.values(languageOptions).map(text => ({ text }))"
        @confirm="onLanguageConfirm"
        @cancel="showLanguagePopup = false"
        :default-index="generalSettings.language"
        show-toolbar
        title="多语言"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';

const router = useRouter();

// 通知设置
const notificationSettings = reactive({
  newMessage: true,
  systemNotice: true,
  sound: true,
  vibrate: true
});

// 内容设置
const contentSettings = reactive({
  defaultType: 0, // 0: 推荐, 1: 关注, 2: 热门
  fontSize: 1, // 0: 小, 1: 中, 2: 大, 3: 特大
  noImageMode: false,
  autoPlayVideo: true
});

// 通用设置
const generalSettings = reactive({
  language: 0, // 0: 简体中文, 1: 繁体中文, 2: English
  autoCheckUpdate: true,
  darkMode: false
});

// 缓存大小
const cacheSize = ref('23.5MB');

// 选项值映射
const contentTypeOptions: Record<number, string> = {
  0: '推荐',
  1: '关注',
  2: '热门'
};

const fontSizeOptions: Record<number, string> = {
  0: '小',
  1: '中',
  2: '大',
  3: '特大'
};

const languageOptions: Record<number, string> = {
  0: '简体中文',
  1: '繁体中文',
  2: 'English'
};

// 弹出层控制
const showContentTypePopup = ref(false);
const showFontSizePopup = ref(false);
const showLanguagePopup = ref(false);

// 内容类型确认
const onContentTypeConfirm = (value: { text: string }) => {
  const index = Object.values(contentTypeOptions).findIndex(item => item === value.text);
  if (index !== -1) {
    contentSettings.defaultType = index;
  }
  showContentTypePopup.value = false;
};

// 字体大小确认
const onFontSizeConfirm = (value: { text: string }) => {
  const index = Object.values(fontSizeOptions).findIndex(item => item === value.text);
  if (index !== -1) {
    contentSettings.fontSize = index;
    // 应用字体大小变化
    applyFontSize(index);
  }
  showFontSizePopup.value = false;
};

// 语言确认
const onLanguageConfirm = (value: { text: string }) => {
  const index = Object.values(languageOptions).findIndex(item => item === value.text);
  if (index !== -1) {
    generalSettings.language = index;
    // 应用语言变化
    applyLanguage(index);
  }
  showLanguagePopup.value = false;
};

// 应用字体大小
const applyFontSize = (sizeIndex: number) => {
  // 实际开发时应该使用全局状态管理或本地存储来保存设置
  // 这里只是简单的示例
  showToast(`已设置字体大小为: ${fontSizeOptions[sizeIndex]}`);
};

// 应用语言设置
const applyLanguage = (languageIndex: number) => {
  // 实际开发时应该使用i18n等多语言库来切换语言
  // 这里只是简单的示例
  showToast(`已切换语言为: ${languageOptions[languageIndex]}`);
};

// 切换夜间模式
const toggleDarkMode = (value: boolean) => {
  // 实际开发时应该使用主题管理库或CSS变量来切换主题
  // 这里只是简单的示例
  showToast(`夜间模式${value ? '开启' : '关闭'}`);
};

// 清除缓存
const showClearCacheDialog = () => {
  showDialog({
    title: '清除缓存',
    message: '确定要清除所有缓存吗？这可能会导致部分数据需要重新下载。',
    showCancelButton: true,
  }).then(() => {
    // 用户点击确认按钮
    clearCache();
  }).catch(() => {
    // 用户点击取消按钮
  });
};

// 清除缓存操作
const clearCache = () => {
  // 实际开发时应该调用相关API清除缓存
  // 这里只是简单的示例
  showToast('缓存清除成功');
  setTimeout(() => {
    cacheSize.value = '0KB';
  }, 500);
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 页面跳转函数
const gotoUserAgreement = () => {
  router.push('/agreement/user');
};

const gotoPrivacyPolicy = () => {
  router.push('/agreement/privacy');
};
</script>

<style lang="scss" scoped>
.user-settings {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 60px;
  
  .settings-container {
    padding: 12px 0;
    
    .section-title {
      font-size: 15px;
      color: #969799;
      padding: 0 16px;
      margin: 16px 0 8px;
    }
    
    .settings-section {
      margin-bottom: 16px;
    }
  }
}
</style> 