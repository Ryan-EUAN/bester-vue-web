<template>
    <div class="layout-container">
        <HeadComponent />
        <div class="main-content">
            <router-view />
        </div>

        <!-- 登录弹窗 -->
        <a-modal 
            :open="showLogin" 
            :footer="null" 
            :maskClosable="false"
            @cancel="handleLoginCancel"
            :destroyOnClose="true"
            :zIndex="1001"
        >
            <!-- <div v-if="loginMessage" class="login-message">{{ loginMessage }}</div> -->
            <login-pc @login-success="handleLoginSuccess" />
        </a-modal>
        <a-flex justify="center" gap="small">
        <div>
            Bester乐于分享 - HappyToShare © {{ '2024 - ' + new Date().getFullYear() }}
        </div>
        <a href='https://beian.miit.gov.cn' target="_blank">蜀ICP备2025132580号</a>
    </a-flex>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import HeadComponent from './HeadComponent.vue';
import LoginPc from '@/views/auth/loginPC.vue';
import { useRouter } from 'vue-router';
import eventBus from '@/utils/eventBus';

const router = useRouter();
const showLogin = ref(false);


// 监听登录窗口事件
const handleShowLoginModal = (event: Event) => {
    console.log('收到登录事件: showLoginModal', event);
    showLogin.value = true;
    
    // 安全访问detail属性
    const customEvent = event as CustomEvent;
    if (customEvent.detail) {
        if (customEvent.detail.redirect) {
            // 使用 sessionStorage 而不是组件变量，避免组件重新渲染时丢失
            sessionStorage.setItem('redirectPath', customEvent.detail.redirect);
            console.log('保存重定向路径:', customEvent.detail.redirect);
        }
    }
};

// 添加关闭登录框的处理方法
const handleLoginCancel = () => {
    showLogin.value = false;
};

// 登录成功处理
const handleLoginSuccess = () => {
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

// 使用事件总线监听登录事件
const handleLoginEvent = (data: any) => {
    console.log('通过事件总线收到登录事件', data);
    showLogin.value = true;
    
    if (data && data.redirect) {
        // 使用 sessionStorage 而不是组件变量，避免组件重新渲染时丢失
        sessionStorage.setItem('redirectPath', data.redirect);
        console.log('通过事件总线保存重定向路径:', data.redirect);
    }
};

onMounted(() => {
    console.log('LayoutComponentPC mounted - 添加事件监听器');
    // 使用事件总线监听
    eventBus.on('showLoginModal', handleLoginEvent);
    // 同时保留原生事件监听，保证兼容性
    window.addEventListener('showLoginModal', handleShowLoginModal);
});

onUnmounted(() => {
    console.log('LayoutComponentPC unmounted - 移除事件监听器');
    // 移除事件总线监听
    eventBus.off('showLoginModal', handleLoginEvent);
    // 同时移除原生事件监听
    window.removeEventListener('showLoginModal', handleShowLoginModal);
});
</script>

<style lang="less" scoped>
.layout-container {
    display: flex;
    flex-direction: column;
}

.main-content {
    flex: 1;
    padding: 2vw;
    width: 90vw;
    margin: 0 auto;
}

.login-message {
    color: #ff4d4f;
    margin-bottom: 16px;
    text-align: center;
}
</style>