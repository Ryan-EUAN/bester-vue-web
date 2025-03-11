<template>
  <div class="box">
    <NavigationComponent />
  </div>
</template>
<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue';
import NavigationComponent from '@/components/NavigationComponent.vue';

onBeforeMount(() => {
  console.log('before时间', new Date().toLocaleTimeString());
})
onMounted(() => {
  console.log('mounted时间', new Date().toLocaleTimeString());
})
</script>
<style lang="less" scoped>
.box {
  background-image: url('@/assets/background.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  height: 100vh;
  display: flex;
  // align-items: center;
  justify-content: center;
}
</style>