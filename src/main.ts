import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import Antd from 'ant-design-vue'
import 'element-plus/dist/index.css'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import router from './router'
import Vant from 'vant';
import 'vant/lib/index.css';
// 导入主题覆盖样式
import './assets/styles/theme-overrides.css';

// 初始化应用
const app = createApp(App);
app.use(router).use(ElementPlus).use(Antd).use(Vant).mount('#app');

// 添加全局事件监听器，用于调试
window.addEventListener('showLoginModal', (event) => {
  console.log('全局捕获到登录事件: showLoginModal', event);
});