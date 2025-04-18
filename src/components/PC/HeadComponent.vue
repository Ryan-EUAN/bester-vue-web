<template>
  <div class="nav-wrapper" ref="boxRef" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave"
    :class="{ 'dark-mode': isDarkMode }">

    <nav class="nav-container" :class="{ 'light-mode': !isDarkMode, 'dark-mode': isDarkMode }">
      <div class="nav-links">
        <template v-for="(item, index) in navItems" :key="index">
          <router-link v-if="!item.children" :to="item.path" class="nav-link" :class="{ 'active-link': false }"
            @click="handleNavLinkClick(item.key)">
            <component :is="item.icon" />
            <span>{{ item.label }}</span>
          </router-link>

          <div v-else class="nav-link dropdown-link" :class="{ 'active-link': false }">
            <a-dropdown :trigger="['hover']" placement="bottomCenter">
              <div class="dropdown-trigger">
                <component :is="item.icon" />
                <span>{{ item.label }}</span>
              </div>
              <template #overlay>
                <a-menu>
                  <a-menu-item v-for="child in item.children" :key="child.key">
                    <router-link :to="child.path" class="dropdown-item"
                      @click="handleNavLinkClick(`${item.key}-${child.key.split('-')[1]}`)">
                      <component :is="child.icon" />
                      <span>{{ child.label }}</span>
                    </router-link>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </template>
      </div>
      <div class="user-section">
        <button class="theme-toggle" @click="toggleTheme">
          <component :is="icons.BulbOutlined" v-if="!isDarkMode" />
          <component :is="icons.BulbFilled" v-else />
        </button>
        <a-input-search v-model:value="searchValue" placeholder="搜索" class="search-input" @search="onSearch" />
        <a-popover placement="bottom" v-if="userInfo.id == 0">
          <template #title>
            <span class="popover-title">登录后你可以：</span>
          </template>
          <template #content>
            <a-flex wrap="wrap" gap="small" justify="center" class="login-popover">
              <a-space size="small" v-for="p in LoginPopover" :key="p.label">
                <component :is="renderIcon(p.icon)" />
                <div>{{ p.label }}</div>
              </a-space>
              <el-button color="#00aee0" class="login-btn" @click="handleOpenLogin">立即登录</el-button>
              <a-flex class="register-text">
                <div>首次使用？</div>
                <div class="register-text-btn" @click="handleOpenLogin">点我注册</div>
              </a-flex>
            </a-flex>
          </template>
          <a-avatar :src="userInfo.avatar" size="35" class="login-avatar" @click="handleOpenLogin">
            {{ userInfo.name }}
          </a-avatar>
        </a-popover>
        <a-popover placement="bottom" v-else :overlayClassName="'user-popover'">
          <template #content>
            <a-card class="user-card" :bordered="false">
              <div class="avatar-wrapper">
                <a-avatar :size="55" :src="userInfo.avatar || '/default-avatar.png'" />
              </div>
              <div class="card-content">
                <div class="user-name">{{ userInfo.name }}</div>
                <div class="currency-info">
                  <span>硬币: {{ userInfo.hardCurrency || 878 }}</span>
                  <span>贝币: {{ userInfo.bCurrency || 0 }}</span>
                </div>
                <div class="level-progress">
                  <div class="progress-wrapper">
                    <span class="current-level">Lv.{{ (userInfo.nextLevel || 1) - 1 }}</span>
                    <a-tooltip placement="top">
                      <template #title>
                        距离升级到 Lv.{{ userInfo.nextLevel || 1 }} 还需 {{ userInfo.needGrowth || 500 }} 经验
                      </template>
                      <a-progress :percent="calculateProgress()" :stroke-width="4" :show-info="false" status="active"
                        stroke-color="#00aee0" class="progress-bar" />
                    </a-tooltip>
                    <span class="next-level">Lv.{{ userInfo.nextLevel || 1 }}</span>
                  </div>
                </div>
                <div class="stats-row">
                  <div class="stat-item">
                    <div class="number">{{ userInfo.following || 0 }}</div>
                    <div class="label">关注</div>
                  </div>
                  <div class="stat-item">
                    <div class="number">{{ userInfo.followers || 0 }}</div>
                    <div class="label">粉丝</div>
                  </div>
                  <div class="stat-item">
                    <div class="number">{{ userInfo.posts || 0 }}</div>
                    <div class="label">动态</div>
                  </div>
                </div>
                <a-menu class="user-menu" v-model:selectedKeys="selectedMenuKeys">
                  <a-menu-item key="profile" @click="goToPersonal">
                    <component :is="icons.UserOutlined" />个人中心
                    <component :is="icons.RightOutlined" class="menu-arrow" />
                  </a-menu-item>
                  <a-menu-item key="posts" @click="$router.push('/release')">
                    <component :is="icons.FileOutlined" />发表文章
                    <component :is="icons.RightOutlined" class="menu-arrow" />
                  </a-menu-item>
                  <a-menu-item key="recommend">
                    <component :is="icons.StarOutlined" />推荐服务
                    <component :is="icons.RightOutlined" class="menu-arrow" />
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="logout" danger @click="logOut">
                    <component :is="icons.LogoutOutlined" />退出登录
                  </a-menu-item>
                </a-menu>
              </div>
            </a-card>
          </template>
          <a-avatar :src="userInfo.avatar" :size="35" class="login_css">
            {{ userInfo.name }}
          </a-avatar>
        </a-popover>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref, h, onBeforeUnmount, watch } from 'vue';
