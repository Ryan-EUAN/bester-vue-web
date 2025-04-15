<template>
    <div class="layout-container">
        <HeadComponent @openLogin="showLoginDialog" />
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

const router = useRouter();
const showLogin = ref(false);

// 显示登录弹窗
const showLoginDialog = () => {
    showLogin.value = true;
};

// 监听登录窗口事件
const handleShowLoginModal = (event: CustomEvent) => {
    showLogin.value = true;
    
    if (event.detail) {
        if (event.detail.redirect) {
            // 使用 sessionStorage 而不是组件变量，避免组件重新渲染时丢失
            sessionStorage.setItem('redirectPath', event.detail.redirect);
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

onMounted(() => {
    window.addEventListener('showLoginModal', handleShowLoginModal as EventListener);
});

onUnmounted(() => {
    window.removeEventListener('showLoginModal', handleShowLoginModal as EventListener);
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