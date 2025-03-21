<template>
    <div class="layout-container">
        <HeadComponent @openLogin="showLoginDialog" style="height: 15vh;" />
        <div class="main-content">
            <router-view />
        </div>

        <!-- 登录弹窗 -->
        <a-modal 
            :open="showLogin" 
            :footer="null" 
            :maskClosable="false"
            @cancel="handleLoginCancel"
        >
            <login-pc @login-success="handleLoginSuccess" />
        </a-modal>
        <a-flex justify="center" gap="small">
        <div>
            Bester乐于分享 - HappyToShare © {{ '2024 - ' + new Date().getFullYear() }}
        </div>
        <a href='https://beian.miit.gov.cn' target="_blank">蜀ICP备2025119347号</a>
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
const redirectPath = ref('');
const loginMessage = ref('');

// 显示登录弹窗
const showLoginDialog = () => {
    showLogin.value = true;
};

// 监听登录窗口事件
const handleShowLoginModal = (event: CustomEvent) => {
    showLogin.value = true;
    
    if (event.detail) {
        if (event.detail.redirect) {
            redirectPath.value = event.detail.redirect;
        }
        
        if (event.detail.message) {
            loginMessage.value = event.detail.message;
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
    loginMessage.value = '';
    
    // 如果有重定向路径，可以在这里处理
    if (redirectPath.value) {
        router.push(redirectPath.value);
        redirectPath.value = '';
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