import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { message } from 'ant-design-vue';
import AuthApi from '@/services/auth';

import LayoutComponentMobile from '../components/Mobile/LayoutComponentMobile.vue';
import LayoutComponentPC from '../components/PC/LayoutComponentPC.vue';
import HomeMobile from '@/views/home/Mobile.vue'
import HomePC from '@/views/home/PC.vue'
import Login from '@/views/auth/login.vue';
import LoginMobile from '@/views/auth/loginMobile.vue';
import Register from '@/views/auth/register.vue'

const isMobile = window.innerWidth <= 768

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
    component: isMobile ? LayoutComponentMobile : LayoutComponentPC,
    children: [
      {
        path: '/home',
        name: 'Home',
        component: isMobile ? HomeMobile : HomePC,
      },
      {
        path: '/community',
        name: 'Community',
        component: () => import('@/views/Mobile/Community/index.vue'),
        meta: {
          title: '社区',
          platform: 'mobile'
        }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Mobile/Profile/index.vue'),
        meta: {
          title: '我的',
          platform: 'mobile'
        }
      },
      {
        path: '/user/posts',
        name: 'UserPosts',
        component: () => import('@/views/Mobile/Profile/Posts.vue'),
        meta: {
          title: '我的帖子',
          requiresAuth: true,
          platform: 'mobile'
        }
      },
      {
        path: '/user/favorites',
        name: 'UserFavorites',
        component: () => import('@/views/Mobile/Profile/Favorites.vue'),
        meta: {
          title: '我的收藏',
          requiresAuth: true,
          platform: 'mobile'
        }
      },
      {
        path: '/user/following',
        name: 'UserFollowing',
        component: () => import('@/views/Mobile/Profile/Following.vue'),
        meta: {
          title: '我的关注',
          requiresAuth: true,
          platform: 'mobile'
        }
      },
      {
        path: '/user/followers',
        name: 'UserFollowers',
        component: () => import('@/views/Mobile/Profile/Followers.vue'),
        meta: {
          title: '我的粉丝',
          requiresAuth: true,
          platform: 'mobile'
        }
      },
      {
        path: '/user/history',
        name: 'UserHistory',
        component: () => import('@/views/Mobile/Profile/History.vue'),
        meta: {
          title: '浏览历史',
          requiresAuth: true,
          platform: 'mobile'
        }
      },
      {
        path: '/user/messages',
        name: 'UserMessages',
        component: () => import('@/views/Mobile/Profile/Messages.vue'),
        meta: {
          title: '我的消息',
          requiresAuth: true,
          platform: 'mobile'
        }
      },
      {
        path: '/user/verify',
        name: 'UserVerify',
        component: () => import('@/views/Mobile/Profile/Verify.vue'),
        meta: {
          title: '实名认证',
          requiresAuth: true,
          platform: 'mobile'
        }
      },
      {
        path: '/user/security',
        name: 'UserSecurity',
        component: () => import('@/views/Mobile/Profile/Security.vue'),
        meta: {
          title: '账号安全',
          requiresAuth: true,
          platform: 'mobile'
        }
      },
      {
        path: '/user/privacy',
        name: 'UserPrivacy',
        component: () => import('@/views/Mobile/Profile/Privacy.vue'),
        meta: {
          title: '隐私设置',
          requiresAuth: true,
          platform: 'mobile'
        }
      },
      {
        path: '/user/help',
        name: 'UserHelp',
        component: () => import('@/views/Mobile/Profile/Help.vue'),
        meta: {
          title: '帮助与反馈',
          platform: 'mobile'
        }
      },
      {
        path: '/user/settings',
        name: 'UserSettings',
        component: () => import('@/views/Mobile/Profile/Settings.vue'),
        meta: {
          title: '设置',
          platform: 'mobile'
        }
      },
      {
        path: '/user/edit-profile',
        name: 'UserEditProfile',
        component: () => import('@/views/Mobile/Profile/EditProfile.vue'),
        meta: {
          title: '编辑资料',
          requiresAuth: true,
          platform: 'mobile'
        }
      },
      {
        path: '/user/blacklist',
        name: 'UserBlacklist',
        component: () => import('@/views/Mobile/Profile/Blacklist.vue'),
        meta: {
          title: '黑名单管理',
          requiresAuth: true,
          platform: 'mobile'
        }
      },
      {
        path: '/user/profile/:id',
        name: 'UserProfile',
        component: () => import('@/views/Mobile/Profile/UserProfile.vue'),
        meta: {
          title: '用户主页',
          platform: 'mobile'
        }
      },
      {
        path: '/personal',
        name: 'Personal',
        component: () => import('@/components/PC/PersonalLayout.vue'),
        redirect: '/personal/profile',
        children: [
          {
            path: 'profile',
            name: 'PersonalProfile',
            component: () => import('@/views/personal/Profile.vue'),
            meta: {
              title: '个人资料',
              requiresAuth: true
            }
          },
          {
            path: 'verify',
            name: 'PersonalVerify',
            component: () => import('@/views/personal/Verify.vue'),
            meta: {
              title: '实名认证',
              requiresAuth: true
            }
          },
          {
            path: 'points',
            name: 'PersonalPoints',
            component: () => import('@/views/personal/Points.vue'),
            meta: {
              title: '我的积分',
              requiresAuth: true
            }
          },
          {
            path: 'privacy',
            name: 'PersonalPrivacy',
            component: () => import('@/views/personal/Privacy.vue'),
            meta: {
              title: '隐私设置',
              requiresAuth: true
            }
          },
          {
            path: 'security',
            name: 'PersonalSecurity',
            component: () => import('@/views/personal/Security.vue'),
            meta: {
              title: '安全设置',
              requiresAuth: true
            }
          },
          {
            path: 'orders',
            name: 'PersonalOrders',
            component: () => import('@/views/personal/Orders.vue'),
            meta: {
              title: '我的订单',
              requiresAuth: true
            }
          }
        ]
      },
      {
        path: 'release',
        name: 'Release',
        component: () => import('@/views/release/ReleasePC.vue'),
        meta: {
          title: '发布',
          requiresAuth: true
        }
      },
      {
        path: '/article/:id',
        name: 'Article',
        component: () => import('@/views/post/PostPC.vue')
      },
      {
        path: '/module/:moduleId',
        name: 'ModuleArticleList',
        component: () => import('@/views/module/ArticleList.vue'),
        meta: {
          title: '模块文章列表'
        }
      },
      {
        path: '/chat',
        name: 'ChatList',
        component: () => import('@/views/Mobile/Chat/ChatList.vue'),
        meta: {
          title: '我的私信',
          requiresAuth: true,
          platform: 'mobile'
        }
      },
      {
        path: '/chat/:userId',
        name: 'Chat',
        component: () => import('@/views/Mobile/Chat/ChatDetail.vue'),
        meta: {
          title: '私信聊天',
          requiresAuth: true,
          platform: 'mobile'
        }
      }
    ]
  },
  {
    path: '/auth',
    name: 'Auth',
    redirect: '/auth/login',
    children: [
      {
        path: 'login',
        name: 'Login',
        component: Login,
      },
      {
        path: 'loginMobile',
        name: 'LoginMobile',
        component: LoginMobile,
      },
      {
        path: 'register',
        name: 'Register',
        component: Register,
      }
    ]
  },
  {
    path: '/websocket',
    name: 'WebSocket',
    component: () => import('@/components/WebSocketDemo.vue'),
  },
  {
    path: '/music',
    name: 'Music',
    component: () => import('@/views/music/PC.vue'),
    meta: {
      title: '在线音乐 - 贝斯特网站',
      requiresAuth: false
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 设置最小验证间隔（5分钟）
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000;
let lastCheckTime = 0;

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 对于不需要认证的页面，直接放行
  if (!to.matched.some(record => record.meta.requiresAuth)) {
    next();
    return;
  }

  // 检查登录状态
  const token = localStorage.getItem('token');
  const userInfo = localStorage.getItem('userInfo');

  if (!token || !userInfo) {
    // 未登录情况
    message.warning('请先登录');

    // 触发显示登录窗口事件
    window.dispatchEvent(new CustomEvent('showLoginModal', {
      detail: {
        redirect: to.fullPath,
        message: '请先登录'
      }
    }));

    // 如果是首次访问，允许进入页面但会显示登录窗口
    if (from.name === undefined) {
      next();
    } else {
      // 如果是从其他页面跳转，则阻止跳转
      next(false);
    }
    return;
  }

  // 检查本地存储的过期时间
  const tokenExpire = localStorage.getItem('tokenExpire');
  const now = new Date().getTime();

  // 如果有过期时间且未过期，且距离上次检查未超过间隔，直接通过
  if (tokenExpire && parseInt(tokenExpire) > now) {
    // 如果过期时间还有超过1小时，直接放行
    if (parseInt(tokenExpire) - now > 60 * 60 * 1000) {
      next();
      return;
    }

    // 如果过期时间不足1小时但距离上次检查未超过间隔，也直接放行
    if (now - lastCheckTime < TOKEN_CHECK_INTERVAL) {
      next();
      return;
    }
  }

  // 需要向后端验证 token
  try {
    lastCheckTime = now; // 更新最后检查时间

    const res = await AuthApi.CHECK_TOKEN_API();
    if (res.code === 200 && res.data.valid) {
      // 更新过期时间
      localStorage.setItem('tokenExpire', res.data.expireTime.toString());
      next();
    } else {
      // token 已失效
      handleTokenExpired(next, to, from);
    }
  } catch (error) {
    console.error('Token 验证失败:', error);

    // 如果有本地过期时间且未过期，网络错误时也放行
    if (tokenExpire && parseInt(tokenExpire) > now) {
      next();
    } else {
      // 否则当作 token 已过期处理
      handleTokenExpired(next, to, from);
    }
  }
});

// 处理 token 过期的函数
function handleTokenExpired(next: any, to: any, from: any) {
  // 清除本地存储
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('tokenExpire');

  // 保存当前路径到 sessionStorage，确保登录后可以返回
  if (from.path && from.path !== '/auth/login' && from.path !== '/') {
    // 优先使用来源页面路径（用户当前所在页面）
    const fromFullPath = from.fullPath || from.path;
    sessionStorage.setItem('redirectPath', fromFullPath);
  } else if (to.path && to.path !== '/auth/login' && to.path !== '/') {
    // 其次使用目标页面路径
    const toFullPath = to.fullPath || to.path;
    sessionStorage.setItem('redirectPath', toFullPath);
  }

  // 触发全局事件，通知 LayoutComponentPC 显示登录窗口
  window.dispatchEvent(new CustomEvent('showLoginModal', {
    detail: {
      message: '登录已过期，请重新登录'
    }
  }));

  message.error('登录已过期，请重新登录');

  // 如果是首次访问，允许进入页面但会显示登录窗口
  if (from.name === undefined) {
    next();
  } else {
    // 如果是从其他页面跳转，则阻止跳转
    next(false);
  }
}

export default router;