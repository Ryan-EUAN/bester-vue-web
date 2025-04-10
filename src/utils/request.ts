import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { message } from 'ant-design-vue';
import router from '@/router';

// 创建 axios 实例
const request = axios.create({
    baseURL: '/api',  // 确保这里是 /api
    timeout: 15000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
request.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error: any) => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
    (response: AxiosResponse) => {
        const { data } = response;

        // 处理 token 过期情况
        if (data.code === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('tokenExpire');
            const currentPath = window.location.pathname + window.location.search;
            sessionStorage.setItem('redirectPath', currentPath);
            window.dispatchEvent(new CustomEvent('showLoginModal', {
                detail: {
                    redirectPath: currentPath
                }
            }));
            return Promise.reject(new Error(data.message || '登录已过期'));
        }

        if (data.code === 200) {
            return data;
        }

        // message.error(data.message || '请求失败');
        return Promise.reject(new Error(data.message || '请求失败'));
    },
    (error: any) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('tokenExpire');
            const currentPath = window.location.pathname + window.location.search;
            sessionStorage.setItem('redirectPath', currentPath);
            window.dispatchEvent(new CustomEvent('showLoginModal', {
                detail: {
                    message: '登录已过期，请重新登录',
                    redirectPath: currentPath
                }
            }));
        }

        handleRequestError(error);
        return Promise.reject(error);
    }
);

const handleRequestError = (error: any) => {
    if (error.response) {
        const { status } = error.response;
        const errorMessages: Record<number, string> = {
            401: '请先登录',
            403: '没有权限',
            404: '请求的资源不存在',
            500: '服务器错误'
        };
        message.error(errorMessages[status] || '网络错误');
        if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            router.push('/');
        }
    } else {
        message.error('网络连接失败');
    }
};

export default request; 