import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import Antd from 'ant-design-vue'
import 'element-plus/dist/index.css'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import router from './router'
import Vant from 'vant';
import 'vant/lib/index.css';

createApp(App).use(router).use(ElementPlus).use(Antd).use(Vant).mount('#app')
