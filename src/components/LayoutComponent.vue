<template>
    <HeadComponent class="head_component" />
    <div class="view_component">
        <RouterView />
    </div>
</template>
<script setup lang="ts">
import HeadComponent from '@/components/HeadComponent.vue';
</script>
<style lang="less" scoped>
.head_component {
    width: 100%;
    height: 20vh;
}

.view_component {
    width: 80vw;
    margin: 1vh auto;
}
</style>