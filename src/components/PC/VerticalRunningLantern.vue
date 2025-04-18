<template>
    <a-flex gap="medium" style="width: 100%; height: 40vh;">
        <!-- 左侧大图轮播，修改宽度为30vw -->
        <div class="carousel-container" style="width: 40vw;">
            <el-carousel 
                ref="mainCarousel" 
                height="100%" 
                direction="vertical" 
                :autoplay="true" 
                :interval="3000"
                indicator-position="none" 
                :loop="true" 
                @change="handleMainChange">
                <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
                    <div class="carousel-main-image">
                        <img :src="item.imgUrl" :alt="item.title" />
                        <div class="image-title">{{ item.title }}</div>
                    </div>
                </el-carousel-item>
            </el-carousel>
        </div>

        <!-- 右侧缩略图容器宽度调整 -->
        <div class="thumbnail-container" style="width: 6vw;">
            <a-flex vertical gap="small">
                <div v-for="(item, index) in visibleThumbnails" :key="index" class="thumbnail-item"
                    :class="{ 'active': activeIndex === item.index }" @mouseenter="handleThumbnailHover(item.index)">
                    <img :src="item.imgUrl" :alt="item.title" />
                </div>
            </a-flex>
        </div>
    </a-flex>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// 轮播图数据
const carouselItems = ref([
    {
        imgUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=450&q=80',
        title: '山川湖泊风景'
    },
    {
        imgUrl: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&h=450&q=80',
        title: '雪山日落'
    },
    {
        imgUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=450&q=80',
        title: '海岸风光'
    },
    {
        imgUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=450&q=80',
        title: '森林晨光'
    },
    {
        imgUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=450&q=80',
        title: '绿色森林'
    },
    {
        imgUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=450&q=80',
        title: '田园风光'
    },
    {
        imgUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=450&q=80',
        title: '山谷云海'
    }
]);

const activeIndex = ref(0);
const mainCarousel = ref(null);
const startIndex = ref(0);

// 只显示5张小图片，根据当前活动项计算应该显示哪5张
const visibleThumbnails = computed(() => {
    const result = [];
    let start = 0;

    // 如果活动项在后面，调整开始索引让活动项在可视范围内
    if (activeIndex.value >= 3 && activeIndex.value <= carouselItems.value.length - 3) {
        start = activeIndex.value - 2;
    } else if (activeIndex.value > carouselItems.value.length - 3) {
        start = carouselItems.value.length - 5;
    }

    startIndex.value = start;

    // 确保只显示5张或更少（如果总数小于5）
    const count = Math.min(5, carouselItems.value.length);
    for (let i = 0; i < count; i++) {
        const index = (start + i) % carouselItems.value.length;
        result.push({
            ...carouselItems.value[index],
            index: index
        });
    }

    return result;
});

// 处理主轮播图变化事件
const handleMainChange = (index: number) => {
    activeIndex.value = index;
};

// 处理缩略图悬停事件
const handleThumbnailHover = (index: number) => {
    if (mainCarousel.value) {
        // @ts-ignore - El-carousel 的 setActiveItem 方法
        mainCarousel.value.setActiveItem(index);
        activeIndex.value = index;
    }
};

onMounted(() => {
    // 初始化时设置活动索引
    activeIndex.value = 0;
});
</script>

<style scoped lang="scss">
.carousel-container {
    width: 30vw; // 修改为固定30vw
    height: 100%;
    position: relative;
    border-radius: 8px;
    overflow: hidden;

    :deep(.el-carousel),
    :deep(.el-carousel__container) {
        height: 100% !important;
    }

    :deep(.el-carousel__item) {
        height: 100% !important;
    }
}

.carousel-main-image {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: all 0.3s;
        display: block;
    }

    .image-title {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 10px;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        font-size: 14px;
    }
}

.thumbnail-container {
    width: 5vw; // 设置固定宽度
    height: 100%;
    overflow: hidden;

    .thumbnail-item {
        position: relative;
        height: 6vh; // 设置每个缩略图高度为6vh
        margin-bottom: 4px; // 添加间距
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.3s;
        overflow: hidden;
        border-radius: 4px; // 添加圆角美化

        &:last-child {
            margin-bottom: 0; // 最后一个缩略图不需要底部间距
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: brightness(0.8);
            transition: all 0.3s;
        }

        &:hover img {
            filter: brightness(1);
            transform: scale(1.05);
        }

        &.active {
            border-color: #1890ff;

            img {
                filter: brightness(1);
            }
        }
    }
}

// 调整轮播图箭头按钮大小
:deep(.el-carousel__arrow) {
    width: 30px; // 减小按钮大小
    height: 30px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    
    &:hover {
        background-color: rgba(0, 0, 0, 0.5);
    }

    i {
        font-size: 14px; // 减小箭头图标大小
    }
}

:deep(.el-carousel--vertical .el-carousel__arrow--up) {
    top: 15px;
    left: 50%;
    transform: translateX(-50%) rotate(90deg);
}

:deep(.el-carousel--vertical .el-carousel__arrow--down) {
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%) rotate(90deg);
}

// 自定义 ElementUI 轮播图样式
:deep(.el-carousel__container) {
    height: 100%;
}

:deep(.el-carousel--vertical .el-carousel__indicators) {
    display: none;
}
</style>