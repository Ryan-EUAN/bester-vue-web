<template>
  <div class="user-privacy">
    <van-nav-bar
      title="隐私设置"
      left-arrow
      @click-left="goBack"
    />
    
    <!-- 隐私说明 -->
    <div class="privacy-header">
      <div class="privacy-title">个人信息保护</div>
      <div class="privacy-desc">以下设置将影响其他用户能够查看的您的信息范围</div>
    </div>
    
    <!-- 隐私设置分类 -->
    <van-cell-group inset title="个人资料可见性" class="setting-group">
      <van-cell title="个人主页">
        <template #right-icon>
          <van-dropdown-menu direction="up" :overlay="true">
            <van-dropdown-item v-model="privacySettings.profileVisibility" :options="visibilityOptions" />
          </van-dropdown-menu>
        </template>
      </van-cell>
      
      <van-cell title="手机号码">
        <template #right-icon>
          <van-dropdown-menu direction="up" :overlay="true">
            <van-dropdown-item v-model="privacySettings.phoneVisibility" :options="visibilityOptions" />
          </van-dropdown-menu>
        </template>
      </van-cell>
      
      <van-cell title="邮箱">
        <template #right-icon>
          <van-dropdown-menu direction="up" :overlay="true">
            <van-dropdown-item v-model="privacySettings.emailVisibility" :options="visibilityOptions" />
          </van-dropdown-menu>
        </template>
      </van-cell>
      
      <van-cell title="生日">
        <template #right-icon>
          <van-dropdown-menu direction="up" :overlay="true">
            <van-dropdown-item v-model="privacySettings.birthdayVisibility" :options="birthdayOptions" />
          </van-dropdown-menu>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-cell-group inset title="社交隐私" class="setting-group">
      <van-cell title="谁可以关注我">
        <template #right-icon>
          <van-dropdown-menu direction="up" :overlay="true">
            <van-dropdown-item v-model="privacySettings.whoCanFollow" :options="followOptions" />
          </van-dropdown-menu>
        </template>
      </van-cell>
      
      <van-cell title="谁可以评论我的帖子">
        <template #right-icon>
          <van-dropdown-menu direction="up" :overlay="true">
            <van-dropdown-item v-model="privacySettings.whoCanComment" :options="commentOptions" />
          </van-dropdown-menu>
        </template>
      </van-cell>
      
      <van-cell title="谁可以给我发私信">
        <template #right-icon>
          <van-dropdown-menu direction="up" :overlay="true">
            <van-dropdown-item v-model="privacySettings.whoCanMessage" :options="messageOptions" />
          </van-dropdown-menu>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-cell-group inset title="内容隐私" class="setting-group">
      <van-cell title="我的帖子">
        <template #right-icon>
          <van-dropdown-menu direction="up" :overlay="true">
            <van-dropdown-item v-model="privacySettings.postsVisibility" :options="contentOptions" />
          </van-dropdown-menu>
        </template>
      </van-cell>
      
      <van-cell title="我的收藏">
        <template #right-icon>
          <van-dropdown-menu direction="up" :overlay="true">
            <van-dropdown-item v-model="privacySettings.favoritesVisibility" :options="contentOptions" />
          </van-dropdown-menu>
        </template>
      </van-cell>
      
      <van-cell title="我的关注">
        <template #right-icon>
          <van-dropdown-menu direction="up" :overlay="true">
            <van-dropdown-item v-model="privacySettings.followingVisibility" :options="contentOptions" />
          </van-dropdown-menu>
        </template>
      </van-cell>
    </van-cell-group>
    
    <!-- 黑名单管理 -->
    <van-cell-group inset title="黑名单管理" class="setting-group">
      <van-cell title="黑名单" is-link @click="gotoBlacklist">
        <template #value>
          <span>{{ blacklistedCount }}人</span>
        </template>
      </van-cell>
      
      <van-cell title="自动过滤垃圾评论">
        <template #right-icon>
          <van-switch v-model="privacySettings.filterSpam" size="24" />
        </template>
      </van-cell>
    </van-cell-group>
    
    <!-- 保存按钮 -->
    <div class="save-button">
      <van-button round block type="primary" @click="saveSettings" :loading="saving">
        保存设置
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';

const router = useRouter();
const saving = ref(false);
const blacklistedCount = ref(5);

// 可见性选项
const visibilityOptions = [
  { text: '所有人可见', value: 'public' },
  { text: '仅关注者可见', value: 'followers' },
  { text: '仅自己可见', value: 'private' }
];

// 生日选项
const birthdayOptions = [
  { text: '完整生日', value: 'full' },
  { text: '仅显示月日', value: 'month_day' },
  { text: '不显示', value: 'hidden' }
];

// 关注选项
const followOptions = [
  { text: '所有人', value: 'all' },
  { text: '我关注的人', value: 'following' }
];

// 评论选项
const commentOptions = [
  { text: '所有人', value: 'all' },
  { text: '我关注的人', value: 'following' },
  { text: '无人', value: 'none' }
];

// 私信选项
const messageOptions = [
  { text: '所有人', value: 'all' },
  { text: '我关注的人', value: 'following' },
  { text: '无人', value: 'none' }
];

// 内容选项
const contentOptions = [
  { text: '所有人可见', value: 'public' },
  { text: '仅关注者可见', value: 'followers' },
  { text: '仅自己可见', value: 'private' }
];

// 隐私设置
const privacySettings = reactive({
  profileVisibility: 'public',
  phoneVisibility: 'private',
  emailVisibility: 'private',
  birthdayVisibility: 'month_day',
  whoCanFollow: 'all',
  whoCanComment: 'all',
  whoCanMessage: 'following',
  postsVisibility: 'public',
  favoritesVisibility: 'followers',
  followingVisibility: 'public',
  filterSpam: true
});

// 前往黑名单页面
const gotoBlacklist = () => {
  router.push('/user/blacklist');
};

// 保存设置
const saveSettings = async () => {
  saving.value = true;
  
  try {
    // 这里应该调用实际的API保存隐私设置
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showToast('设置已保存');
  } catch (error) {
    console.error('保存失败:', error);
    showToast('保存失败，请重试');
  } finally {
    saving.value = false;
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 组件挂载时加载用户隐私设置
onMounted(() => {
  // 这里应该调用实际的API获取用户隐私设置
});
</script>

<style lang="scss" scoped>
.user-privacy {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 24px;
  
  .privacy-header {
    padding: 16px;
    margin-bottom: 4px;
    
    .privacy-title {
      font-size: 18px;
      font-weight: 600;
      color: #323233;
      margin-bottom: 6px;
    }
    
    .privacy-desc {
      font-size: 14px;
      color: #969799;
    }
  }
  
  .setting-group {
    margin-bottom: 12px;
    
    :deep(.van-cell-group__title) {
      padding: 16px 16px 8px;
      font-size: 15px;
    }
    
    :deep(.van-dropdown-menu) {
      height: 24px;
      min-width: 100px;
      
      .van-dropdown-menu__bar {
        height: 24px;
        
        .van-dropdown-menu__title {
          font-size: 14px;
        }
      }
    }
  }
  
  .save-button {
    padding: 24px 16px;
  }
}
</style> 