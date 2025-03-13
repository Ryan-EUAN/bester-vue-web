import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import LayoutComponentMobile from '../components/Mobile/LayoutComponentMobile.vue';
import LayoutComponentPC from '../components/PC/LayoutComponentPC.vue';
import HomeMobile from '@/views/home/Mobile.vue'
import HomePC from '@/views/home/PC.vue'
import Login from '@/views/auth/login.vue';
import Register from '@/views/auth/register.vue'

const isMobile = window.innerWidth <= 768

const routes: Array<RouteRecordRaw> = [
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
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 在这里添加路由的导航守卫
router.beforeEach((to, from, next) => {
  console.log('Navigating to:', to.path);
  console.log('到达', from.path);
  next();
});

export default router;