import * as icons from '@ant-design/icons-vue';
import { ElButton, ElNotification } from 'element-plus';
import { message } from 'ant-design-vue';
import type { HeadUserInfoModal } from '@/model/headInfo';
import AuthApi from '@/services/auth';
import { useRouter } from 'vue-router';
import userStorage from '@/utils/userStorage';
import { getCurrentTheme, toggleTheme as toggleGlobalTheme, initTheme as initGlobalTheme, onThemeChange } from '@/utils/themeUtils';
import eventBus from '@/utils/eventBus';

const emits = defineEmits(['openLogin']);
const router = useRouter();
// 添加背景动画相关的ref
const boxRef = ref<HTMLElement | null>(null);
const backgroundRef = ref<HTMLElement | null>(null);
let rafId: number | null = null;
const isDarkMode = ref(true); // 默认夜间模式

// 主题切换函数
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  toggleGlobalTheme(); // 调用全局主题切换函数
};

// 初始化主题
const initTheme = () => {
  // 使用工具函数初始化全局主题
  initGlobalTheme();

  // 同步本地组件的主题状态
  isDarkMode.value = getCurrentTheme() === 'dark';
};

// 处理鼠标移出事件
const handleMouseLeave = () => {
  if (!backgroundRef.value) return;

  if (rafId) {
    cancelAnimationFrame(rafId);
  }

  // 重置transform效果
  backgroundRef.value.style.transform = `
      scale(1) 
      translate3d(0, 0, 0)
  `;
};

// 使用 RAF 和防抖优化鼠标移动处理
const handleMouseMove = (e: MouseEvent) => {
  if (!boxRef.value || !backgroundRef.value || !isDarkMode.value) return;

  if (rafId) {
    cancelAnimationFrame(rafId);
  }

  rafId = requestAnimationFrame(() => {
    const { clientX, clientY } = e;
    const { width, height } = boxRef.value!.getBoundingClientRect();

    // 减小移动系数，使动画更流畅
    const xPercentage = (clientX / width - 0.5) * 1.5;
    const yPercentage = (clientY / height - 0.5) * 1.5;

    // 直接操作 transform 属性，减少查询DOM
    backgroundRef.value!.style.transform = `
          scale(1.02) 
          translate3d(${xPercentage * 15}px, ${yPercentage * 15}px, 0)
      `;
  });
};

// 导航菜单配置数据
const navItems = ref([
  {
    label: '首页',
    key: 'menu-1',
    icon: icons.HomeOutlined,
    path: '/'
  },
  {
    label: 'Bester低代码开发框架',
    key: 'menu-2',
    icon: icons.CodeOutlined,
    path: '/bester-frame'
  },
  {
    label: '在线音乐',
    key: 'menu-3',
    icon: icons.CustomerServiceOutlined,
    path: '/music'
  },
  {
    label: '快捷导航',
    key: 'menu-4',
    icon: icons.CompassOutlined,
    path: '', // 父级不需要路径
    children: [
      {
        label: '排行榜',
        key: 'submenu-51',
        icon: icons.TrophyOutlined,
        path: '/ph'
      },
      {
        label: '每日签到',
        key: 'submenu-52',
        icon: icons.CalendarOutlined,
        path: '/qd'
      }
    ]
  }
]);

