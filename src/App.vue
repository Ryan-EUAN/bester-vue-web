<template>
    <div class="app-container">
        <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">加载中，请稍候...</div>
        </div>
        <router-view v-else />

        <!-- 添加消息显示区域 -->
        <div v-if="!loading && messages.length > 0" class="messages-container">
            <h3>实时消息:</h3>
            <ul>
                <li v-for="(msg, index) in messages" :key="index">{{ msg }}</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { webSocketService } from './utils/websocket';
import { ElNotification } from 'element-plus';

const loading = ref(true);
const messages = ref<string[]>([]);
let connectionStatusInterval: number | null = null;

const handleMessage = (data: string) => {
    const res = JSON.parse(data);
    ElNotification({
        title: '提示',
        message: res.content,
        type: 'success'
    });
    // console.log('结果=',res.content);
};

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

    // webSocketService.connect('ws://139.159.243.123/ws');
    // webSocketService.addMessageListener(handleMessage);
});

// 组件销毁时清理资源
onUnmounted(() => {
    if (connectionStatusInterval !== null) {
        clearInterval(connectionStatusInterval);
        connectionStatusInterval = null;
    }
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

/* 消息容器样式 */
.messages-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    padding: 15px;
    border-radius: 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 300px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
}

.messages-container h3 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 16px;
    color: #333;
}

.messages-container ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.messages-container li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    word-break: break-word;
}

.messages-container li:last-child {
    border-bottom: none;
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