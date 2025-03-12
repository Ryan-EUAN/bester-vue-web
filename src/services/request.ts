import axios from "axios";
import { ElNotification } from "element-plus";
import token from "./token";

// 创建axios实例
const service = axios.create({
  baseURL: '/api',
  // baseURL: '/',
  timeout: 5000, // 请求超时时间
  headers: { "Content-Type": "application/json" }
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    // 例如：如果需要token验证，可以在这里添加token
    config.headers['Authorization'] = token.getToken();
    return config;
  },
  error => {
    // 对请求错误做些什么
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    if (res.code !== 200) {
      const errorMessage = res.message || '请求失败，状态码：' + (res.code || '未知');
      console.log('错误：', errorMessage);
      ElNotification({
        title: '错误',
        message: errorMessage,
        type: 'error',
        showClose: false,
        duration: 2500
      })
      return Promise.reject(new Error(errorMessage));
    } else {
      return res;
    }
  },
  error => {
    if (error.response.status === 401) {
      ElNotification({
        title: '鉴权失败',
        message: '登录过期，请重新登录',
        type: 'error',
        showClose: false,
        duration: 2500
      })
    }
    console.log('请求错误：', error.message || error);
    return Promise.reject(error);
  }
);

export default service;
