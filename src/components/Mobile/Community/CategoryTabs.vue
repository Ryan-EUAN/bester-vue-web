<template>
  <div class="category-tabs">
    <van-sticky>
      <div class="tabs-container">
        <div 
          v-for="(category, index) in categories" 
          :key="category.id"
          class="tab-item"
          :class="{ active: index === active }"
          @click="handleTabClick(index)"
        >
          {{ category.name }}
        </div>
      </div>
    </van-sticky>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

interface Category {
  id: number;
  name: string;
}

const props = defineProps<{
  categories: Category[];
  active: number;
}>();

const emit = defineEmits<{
  (e: 'update:active', value: number): void;
  (e: 'change', value: number): void;
}>();

const handleTabClick = (index: number) => {
  emit('update:active', index);
  emit('change', index);
};
</script>

<style lang="scss" scoped>
.category-tabs {
  margin-bottom: 8px;
  
  .tabs-container {
    display: flex;
    overflow-x: auto;
    background-color: #fff;
    padding: 12px 8px;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari and Opera */
    }
    
    .tab-item {
      flex-shrink: 0;
      padding: 6px 14px;
      margin: 0 4px;
      font-size: 14px;
      color: #646566;
      background-color: #f5f5f5;
      border-radius: 16px;
      transition: all 0.2s;
      
      &.active {
        color: #fff;
        background: linear-gradient(135deg, #1989fa, #39a9fc);
        font-weight: 500;
      }
    }
  }
}
</style> 