// 计算等级进度
const calculateProgress = () => {
  // 默认值，如果没有真实数据
  const defaultProgress = 70;

  if (!userInfo.value.growth) {
    return defaultProgress;
  }

  // 计算进度百分比
  // 假设每个等级需要10000成长值
  const levelThreshold = 10000;
  const needGrowth = userInfo.value.needGrowth || 500;

  // 已获得的成长值占总需要成长值的百分比
  const achieved = levelThreshold - needGrowth;
  const percent = Math.min(Math.floor((achieved / levelThreshold) * 100), 100);
  return percent;
};

const current = ref<string[]>(['menu-1']);
const searchValue = ref('');
const isMobile = ref<boolean>(window.innerWidth <= 768);
const selectedMenuKeys = ref<string[]>([]);

// 根据当前路径更新菜单选中状态
const updateSelectedMenuKeys = () => {
  const currentPath = router.currentRoute.value.path;
  if (currentPath.startsWith('/personal')) {
    selectedMenuKeys.value = ['profile'];
  } else if (currentPath.startsWith('/release')) {
    selectedMenuKeys.value = ['posts'];
  } else {
    selectedMenuKeys.value = [];
  }
};

// 监听路由变化，更新菜单选中状态
watch(
  () => router.currentRoute.value.path,
  () => {
    updateSelectedMenuKeys();
  }
);

const userInfo = ref<HeadUserInfoModal>({
  id: 0,
  name: "登录",
  avatar: '',
  hardCurrency: 0,
  bCurrency: 0,
  nextLevel: 0,
  needGrowth: 0,
  following: 0,
  followers: 0,
  posts: 0
});

const LoginPopover = [
  {
    label: '免费获取资源',
    icon: 'FileZipTwoTone',
  },
  {
    label: '多端共享资源',
    icon: 'CloudTwoTone',
  },
  {
    label: '发布技术招聘',
    icon: 'ContainerTwoTone',
  },
  {
    label: '发布评论/点赞',
    icon: 'LikeTwoTone',
  }
];

const renderIcon = (iconName: string | undefined) => {
  if (!iconName) return null;
  // @ts-ignore
  if (!iconName || !icons[iconName]) {
    console.error(`无效的图标名称：${iconName}`);
    return null;
  }
  // @ts-ignore
  return h(icons[iconName]);
};

// 处理导航链接点击
const handleNavLinkClick = (key: string) => {
  current.value = [key];
};

//搜索方法
const onSearch = (value: string) => {
  if (!value.trim()) {
    message.warning('请输入搜索内容');
    return;
  }

  console.log('搜索内容', value);

  // 跳转到搜索结果页面，无需登录验证
  router.push({
    path: '/search',
    query: { keyword: value }
  });
};

// 登录相关方法
const handleOpenLogin = () => {
  // 添加调试日志
  console.log('触发登录事件: handleOpenLogin');

  // 使用事件总线触发登录事件
  eventBus.emit('showLoginModal', {
    redirect: router.currentRoute.value.fullPath
  });

  // 同时仍保留原来的方式，确保兼容性
  window.dispatchEvent(new CustomEvent('showLoginModal', {
    detail: {
      redirect: router.currentRoute.value.fullPath
    }
  }));

  console.log('登录事件已触发，当前路径：', router.currentRoute.value.fullPath);
};

//退出登陆方法
const logOut = async () => {
  // 先清除本地存储和更新UI，确保用户体验流畅
  userStorage.logOut();
  userInfo.value = {
    id: 0,
    avatar: "",
    name: "登录",
    hardCurrency: 0,
    bCurrency: 0,
    nextLevel: 0,
    needGrowth: 0,
    following: 0,
    followers: 0,
    posts: 0
  };

  // 显示通知
  ElNotification({
    title: '鉴权系统',
    message: '您已退出登录',
    type: 'warning',
    duration: 2500,
  });

  // 触发用户信息更新事件
  window.dispatchEvent(new CustomEvent('userInfoUpdated'));

  // 更新本地用户信息显示
  LoadUserInfo();

  // 后台异步调用登出API，不阻塞UI
  try {
    await AuthApi.LOG_OUT_API();
  } catch (error) {
    console.error('登出API调用失败', error);
    // 即使API调用失败，本地登出已经完成，不影响用户体验
  }
};

