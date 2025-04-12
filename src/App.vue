<template>
    <div class="app-container">
        <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">加载中，请稍候...</div>
        </div>
        <router-view v-else />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const loading = ref(true);

onMounted(() => {
    // 预加载关键样式资源
    const preloadLinks = [
        { rel: 'preload', href: '/assets/fonts/element-icons.woff', as: 'font', type: 'font/woff', crossorigin: 'anonymous' },
        { rel: 'preload', href: '/assets/fonts/element-icons.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }
    ];

    preloadLinks.forEach(attrs => {
        const link = document.createElement('link');
        Object.entries(attrs).forEach(([key, value]) => {
            link.setAttribute(key, value as string);
        });
        document.head.appendChild(link);
    });

    // 模拟初始加载完成的时间
    setTimeout(() => {
        loading.value = false;
    }, 1000);

    // 初始化WebSocket连接
    // webSocketService.connect('http://139.159.243.123/ws')
    //     .then(() => {
    //         // 发送连接成功消息
    //         webSocketService.sendMessage({
    //             type: 'connect',
    //             content: '客户端已连接'
    //         });
    //     })
    //     .catch(error => {
    //         console.error('WebSocket连接失败:', error);
    //     });
});
</script>

<style>
/* 基础样式预先加载 */
html,
body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.app-container {
    width: 100%;
    height: 100vh;
}

/* 加载指示器样式 */
.loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f8f9fa;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(0, 174, 224, 0.2);
    border-radius: 50%;
    border-top-color: #00aee0;
    animation: spin 1s ease-in-out infinite;
}

.loading-text {
    margin-top: 20px;
    font-size: 16px;
    color: #00aee0;
    font-weight: 500;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 预设CSS变量，减少后续计算 */
:root {
    --primary-color: #00aee0;
    --text-color: #333;
    --light-bg: #f8f9fa;
    --border-color: #e4e7ed;
}
</style>