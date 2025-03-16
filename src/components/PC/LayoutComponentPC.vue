<template>
    <div class="layout-container">
        <HeadComponent @openLogin="showLoginDialog" style="height: 30vh;" />
        <div class="main-content">
            <router-view />
        </div>

        <!-- 登录弹窗 -->
        <el-dialog v-model="dialogLoginVisible" width="35vw" :close-on-click-modal="false" :align-center="true"
            class="login-dialog" destroy-on-close>
            <loginPCView @LoginSuccess="handleLoginSuccess" />
        </el-dialog>
    </div>
    <a-flex justify="center" gap="small">
        <div>
            Bester乐于分享 - HappyToShare © {{ '2024 - ' + new Date().getFullYear() }}
        </div>
        <a href='https://beian.miit.gov.cn' target="_blank">蜀ICP备2025119347号</a>
    </a-flex>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HeadComponent from './HeadComponent.vue';
import loginPCView from '@/views/auth/loginPC.vue';
import { UserApi } from '../../services/user.ts';
import { ElMessage } from 'element-plus';

const dialogLoginVisible = ref<boolean>(false);

// 显示登录弹窗
const showLoginDialog = () => {
    dialogLoginVisible.value = true;
};

// 刷新用户信息
const refreshUserInfo = async () => {
    try {
        const res = await UserApi.GET_USER_INFO_API();
        if (res.code === 200) {
            // 更新本地存储的用户信息
            localStorage.setItem('userInfo', JSON.stringify(res.data));
            // 如果需要，可以触发其他组件的更新
            // 例如通过 emit 事件或 pinia store
        } else {
            ElMessage.error(res.message || '获取用户信息失败');
        }
    } catch (error) {
        console.error('获取用户信息出错:', error);
        ElMessage.error('获取用户信息失败');
    }
};

// 处理登录成功
const handleLoginSuccess = async () => {
    dialogLoginVisible.value = false;
    // 登录成功后刷新用户信息
    await refreshUserInfo();
};
</script>

<style lang="less" scoped>
.layout-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.main-content {
    flex: 1;
    padding: 2vw;
    width: 90vw;
    margin: 0 auto;
}

:deep(.login-dialog) {
    .el-dialog {
        border-radius: 0.5vw;
        overflow: hidden;
    }

    .el-dialog__body {
        padding: 2vw;
    }

    .el-dialog__header {
        padding: 1vw 2vw;
    }
}
</style>