//监听窗口大小变化判断是否是手机端
function updateMobile() {
  isMobile.value = window.innerWidth <= 768;
}

//加载用户信息
function LoadUserInfo() {
  let infoStr = localStorage.getItem('userInfo');
  if (infoStr) {
    let info = JSON.parse(infoStr);
    userInfo.value = {
      posts: info.posts,
      followers: info.followers,
      following: info.following,
      name: info.name,
      avatar: info.avatar,
      id: info.id,
      hardCurrency: 0,
      bCurrency: 0,
      nextLevel: 0,
      needGrowth: 0
    };
  } else {
    userInfo.value = {
      posts: 0,
      followers: 0,
      following: 0,
      name: "登录",
      avatar: "",
      id: 0,
      hardCurrency: 0,
      bCurrency: 0,
      nextLevel: 0,
      needGrowth: 0
    };
  }
}

// 跳转到个人中心
const goToPersonal = () => {
  router.push('/personal');
};

// 从localStorage获取用户信息
const getUserInfoFromStorage = () => {
  LoadUserInfo();
};

// 监听登录事件
const handleLoginSuccess = () => {
  getUserInfoFromStorage();
};

// 创建自定义事件监听器
window.addEventListener('loginSuccess', handleLoginSuccess);

onBeforeMount(() => {
  // 初始化主题
  initTheme();
});

// 声明主题监听器移除函数
let themeChangeUnsubscribe: (() => void) | null = null;

onMounted(() => {
  window.addEventListener('resize', updateMobile);
  getUserInfoFromStorage();
  // 监听用户信息更新事件
  window.addEventListener('userInfoUpdated', getUserInfoFromStorage);
  LoadUserInfo();

  // 监听主题变化，保持组件状态同步
  themeChangeUnsubscribe = onThemeChange((theme) => {
    isDarkMode.value = theme === 'dark';
  });

  // 初始化菜单选中状态
  updateSelectedMenuKeys();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMobile);
  window.removeEventListener('userInfoUpdated', getUserInfoFromStorage);
  window.removeEventListener('loginSuccess', handleLoginSuccess);

  // 移除主题变化监听器
  if (themeChangeUnsubscribe) {
    themeChangeUnsubscribe();
  }

  // 清理 RAF
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
});
</script>

<style lang="less" scoped>
.nav-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  perspective: 100vw;
  transform-style: preserve-3d;
  transition: background-color 0.3s ease;
  background-color: #f5f5f5; // 白天模式背景色

  &.dark-mode {
    background-color: transparent; // 夜间模式不需要背景色，由background-layer提供
  }

  // 背景层
  .background-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 102%;
    height: 102%;
    transition: transform 0.2s ease-out;
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
    z-index: 0;
    background: radial-gradient(ellipse at bottom, #0f2447 0%, #06101f 60%, #02050a 100%);

    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background-image:
        radial-gradient(white, rgba(255, 255, 255, 0.2) 2px, transparent 2px),
        radial-gradient(white, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
        radial-gradient(white, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
        radial-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1) 1px, transparent 1px);
      background-size: 550px 550px, 350px 350px, 250px 250px, 150px 150px;
      background-position: 0 0, 40px 60px, 130px 270px, 70px 100px;
      animation: twinkleBackground 15s linear infinite;
    }
  }

  // 星星效果
  .star {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff;
    animation: twinkle 3s infinite;
    z-index: 1;
  }

  .star1 {
    width: 2px;
    height: 2px;
    top: 20%;
    left: 25%;
    animation-delay: 0s;
  }

  .star2 {
    width: 3px;
    height: 3px;
    top: 35%;
    right: 30%;
    animation-delay: 1s;
  }

  .star3 {
    width: 2px;
    height: 2px;
    bottom: 40%;
    left: 60%;
    animation-delay: 2s;
  }

  .star4 {
    width: 3px;
    height: 3px;
    bottom: 30%;
    right: 40%;
    animation-delay: 1.5s;
  }

  // 流星效果
  .shooting-star {
    position: absolute;
    height: 1px;
    background: linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0));
    transform: rotate(-45deg);
    z-index: 1;
  }

  .shooting-star1 {
    top: 10%;
    left: 10%;
    width: 100px;
    animation: shootingStar 8s linear infinite;
    animation-delay: 0s;
  }

  .shooting-star2 {
    top: 30%;
    right: 20%;
    width: 80px;
    animation: shootingStar 6s linear infinite;
    animation-delay: 3s;
  }

  // 星云效果
  .nebula {
    position: absolute;
    border-radius: 50%;
    filter: blur(15px);
    animation: nebulaGlow 10s ease-in-out infinite alternate;
    z-index: 1;
  }

  .nebula1 {
    top: 10%;
    right: 15%;
    width: 300px;
    height: 300px;
    background: radial-gradient(ellipse at center,
        rgba(63, 94, 251, 0.2) 0%,
        rgba(70, 98, 252, 0.1) 20%,
        rgba(130, 68, 252, 0.08) 40%,
        rgba(184, 41, 251, 0.05) 60%,
        rgba(252, 70, 166, 0.03) 80%,
        transparent 100%);
  }
}

