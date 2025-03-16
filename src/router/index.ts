import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

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
  {
    path: '/personal',
    component: () => import('@/components/PC/PersonalLayout.vue'),
    meta: {
      requiresAuth: true,
      title: '个人中心'
    },
    children: [
      {
        path: '',
        redirect: '/personal/profile'
      },
      {
        path: 'profile',
        name: 'PersonalProfile',
        component: () => import('@/views/personal/Profile.vue'),
        meta: {
          title: '个人资料'
        }
      },
      {
        path: 'verify',
        name: 'PersonalVerify',
        component: Verify,
        meta: {
          title: '实名认证',
          requiresAuth: true
        }
      },
      {
        path: 'points',
        name: 'PersonalPoints',
        component: Points,
        meta: {
          title: '我的积分',
          requiresAuth: true
        }
      },
      {
        path: 'privacy',
        name: 'PersonalPrivacy',
        component: Privacy,
        meta: {
          title: '隐私设置',
          requiresAuth: true
        }
      },
      {
        path: 'security',
        name: 'PersonalSecurity',
        component: Security,
        meta: {
          title: '安全设置',
          requiresAuth: true
        }
      },
      {
        path: 'orders',
        name: 'PersonalOrders',
        component: Orders,
        meta: {
          title: '我的订单',
          requiresAuth: true
        }
      }
    ]
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫，处理需要登录的页面
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 这里可以添加登录状态检查逻辑
    // const isLoggedIn = ...
    // if (!isLoggedIn) {
    //     next('/login');
    //     return;
    // }
  }
  console.log('Navigating to:', to.path);
  console.log('到达', from.path);
  next();
});

export default router;