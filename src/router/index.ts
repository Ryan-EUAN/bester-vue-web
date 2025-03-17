import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { message } from 'ant-design-vue';
import AuthApi from '@/services/auth';

import LayoutComponentMobile from '../components/Mobile/LayoutComponentMobile.vue';
import LayoutComponentPC from '../components/PC/LayoutComponentPC.vue';
import HomeMobile from '@/views/home/Mobile.vue'
import HomePC from '@/views/home/PC.vue'
import Login from '@/views/auth/login.vue';
import Register from '@/views/auth/register.vue'

const Verify = () => import('@/views/personal/Verify.vue');
const Points = () => import('@/views/personal/Points.vue');
const Privacy = () => import('@/views/personal/Privacy.vue');
const Security = () => import('@/views/personal/Security.vue');
const Orders = () => import('@/views/personal/Orders.vue');

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
        path: 'register',
        name: 'Register',
        component: Register,
      }
    ]
  },
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
  
  // 触发全局事件，通知 LayoutComponentPC 显示登录窗口
  window.dispatchEvent(new CustomEvent('showLoginModal', { 
    detail: { 
      redirect: to.fullPath,
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