.nav-container {
  color: white;
  width: 100%;
  padding: 0 10vw;
  position: relative;
  height: 6vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1000;
  margin-bottom: 0;

  &.dark-mode {
    background-color: #0c1426;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }

  &.light-mode {
    background-color: #ffffff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    color: #333;
  }
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;

  .nav-link {
    display: flex;
    align-items: center;
    gap: 5px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    padding: 5px 10px;
    border-radius: 4px;
    transition: all 0.2s;
    position: relative;
    color: inherit;

    .anticon {
      font-size: 16px;
    }

    &.active-link {
      background-color: rgba(0, 174, 224, 0.1);
      color: #00aee0;
    }

    &:hover {
      background-color: rgba(0, 174, 224, 0.05);
    }

    .dark-mode & {
      color: white;

      &.active-link {
        background-color: rgba(255, 255, 255, 0.1);
        color: #00aee0;
      }

      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
    }
  }
}

.dropdown-link {
  position: relative;
  cursor: pointer;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.2s;
}

.dropdown-icon {
  font-size: 12px;
  margin-left: 2px;
  transition: transform 0.3s;
}

.dropdown-link:hover .dropdown-icon {
  transform: rotate(180deg);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

:deep(.nav-dropdown-menu) {
  .ant-dropdown-menu {
    padding: 4px 0;
    border-radius: 4px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    background-color: #fff;

    .ant-dropdown-menu-item {
      color: #333;

      &:hover {
        background-color: rgba(0, 174, 224, 0.05);
      }
    }
  }

  .dark-mode & .ant-dropdown-menu {
    background-color: #0c1426;
    border: 1px solid rgba(255, 255, 255, 0.1);

    .ant-dropdown-menu-item {
      color: rgba(255, 255, 255, 0.85);

      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
    }
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  white-space: nowrap;
  text-decoration: none;
  font-size: 14px;
  color: inherit !important;

  .anticon {
    font-size: 16px;
  }
}

// 主题切换按钮样式
.theme-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  transition: all 0.2s;

  .anticon {
    font-size: 18px;
    color: inherit;
  }
}

// 搜索框样式
.search-input {
  width: 180px;
}

// 登录相关样式
.login-avatar,
.login_css {
  background-color: #00aeec;
  font-weight: bold;
  cursor: pointer;
}

.login-popover {
  font-size: 0.875rem;
  width: 18vw;
}

.login-btn {
  width: 12vw;
}

// 用户卡片样式
.user-card {
  width: 240px;
  position: relative;
  background: #fff;
  border-radius: 0.8rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 0;
}

.avatar-wrapper {
  display: flex;
  justify-content: center;
  margin: 0;
  position: relative;
  z-index: 2;
}

.avatar-wrapper .ant-avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 5px;
  text-align: center;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 3px;
}

.currency-info {
  display: flex;
  justify-content: center;
  margin-bottom: 5px;
  gap: 15px;
  font-size: 0.8rem;
  color: #666;
}

.level-progress {
  margin-bottom: 8px;
  padding: 0 10px;
}

.progress-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 5px 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.progress-wrapper:hover {
  opacity: 0.9;
}

.progress-bar {
  flex: 1;
}

.current-level,
.next-level {
  font-size: 0.7rem;
  color: #666;
  flex-shrink: 0;
}

.current-level {
  color: #999;
}

.next-level {
  color: #00aee0;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0;
  padding: 5px 0;
  border-top: 1px solid #f5f5f5;
  border-bottom: 1px solid #f5f5f5;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 5px 0;
}

.number {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.label {
  font-size: 0.7rem;
  color: #999;
  margin-top: 0;
}

.user-menu {
  border: none;
  text-align: left;
}

.user-menu .ant-menu-item {
  padding: 0 15px;
  height: 32px;
  line-height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  background-color: transparent;
}

.user-menu .ant-menu-item:hover {
  background-color: #f8f8f8;
}

.user-menu .ant-menu-item:active {
  background-color: #f0f0f0;
}

.user-menu .ant-menu-item.ant-menu-item-selected {
  background-color: transparent;
  color: inherit;
}

.user-menu .ant-menu-item.ant-menu-item-selected:hover {
  background-color: #f8f8f8;
}

.user-menu .highlight-item {
  background-color: transparent;
}

.user-menu .highlight-item:hover {
  background-color: #f8f8f8;
}

.menu-arrow {
  font-size: 10px;
  color: #999;
}

.dark-theme {
  --primary-bg: #0c1426;
  --secondary-bg: #06101f;
  --primary-text: #e0e0e0;
  --secondary-text: #b0b0b0;
  --table-bg: #131c30;
  --table-row-hover: #1c2940;
  --card-bg: #0c1426;
  --border-color: rgba(255, 255, 255, 0.1);
  --accent-color: #00aee0;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --list-item-bg: #131c30;
  --list-item-hover: #1c2940;
  --post-title-color: #e0e0e0;
  --post-meta-color: #b0b0b0;
  --post-border: #192642;
  --button-bg: #1c2940;
  --button-text: #e0e0e0;
  --post-number-bg: #1c2940;
  --post-number-text: #00aee0;
  --forum-card-bg: #131c30;
  --forum-header-bg: #0d1629;
  --forum-item-bg: #182338;
  --forum-item-hover: #1f2c45;
}

/* 添加全局主题过渡效果 */
body,
html {
  transition: background-color 0.3s ease, color 0.3s ease;
}

body.dark-theme {
  background-color: var(--secondary-bg);
  color: var(--primary-text);
}

/* 表格样式适配主题 */
.dark-theme table,
.dark-table {
  background-color: transparent !important;
  color: var(--primary-text) !important;
  border-color: transparent !important;
}

.dark-theme tr:hover,
.dark-table tr:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.dark-theme th,
.dark-table th {
  background-color: transparent !important;
  color: var(--primary-text) !important;
  border-color: transparent !important;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.15) !important;
}

.dark-theme td,
.dark-table td {
  color: var(--primary-text) !important;
  border-color: transparent !important;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.15) !important;
}

