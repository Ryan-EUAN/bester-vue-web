<template>
  <div class="box" ref="boxRef" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
    <div class="background-layer" ref="backgroundRef"></div>
    <NavigationComponent />
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import NavigationComponent from '@/components/PC/NavigationComponent.vue';

const boxRef = ref<HTMLElement | null>(null);
const backgroundRef = ref<HTMLElement | null>(null);
let rafId: number | null = null;

// 处理鼠标移出事件
const handleMouseLeave = () => {
  if (!backgroundRef.value) return;
  
  if (rafId) {
    cancelAnimationFrame(rafId);
  }

  // 重置transform效果
  backgroundRef.value.style.transform = `
    scale(1) 
    translate3d(0, 0, 0)
  `;
};

// 使用 RAF 和防抖优化鼠标移动处理
const handleMouseMove = (e: MouseEvent) => {
  if (!boxRef.value || !backgroundRef.value) return;

  if (rafId) {
    cancelAnimationFrame(rafId);
  }

  rafId = requestAnimationFrame(() => {
    const { clientX, clientY } = e;
    const { width, height } = boxRef.value!.getBoundingClientRect();

    // 减小移动系数，使动画更流畅
    const xPercentage = (clientX / width - 0.5) * 1.5;
    const yPercentage = (clientY / height - 0.5) * 1.5;

    // 直接操作 transform 属性，减少查询DOM
    backgroundRef.value!.style.transform = `
      scale(1.02) 
      translate3d(${xPercentage * 15}px, ${yPercentage * 15}px, 0)
    `;
  });
};

// 清理 RAF
onUnmounted(() => {
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
});
</script>

<style lang="scss" scoped>
.box {
  position: relative;
  height: 100vh;
  display: flex;
  justify-content: center;
  overflow: hidden;
  perspective: 1000px;
  transform-style: preserve-3d;

  // 背景层
  .background-layer {
    position: absolute;
    top: 0;      // 设置初始top为0
    left: 0;
    width: 102%;
    height: 102%;
    background-image: url('@/assets/background.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    transition: transform 0.2s ease-out; // 调整过渡效果
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
    z-index: -1;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        rgba(0, 0, 0, 0.05),
        rgba(0, 0, 0, 0.1)
      );
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s linear;
    }
  }

  &:hover {
    .background-layer::after {
      opacity: 1;
    }
  }

  // 确保导航组件在背景层上方
  :deep(NavigationComponent) {
    position: relative;
    z-index: 1;
  }
}

// 添加媒体查询以优化移动端体验
@media (max-width: 768px) {
  .box {
    .background-layer {
      transform: none !important;
      transition: none;
    }
  }
}
</style>