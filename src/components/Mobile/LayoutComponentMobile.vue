<template>
    <RouterView />
    <van-tabbar v-model="active">
        <van-tabbar-item name="home" icon="home-o">首页</van-tabbar-item>
        <van-tabbar-item name="apps" icon="apps-o">社区</van-tabbar-item>
        <van-tabbar-item name="add">
            <template #icon="props">
                <van-icon name="add" :size="40" :color="props.active ? '#1989fa' : '#7d7e80'" />
            </template>
        </van-tabbar-item>
        <van-tabbar-item name="chat" icon="chat-o">私聊</van-tabbar-item>
        <van-tabbar-item name="user" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const active = ref('home');
</script>
<style lang="scss" scoped>
:deep(.van-tabbar-item) {
    &[name='search'] {
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