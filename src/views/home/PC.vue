<template>
    <div class="pc-container" :class="{ 'dark-theme': isDarkMode }">
        <a-flex gap="large">
            <ElCarousel class="banner-carousel" :interval="3000" :autoplay="true" indicator-position="outside" arrow="hover"
                trigger="click" @change="handleCarouselChange">
                <ElCarouselItem v-for="(item, index) in carouselList" :key="index"
                    @click="handleCarouselClick(item.link ? item.link : '')" class="carousel-item-wrapper">
                    <div class="carousel-item">
                        <div class="media-wrapper">
                            <!-- 视频内容 -->
                            <video v-if="item.type === 'video'" class="carousel-video" :src="item.url" preload="metadata"
                                :loop="true" :muted="true" :playsinline="true" :webkit-playsinline="true"
                                x5-video-player-type="h5" x5-video-player-fullscreen="false"
                                :autoplay="currentIndex === index" :controls="false" ref="videoRefs"
                                @loadedmetadata="handleVideoLoaded" @error="handleMediaError($event, item)"></video>
                            <!-- 图片内容 -->
                            <a-image v-else :src="item.url" :preview="{
                                src: item.url,
                                mask: false
                            }" class="carousel-image" @error="handleMediaError($event, item)">
                                <template #error>
                                    <div class="image-error">
                                        <el-icon>
                                            <Picture />
                                        </el-icon>
                                        <p>加载失败</p>
                                    </div>
                                </template>
                            </a-image>
                        </div>
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
        <a-flex gap="small" style="margin-top: 1vh;" class="content-section">
            <VerticalRunningLantern style="width: 40vw;" />
            <a-tabs v-model:activeKey="blogKey" type="card" size="small" class="blog-tabs">
                <a-tab-pane v-for="blog in blogTabsInfos" :key="blog.id" :tab="blog.label">
                    <PostListColumnComponent :tabsId="blog.id" type="blog"/>
                </a-tab-pane>
            </a-tabs>
        </a-flex>
        <div class="module-section">
            <ModuleArea v-for="(moduleData, index) in moduleList" :key="index" :titleText="moduleData.title"
                :moduleList="moduleData.plateInfos" />
            <OnlineMembershipModule />
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue';
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
import articleApi from '@/services/article';
import { generateSignedUrl } from '@/services/file';
import { getCurrentTheme, onThemeChange } from '@/utils/themeUtils';

const carouselList = ref<CarouselItem[]>([]);
const moduleList = ref<ModuleData[]>([]);

const isDarkMode = ref(getCurrentTheme() === 'dark');
let themeChangeUnsubscribe: (() => void) | null = null;

onMounted(() => {
    // 监听主题变化
    themeChangeUnsubscribe = onThemeChange((theme) => {
        isDarkMode.value = theme === 'dark';
    });
});

onBeforeUnmount(() => {
    // 清理主题监听器
    if (themeChangeUnsubscribe) {
        themeChangeUnsubscribe();
    }
});

// 处理 COS URL
const processCOSUrl = async (url: string) => {
    if (!url) return url;

    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('myqcloud.com')) {
            // 从 URL 中提取 key
            const key = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
            // 获取带签名的 URL
            return await generateSignedUrl(key);
        }
        return url;
    } catch (error) {
        console.error('处理 COS URL 失败:', error);
        return url;
    }
};

