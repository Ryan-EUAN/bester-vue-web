<template>
    <HeadComponent class="head_component" />
    <div class="view_component">
        <RouterView />
    </div>
    <a-flex justify="center" gap="small" style="margin-top: 5vh;">
        <div>
            Bester乐于分享 - HappyToShare © {{ '2024 - ' + new Date().getFullYear() }}
        </div>
        <a href='https://beian.miit.gov.cn' target="_blank">蜀ICP备2025119347号</a>
    </a-flex>
</template>
<script setup lang="ts">
import HeadComponent from '@/components/PC/HeadComponent.vue';

</script>
<style lang="less" scoped>
.head_component {
    width: 100%;
    height: 25vh;
}

.view_component {
    width: 80vw;
    margin: 1vh auto;
}
</style>