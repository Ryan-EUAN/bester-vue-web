<template>
    <div class="app-container">
        <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">加载中，请稍候...</div>
        </div>
        <router-view v-else />
        
        <!-- 全局登录弹窗 -->
        <a-modal 
            :open="showLogin" 
            :footer="null" 
            :maskClosable="false"
            @cancel="handleLoginCancel"
            :destroyOnClose="true"
            :zIndex="1001"
            class="global-login-modal"
        >
            <login-pc @login-success="handleLoginSuccess" />
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import heartbeatService from './services/heartbeat';
import { initTheme, applyThemeToNewComponents } from './utils/themeUtils';
import LoginPc from '@/views/auth/loginPC.vue';
import { useRouter } from 'vue-router';
import eventBus from '@/utils/eventBus';

const loading = ref(true);
const showLogin = ref(false);
const router = useRouter();
let heartbeatTimer: number | null = null;
let mutationObserver: MutationObserver | null = null;

// 处理登录事件
const handleShowLoginModal = (event: Event) => {
    console.log('APP.VUE 收到登录事件: showLoginModal', event);
    showLogin.value = true;
    
    // 安全访问detail属性
    const customEvent = event as CustomEvent;
    if (customEvent.detail && customEvent.detail.redirect) {
        // 保存重定向路径
        sessionStorage.setItem('redirectPath', customEvent.detail.redirect);
        console.log('APP.VUE 保存重定向路径:', customEvent.detail.redirect);
    }
};

// 使用事件总线处理登录事件
const handleLoginEvent = (data: any) => {
    console.log('APP.VUE 通过事件总线收到登录事件', data);
    showLogin.value = true;
    
    if (data && data.redirect) {
        sessionStorage.setItem('redirectPath', data.redirect);
        console.log('APP.VUE 通过事件总线保存重定向路径:', data.redirect);
    }
};

// 关闭登录框
const handleLoginCancel = () => {
    showLogin.value = false;
};

// 登录成功处理
const handleLoginSuccess = () => {
    console.log('App.vue - 登录成功，关闭模态框');
    showLogin.value = false;
    
    // 获取重定向路径
    const savedPath = sessionStorage.getItem('redirectPath');
    if (savedPath) {
        // 延迟一下再跳转，确保登录弹窗完全关闭
        setTimeout(() => {
            sessionStorage.removeItem('redirectPath'); // 使用后删除
            router.push(savedPath);
        }, 100);
    }
};

// 添加全局登录成功事件监听
const handleLoginSuccessEvent = () => {
    console.log('App.vue - 收到全局登录成功事件');
    showLogin.value = false;
};

// 初始化心跳服务，如果失败则重试有限次数
const initHeartbeatService = (retryCount = 0, maxRetries = 3) => {
  try {
    // 初始化心跳服务 - 每30秒发送一次心跳
    heartbeatTimer = heartbeatService.setupHeartbeat(30000);
    console.log('心跳服务初始化成功');
  } catch (error) {
    console.error('心跳服务初始化失败:', error);
    
    // 如果未超过最大重试次数，尝试重新初始化
    if (retryCount < maxRetries) {
      console.log(`尝试重新初始化心跳服务 (${retryCount + 1}/${maxRetries})...`);
      setTimeout(() => {
        initHeartbeatService(retryCount + 1, maxRetries);
      }, 5000); // 5秒后重试
    } else {
      console.error(`心跳服务初始化失败，已达到最大重试次数 ${maxRetries}`);
    }
  }
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

    // 初始化主题
    initTheme();
    
    // 添加全局登录事件监听
    console.log('App.vue - 注册全局登录事件监听器');
    window.addEventListener('showLoginModal', handleShowLoginModal);
    window.addEventListener('loginSuccess', handleLoginSuccessEvent);
    window.addEventListener('userInfoUpdated', handleLoginSuccessEvent);
    eventBus.on('showLoginModal', handleLoginEvent);
    eventBus.on('loginSuccess', handleLoginSuccessEvent);
    
    // 设置MutationObserver监听DOM变化，以便对新添加的元素应用主题
    mutationObserver = new MutationObserver((mutations) => {
        let needsThemeUpdate = false;
        
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // 检查添加的节点中是否包含需要主题适配的元素
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;
                        if (element.classList.contains('ant-table') || 
                            element.classList.contains('el-table') ||
                            element.classList.contains('ant-list') ||
                            element.classList.contains('el-list') ||
                            element.classList.contains('ant-card') ||
                            element.classList.contains('el-card') ||
                            element.querySelectorAll('.ant-table, .el-table, .ant-list, .el-list, .ant-card, .el-card').length > 0) {
                            needsThemeUpdate = true;
                        }
                    }
                });
            }
        });
        
        if (needsThemeUpdate) {
            applyThemeToNewComponents();
        }
    });
    
    // 开始观察整个文档
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 模拟初始加载完成的时间
    setTimeout(() => {
        loading.value = false;
        
        // 在加载完成后初始化心跳服务
        initHeartbeatService();
        
        // 确保应用主题到已加载的组件
        applyThemeToNewComponents();
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

onBeforeUnmount(() => {
    // 清除心跳定时器
    if (heartbeatTimer !== null) {
        clearInterval(heartbeatTimer);
    }
    
    // 停止观察DOM变化
    if (mutationObserver) {
        mutationObserver.disconnect();
    }
    
    // 清理登录事件监听
    window.removeEventListener('showLoginModal', handleShowLoginModal);
    window.removeEventListener('loginSuccess', handleLoginSuccessEvent);
    window.removeEventListener('userInfoUpdated', handleLoginSuccessEvent);
    eventBus.off('showLoginModal', handleLoginEvent);
    eventBus.off('loginSuccess', handleLoginSuccessEvent);
});
</script>

<style>
/* 基础样式预先加载 */
html,
body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
}

body.dark-theme {
    background-color: var(--secondary-bg, #0c1426) !important;
    color: var(--primary-text, #e0e0e0);
}

#app {
    margin: 0;
    min-height: 100vh;
    width: 100%;
    background-color: inherit;
}

.app-container {
    width: 100%;
    min-height: 100vh;
    background-color: inherit;
    color: var(--primary-text, #333);
}

/* 加载指示器样式 */
.loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: var(--secondary-bg, #f5f5f5);
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(0, 174, 224, 0.2);
    border-radius: 50%;
    border-top-color: var(--primary-color);
    animation: spin 1s ease-in-out infinite;
}

.loading-text {
    margin-top: 20px;
    font-size: 16px;
    color: var(--primary-color);
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
    --light-bg: #f5f5f5;
    --border-color: #e4e7ed;
}

/* 深色模式下的加载器样式 */
.dark-theme .loading-container {
    background-color: var(--secondary-bg, #0c1426);
}

.dark-theme .loading-text {
    color: var(--primary-color, #00aee0);
}

.dark-theme .app-container {
    background-color: inherit;
    color: var(--primary-text, #e0e0e0);
}

/* 确保论坛主题列表使用正确的背景色 */
.dark-theme .forum-list,
.dark-theme .thread-list {
    background-color: var(--forum-card-bg, #131c30);
}

/* 确保白底卡片在深色模式下正确显示 */
.dark-theme .white-card,
.dark-theme .white-bg,
.dark-theme .bg-white {
    background-color: var(--forum-card-bg, #131c30) !important;
    color: var(--primary-text, #e0e0e0) !important;
    border-color: var(--border-color, rgba(255, 255, 255, 0.1)) !important;
}
</style>