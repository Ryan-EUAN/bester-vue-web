<template>
    <a-flex gap="large">
        <ElCarousel class="banner-carousel" :interval="3000" :autoplay="true" indicator-position="outside" arrow="hover"
            trigger="click">
            <ElCarouselItem v-for="(item, index) in carouselList" :key="index"
                @click="handleCarouselClick(item.link ? item.link : '')" class="carousel-item-wrapper">
                <div class="carousel-item">
                    <el-image :src="item.imageUrl ? item.imageUrl : ''" fit="cover" class="carousel-image">
                        <template #error>
                            <div class="image-error">
                                <el-icon>
                                    <Picture />
                                </el-icon>
                            </div>
                        </template>
                    </el-image>
                    <div class="item-info">
                        <h3>{{ item.description }}</h3>
                        <p>{{ item.title }}</p>
                    </div>
                </div>
            </ElCarouselItem>
        </ElCarousel>
        <a-tabs v-model:activeKey="blogKey" type="card" size="small">
            <a-tab-pane v-for="blog in blogTabsInfos" :key="blog.id" :tab="blog.label">
                <PostListColumnComponent :tabsId="blog.id" type="blog" />
            </a-tab-pane>
        </a-tabs>
        <a-tabs v-model:activeKey="userKey" type="card" size="small" style="width: 15vw;">
            <a-tab-pane v-for="user in userTabsInfos" :key="user.id" :tab="user.label">
                <PostListColumnComponent :tabsId="user.id" type="user" />
            </a-tab-pane>
        </a-tabs>
    </a-flex>
    <WebsiteInformation />
    <a-flex gap="small" style="margin-top: 1vh;">
        <VerticalRunningLantern style="width: 30vw;" />
        <a-tabs v-model:activeKey="blogKey" type="card" size="small">
            <a-tab-pane v-for="blog in blogTabsInfos" :key="blog.id" :tab="blog.label">
                <PostListColumnComponent :tabsId="blog.id" type="blog" />
            </a-tab-pane>
        </a-tabs>
    </a-flex>
    <ModuleArea 
        v-for="(moduleData, index) in moduleList" 
        :key="index"
        :titleText="moduleData.title"
        :moduleList="moduleData.plateInfos"
    />
    <OnlineMembershipModule />
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PostListColumnComponent from '@/components/PC/PostListColumnComponent.vue';
import VerticalRunningLantern from '@/components/PC/VerticalRunningLantern.vue';
import ModuleArea from '@/components/PC/ModuleArea.vue';
import OnlineMembershipModule from '@/components/PC/OnlineMembershipModule.vue';
import WebsiteInformation from '@/components/PC/WebsiteInformation.vue';
import { Picture } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';
import CarouselApi from '../../services/carousel';
import type { CarouselItem } from '../../types/carousel';
import ModuleApi from '../../services/module';
import type { ModuleData } from '../../types/module';
import { ElMessage } from 'element-plus';

const carouselList = ref<CarouselItem[]>([]);
const moduleList = ref<ModuleData[]>([]);

const getCarouselData = async () => {
    try {
        const res = await CarouselApi.GET_TOP_CAROUSEL_API();
        if (res.code === 200 && res.data?.length > 0) {  // 确保有数据才更新
            carouselList.value = res.data;
        }
    } catch (error) {
        console.error('获取轮播图数据出错:', error);
        // 发生错误时保持使用默认数据
    }
};

const getModuleData = async () => {
    try {
        const res = await ModuleApi.GET_MODULE_DATA_API();
        if (res.code === 200 && res.data?.length > 0) {
            moduleList.value = res.data;
        } else {
            ElMessage.error(res.message || '获取模块数据失败');
        }
    } catch (error) {
        console.error('获取模块数据出错:', error);
        ElMessage.error('获取模块数据失败');
    }
};

const blogTabsInfos = ref([
    { label: '最新主题', id: 'latest_theme' },
    { label: '最新回复', id: 'latest_reply' },
    { label: '帖子热搜榜', id: 'post_hot_search' },
    { label: '最新资源库', id: 'latest_resource_library' },
    { label: '精华帖', id: 'essence_paste' }
])
const blogKey = ref(blogTabsInfos.value[0].id || '');
const userTabsInfos = ref([
    { label: '金币排行榜', id: 'gold_coin' },
    { label: 'B砖排行', id: 'b_brick' }
])
const userKey = ref(userTabsInfos.value[0].id || '');

const router = useRouter();

// 处理轮播图点击
const handleCarouselClick = (link: string) => {
    if (link) {
        router.push(link);
    }
};

onMounted(async () => {
    await getCarouselData();
    await getModuleData();
    window.addEventListener('resize', () => {
        console.log('resize');
    })
})
</script>
<style lang="less" scoped>
.banner-carousel {
    width: 26vw;
    height: 45vh;
    border-radius: 0.3vw;
    overflow: hidden;
}

.carousel-item-wrapper {
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.01); // 添加轻微的悬浮效果
    }
}

.carousel-item {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    border-radius: 0.3vw;

    .carousel-image {
        width: 100%;
        height: 100%;
        transition: transform 0.3s ease;

        &:hover {
            transform: scale(1.05);
        }
    }

    .item-info {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 1.5vw;
        user-select: none;
        background: linear-gradient(to top,
                rgba(0, 0, 0, 0.8) 0%,
                rgba(0, 0, 0, 0.4) 60%,
                transparent 100%);
        color: white;
        transform: translateY(0);
        transition: transform 0.3s ease;

        h3 {
            font-size: 1.4vw;
            font-weight: bold;
            margin: 0;
            margin-bottom: 0.5vw;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        p {
            font-size: 1vw;
            margin: 0;
            opacity: 0.9;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }
    }

    &:hover .item-info {
        transform: translateY(-5px);
    }
}

.image-error {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    color: #909399;
    font-size: 2rem;
}

:deep(.el-carousel__indicators) {
    transform: translateY(1.5rem);
}

:deep(.el-carousel__button) {
    width: 2rem;
    height: 0.2rem;
    border-radius: 0.1rem;
    background-color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;

    &:hover {
        background-color: white;
    }
}

:deep(.el-carousel__arrow) {
    background-color: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.7);

    &:hover {
        background-color: rgba(0, 0, 0, 0.6);
    }
}

:deep(.el-image) {
    width: 100%;
    height: 100%;
}

.el-carousel__item h3 {
    color: #475669;
    opacity: 0.75;
    line-height: 150px;
    margin: 0;
    text-align: center;
}

.el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
    background-color: #d3dce6;
}

:deep(.slick-slide img) {
    display: block;
    width: 95%;
    height: 100%;
    object-fit: cover;
    border-radius: 1rem;
}

:deep(.slick-arrow) {
    display: none !important;
}

:deep(.slick-thumb) {
    bottom: 0px;
}

:deep(.slick-thumb li) {
    width: 4vw;
    height: 5vh;
}

:deep(.slick-thumb li img) {
    width: 100%;
    height: 100%;
    filter: grayscale(100%);
    display: block;
}

:deep .slick-thumb li.slick-active img {
    filter: grayscale(0%);
}

:deep(.el-dialog) {
    border-radius: 0.5vw;
    overflow: hidden;
}

// 确保弹窗在最顶层
:deep(.el-dialog__wrapper) {
    z-index: 2000;
}
</style>