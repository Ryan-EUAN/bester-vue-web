<template>
    <div class="personal-center">
        <!-- 左侧菜单 -->
        <a-menu
            v-model:selectedKeys="selectedKey"
            mode="inline"
            class="side-menu"
            @select="handleMenuSelect"
        >
            <a-menu-item v-for="menu in menuItems" :key="menu.key">
                <template #icon><component :is="menu.icon" /></template>
                {{ menu.label }}
            </a-menu-item>
        </a-menu>

        <!-- 右侧内容区 -->
        <div class="content-area">
            <router-view></router-view>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
    UserOutlined,
    SafetyCertificateOutlined,
    GiftOutlined,
    EyeOutlined,
    LockOutlined,
    ShoppingOutlined
} from '@ant-design/icons-vue';

const router = useRouter();
const route = useRoute();

// 菜单配置
const menuItems = [
    { key: 'profile', label: '个人资料', icon: UserOutlined, path: '/personal/profile' },
    { key: 'verify', label: '认证', icon: SafetyCertificateOutlined, path: '/personal/verify' },
    { key: 'points', label: '积分', icon: GiftOutlined, path: '/personal/points' },
    { key: 'privacy', label: '隐私筛选', icon: EyeOutlined, path: '/personal/privacy' },
    { key: 'security', label: '密码安全', icon: LockOutlined, path: '/personal/security' },
    { key: 'orders', label: '我的订单', icon: ShoppingOutlined, path: '/personal/orders' }
];

// 根据当前路由设置选中的菜单项
const selectedKey = ref([route.path.split('/')[2] || 'profile']);

// 处理菜单选择
const handleMenuSelect = ({ key }: { key: string }) => {
    const menuItem = menuItems.find(item => item.key === key);
    if (menuItem) {
        router.push(menuItem.path);
    }
};
</script>

<style lang="less" scoped>
.personal-center {
    display: flex;
    min-height: 80vh;
    background: #fff;
    margin: 2vh auto;
    width: 80vw;
    border-radius: 0.5vw;
    box-shadow: 0 0.2vh 1vh rgba(0,0,0,0.1);

    .side-menu {
        width: 15vw;
        border-right: 1px solid #f0f0f0;
    }

    .content-area {
        flex: 1;
        padding: 2vh 2vw;
    }
}
</style> 