const getCarouselData = async () => {
    try {
        const res = await CarouselApi.GET_TOP_CAROUSEL_API();
        if (res.code === 200 && res.data?.length > 0) {
            // 处理每个轮播项的 URL
            const processedItems = await Promise.all(
                res.data.map(async item => ({
                    ...item,
                    url: await processCOSUrl(item.url)
                }))
            );
            carouselList.value = processedItems;
        }
    } catch (error) {
        console.error('获取轮播图数据出错:', error);
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

// 添加当前轮播索引
const currentIndex = ref(0);

// 视频引用数组
const videoRefs = ref<HTMLVideoElement[]>([]);

// 处理轮播切换
const handleCarouselChange = (index: number) => {
    currentIndex.value = index;

    // 处理视频播放
    carouselList.value.forEach((item, i) => {
        if (item.type === 'video' && videoRefs.value[i]) {
            const video = videoRefs.value[i];
            if (i === index) {
                video.currentTime = 0; // 重置视频时间
                video.play();
            } else {
                video.pause();
            }
        }
    });
};

// 处理轮播图点击
const handleCarouselClick = async (link: string) => {
    if (link) {
        // 检查是否是文章链接
        const articleMatch = link.match(/\/article\/(\w+)/);
        if (articleMatch && articleMatch[1]) {
            const articleId = articleMatch[1];
            try {
                // 更新文章查看次数
                await articleApi.UPDATE_ARTICLE_VIEW_COUNT_API(articleId);
            } catch (error) {
                console.error('更新文章查看次数失败:', error);
            }
        }
        router.push("/article/" + link);
    }
};

const handleMediaError = (event: Event, item: CarouselItem) => {
    console.error('媒体加载失败:', event, item.url);
    ElMessage.error('媒体加载失败，请检查访问权限');
};

const handleVideoLoaded = (event: Event) => {
    const video = event.target as HTMLVideoElement;
    const index = videoRefs.value.findIndex(v => v === video);
    if (index === currentIndex.value) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('视频播放失败:', error);
            });
        }
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
<style lang="scss" scoped>
.pc-container {
    min-height: 100vh;
    transition: all 0.3s ease;

    &.dark-theme {
        background-color: var(--secondary-bg, #06101f);
        color: var(--primary-text, #e0e0e0);

        .content-section {
            .blog-tabs {
                :deep(.ant-tabs-nav) {
                    background-color: var(--card-bg, #0c1426);
                    border-color: var(--border-color, rgba(255, 255, 255, 0.1));
                    
                    .ant-tabs-tab {
                        background-color: var(--secondary-bg, #06101f);
                        border-color: var(--border-color, rgba(255, 255, 255, 0.1));
                        color: var(--secondary-text, #b0b0b0);

                        &.ant-tabs-tab-active {
                            background-color: var(--primary-color, #177ddc);
                            color: #fff;
                        }

                        &:hover {
                            color: var(--primary-color, #177ddc);
                        }
                    }
                }

                :deep(.ant-tabs-content-holder) {
                    background-color: var(--card-bg, #0c1426);
                    border-color: var(--border-color, rgba(255, 255, 255, 0.1));
                }
            }
        }

        .module-section {
            :deep(.module-area),
            :deep(.online-membership) {
                background-color: var(--card-bg, #0c1426);
                border-color: var(--border-color, rgba(255, 255, 255, 0.1));
                color: var(--primary-text, #e0e0e0);

                .module-title,
                .title {
                    color: var(--primary-text, #e0e0e0);
                    border-bottom-color: var(--border-color, rgba(255, 255, 255, 0.1));
                }

                .module-content {
                    background-color: var(--secondary-bg, #06101f);
                }
            }
        }
    }
}

.content-section {
    margin-bottom: 1vh;
}

.module-section {
    display: flex;
    flex-direction: column;
    gap: 1vh;
}

.banner-carousel {
    margin-top: 5vh;
    width: 30vw;
    height: 36vh;
    background-color: #475669;
    border-radius: 0.3vw;
    overflow: hidden;
}

.carousel-item-wrapper {
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.01);
    }
}

.carousel-item {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    border-radius: 0.3vw;

    .media-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        background: #000;
        overflow: hidden;

        .carousel-image,
        .carousel-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;

            &:hover {
                transform: scale(1.05);
            }
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
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    color: #909399;
    font-size: 2rem;

    p {
        margin-top: 8px;
        font-size: 14px;
    }
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