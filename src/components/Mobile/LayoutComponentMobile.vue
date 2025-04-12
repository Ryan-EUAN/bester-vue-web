<template>
    <RouterView />
    <van-tabbar v-model="active" @change="onTabChange">
        <van-tabbar-item name="home" icon="home-o">首页</van-tabbar-item>
        <van-tabbar-item name="community" icon="apps-o">社区</van-tabbar-item>
        <van-tabbar-item name="post">
            <template #icon="props">
                <van-icon name="add" :size="40" :color="props.active ? '#1989fa' : '#7d7e80'" />
            </template>
        </van-tabbar-item>
        <van-tabbar-item name="chat" icon="chat-o">私聊</van-tabbar-item>
        <van-tabbar-item name="profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';

const router = useRouter();
const route = useRoute();

// tabbar激活项
const active = ref('home');

// 路由映射表
const routeMap = {
    'home': '/home',
    'community': '/community',
    'post': '/post/create',
    'chat': '/chat',
    'profile': '/profile'
};

// 反向路由映射，用于根据当前路由设置底部tabbar
const reverseRouteMap: Record<string, string> = {
    '/home': 'home',
    '/community': 'community',
    '/profile': 'profile',
    '/chat': 'chat'
};

// 处理tab变化
const onTabChange = (name: string) => {
    if (name === 'post') {
        // 发布帖子需要登录判断
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('请先登录');
            router.push('/auth/loginMobile');
            active.value = 'home'; // 重置为首页tab
            return;
        }
    }
    
    // 跳转到对应路由
    const targetPath = routeMap[name as keyof typeof routeMap];
    if (targetPath) {
        router.push(targetPath);
    }
};

// 根据当前路由设置激活的tab
const setActiveByRoute = (path: string) => {
    // 提取主路径
    const mainPath = '/' + path.split('/')[1];
    const tabName = reverseRouteMap[mainPath];
    
    if (tabName) {
        active.value = tabName;
    }
};

// 监听路由变化
watch(
    () => route.path,
    (newPath) => {
        setActiveByRoute(newPath);
    }
);

// 组件挂载时根据当前路由设置激活tab
onMounted(() => {
    setActiveByRoute(route.path);
});
</script>
<style lang="scss" scoped>
:deep(.van-tabbar-item) {
    &[name='post'] {
        .van-icon {
            margin-bottom: 0;
            font-weight: bold;
        }

        .van-tabbar-item__text {
            display: none;
        }
    }
}
</style>