/* 帖子列表适配主题 */
.dark-theme .post-item,
.dark-list .post-item {
  background-color: var(--list-item-bg) !important;
  border-color: var(--post-border) !important;
}

.dark-theme .post-title,
.dark-list .post-title {
  color: var(--post-title-color) !important;
}

.dark-theme .post-meta,
.dark-list .post-meta {
  color: var(--post-meta-color) !important;
}

.dark-theme .post-number,
.dark-list .post-number {
  background-color: var(--post-number-bg) !important;
  color: var(--post-number-text) !important;
}

/* 按钮适配主题 */
.dark-theme .button,
.dark-theme button:not(.theme-toggle) {
  background-color: var(--button-bg);
  color: var(--button-text);
  border-color: var(--border-color);
}

/* 卡片和容器适配主题 */
.dark-theme .card,
.dark-theme .container,
.dark-theme .el-card,
.dark-theme .ant-card,
.dark-card {
  background-color: var(--card-bg) !important;
  color: var(--primary-text) !important;
  border-color: var(--border-color) !important;
}

/* 文字颜色全局适配 */
.dark-theme {

  .ant-table,
  .el-table,
  .ant-list,
  .el-list,
  .ant-tabs,
  .el-tabs,
  .ant-modal,
  .el-dialog,
  .ant-dropdown-menu,
  .el-dropdown-menu,
  .ant-menu,
  .el-menu {
    color: var(--primary-text);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  .ant-typography,
  .el-typography {
    color: var(--primary-text);
  }

  p,
  span,
  div {
    color: inherit;
  }

  /* 日期和时间戳适配 */
  .date,
  .timestamp {
    color: var(--secondary-text) !important;
  }

  /* 帖子编号圆形标签 */
  .circle-number {
    background-color: var(--post-number-bg) !important;
    color: var(--post-number-text) !important;
  }

  /* 列表项分割线 */
  .divider,
  hr {
    border-color: var(--border-color) !important;
  }

  /* 主题标题和标签 */
  .theme-title,
  .theme-tag {
    color: var(--primary-text) !important;
  }

  /* 导航和选项卡适配 */
  .nav-tab,
  .tab {
    background-color: var(--secondary-bg);
    color: var(--primary-text);
    border-color: var(--border-color);
  }

  .nav-tab.active,
  .tab.active {
    background-color: var(--button-bg);
    color: var(--accent-color);
  }
}

/* 论坛主题列表样式 */
.dark-theme .forum-list {
  background-color: var(--forum-card-bg);
  color: var(--primary-text);

  .forum-header {
    background-color: var(--forum-header-bg);
    border-color: var(--border-color);
  }

  .thread-list-item {
    background-color: var(--forum-item-bg);
    border-color: var(--border-color);

    &:hover {
      background-color: var(--forum-item-hover);
    }

    .thread-title {
      color: var(--post-title-color);
    }

    .thread-meta {
      color: var(--post-meta-color);
    }

    .thread-number {
      background-color: var(--post-number-bg);
      color: var(--post-number-text);
    }
  }

  .post-circle {
    background-color: var(--post-number-bg);
    color: var(--post-number-text);
  }

  .date,
  .timestamp {
    color: var(--secondary-text);
  }
}

/* 白色背景卡片适配深色模式 */
.dark-theme {

  .white-card,
  .card-box,
  .module-card,
  .panel-card,
  .forum-card {
    background-color: var(--forum-card-bg) !important;
    border-color: var(--border-color) !important;

    .card-header,
    .panel-header,
    .card-title {
      background-color: var(--forum-header-bg);
      color: var(--primary-text);
      border-color: var(--border-color);
    }

    .card-body,
    .panel-body {
      color: var(--primary-text);
    }
  }

  /* 标签和选项卡 */
  .tab-menu,
  .tab-nav {
    border-color: var(--border-color);

    .tab-item {
      color: var(--secondary-text);
      border-color: transparent;

      &.active,
      &:hover {
        color: var(--primary-text);
        border-color: var(--accent-color);
        background-color: var(--forum-item-hover);
      }
    }
  }

  /* 列表项底色 */
  .list-row,
  .list-item,
  tr {
    background-color: var(--forum-item-bg);
    border-color: var(--border-color);

    &:hover {
      background-color: var(--forum-item-hover);
    }
  }

  /* 高亮标记 */
  .highlight-mark,
  .mark,
  .badge {
    background-color: var(--post-number-bg);
    color: var(--post-number-text);
  }
}

// 用户弹出窗口样式
.user-popover {
  .ant-popover-arrow {
    display: none;
  }

  .ant-popover-inner {
    border-radius: 0.8rem;
    overflow: hidden;
    padding: 0;
    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  }

  .ant-popover-inner-content {
    padding: 0;
  }

  .ant-card {
    border: none;
  }

  .ant-menu {
    box-shadow: none;
    border-radius: 0;
  }
}

// Tooltip样式覆盖
:deep(.ant-tooltip-inner) {
  font-size: 0.7rem;
  padding: 4px 8px;
}

.content-area {
  margin-left: 100px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.site-stat {
  font-size: 0.8rem;
  margin: 0 10px;
}

.site-stat-divider {
  margin: 0 5px;
  color: #ddd;
}

.input-container {
  position: relative;
}

.filter-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #999;
  padding: 0 12px;
}

.register-text-btn:hover {
  color: #00aee0;
  cursor: pointer;
}
</style>