import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import LayoutComponent from '../components/LayoutComponent.vue';
import Home from '../views/home/index.vue';

import Login from '@/views/auth/login.vue';
import Register from '@/views/auth/register.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home',
    component: LayoutComponent,
    children: [
      {
        path: '/home',
        name: 'Home',
        component: Home,
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