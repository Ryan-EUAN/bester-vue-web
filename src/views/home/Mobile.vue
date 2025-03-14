<template>
    <div class="mobile-container">
        <!-- 顶部导航栏 -->
        <van-nav-bar class="nav-bar" :border="false">
            <template #left>
                <van-icon name="bars" size="24" @click="openMenu" />
            </template>
            <template #right>
                <van-search v-model="searchValue" placeholder="输入搜索关键词" shape="round" background="white"
                    v-if="showSearch" />
                <van-icon name="search" size="24" @click="showSearch = true" v-if="!showSearch" />
            </template>
        </van-nav-bar>
        <!-- 主导航 -->
        <van-tabs v-model:active="activeTab" sticky>
            <van-tab v-for="tab in mainTabs" :key="tab.name" :title="tab.title" />
        </van-tabs>

        <!-- 轮播图 -->
        <van-swipe class="banner-swipe" :autoplay="3000" indicator-color="#1989fa">
            <van-swipe-item v-for="(image, index) in bannerImages" :key="index">
                <img :src="image.url" class="banner-image" />
            </van-swipe-item>
        </van-swipe>

        <!-- 功能导航 -->
        <div class="feature-scroll">
            <van-row class="feature-row">
                <van-col span="3" v-for="item in featureItems" :key="item.name">
                    <div class="feature-item">
                        <div class="feature-icon" :style="{ backgroundColor: item.bgColor }">
                            <van-icon :name="item.icon" color="#fff" size="16" />
                        </div>
                        <span class="feature-text">{{ item.text }}</span>
                    </div>
                </van-col>
            </van-row>
        </div>

        <!-- 版块推荐 -->
        <div class="section-header">
            <span class="title">版块推荐</span>
            <div class="more-link" @click="viewMore">
                <span>更多</span>
                <van-icon name="arrow" />
            </div>
        </div>
        <van-grid :column-num="5" :border="false" class="recommend-grid">
            <van-grid-item v-for="item in recommendItems" :key="item.name" :to="item.path">
                <van-icon :name="item.icon" class="recommend-icon" size="24" />
                <span class="recommend-text">{{ item.text }}</span>
            </van-grid-item>
        </van-grid>
        <!-- 签到卡片 -->
        <div class="sign-card">
            <img src="@/assets/images/sign-banner.png" class="sign-banner" />
        </div>

        <!-- 在签到卡片后添加 -->
        <div class="community-section">
            <!-- 社区热帖推荐 -->
            <div class="section-header">
                <span class="title">社区热帖推荐</span>
                <div class="more-link" @click="viewMore">
                    <span>更多</span>
                    <van-icon name="arrow" />
                </div>
            </div>
            <div class="hot-posts">
                <van-grid :column-num="3" :border="false" :gutter="10">
                    <van-grid-item v-for="post in hotPosts.slice(0, 6)" :key="post.id">
                        <div class="post-card">
                            <div class="post-image-wrapper">
                                <img :src="post.image" class="post-image" />
                                <div class="post-tag">免费资源</div>
                            </div>
                            <div class="post-info">
                                <div class="post-title">
                                    {{ post.title }}
                                </div>
                            </div>
                        </div>
                    </van-grid-item>
                </van-grid>
            </div>

            <!-- 精选话题 -->
            <div class="section-header">
                <span class="title">精选话题</span>
                <div class="more-link" @click="viewMore">
                    <span>更多</span>
                    <van-icon name="arrow" />
                </div>
            </div>
            <div class="topic-list">
                <van-cell v-for="topic in hotTopics.slice(0, 5)" :key="topic.id" :title="topic.title"
                    :label="topic.views + '人围观'" center>
                    <template #right-icon>
                        <van-tag :type="topic.tagType" round>{{ topic.tag }}</van-tag>
                    </template>
                </van-cell>
            </div>
        </div>

        <!-- 添加浮动按钮组 -->
        <div class="float-buttons" v-show="showFloatButtons">
            <van-button round icon="home-o" @click="goHome" />
            <van-button round icon="back-top" @click="scrollToTop" />
        </div>
    </div>
    <PopupComponent ref="popupRef" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import PopupComponent from '@/components/Mobile/PopupComponent.vue';
import { useRouter } from 'vue-router';

interface PopupInstance {
     open: () => void;
}

const popupRef = ref<PopupInstance | null>(null);
const searchValue = ref('');
const activeTab = ref(0);
const showSearch = ref<boolean>(false);
const router = useRouter();
const showFloatButtons = ref(false);

// 主导航标签
const mainTabs = ref([
    { name: 'home', title: '首页' },
    { name: 'server', title: '开服宣传' },
    { name: 'community', title: '社区' },
    { name: 'help', title: '问题求助' }
]);

// 轮播图数据
const bannerImages = ref([
    { url: 'https://picsum.photos/800/400?random=1' },
    { url: 'https://picsum.photos/800/400?random=2' },
    { url: 'https://picsum.photos/800/400?random=3' },
    { url: 'https://picsum.photos/800/400?random=4' },
    { url: 'https://picsum.photos/800/400?random=5' },
    { url: 'https://picsum.photos/800/400?random=6' },
    { url: 'https://picsum.photos/800/400?random=7' }
]);

const featureItems = ref([
    { name: 'announcement', text: '重要公告', icon: 'flag-o', bgColor: '#ff4d4f' },
    { name: 'resources', text: '免费资源', icon: 'gift-o', bgColor: '#ff7a45' },
    { name: 'tutorial', text: '共享教程', icon: 'description', bgColor: '#36cfc9' },
    { name: 'reward', text: '推广奖励', icon: 'point-gift-o', bgColor: '#ffa940' },
    { name: 'tech', text: '老板找技术', icon: 'apps-o', bgColor: '#73d13d' }
]);

// 推荐版块
const recommendItems = ref([
    { name: 'free', text: '免费资源', icon: 'gift-o', path: '/free' },
    { name: 'tutorial', text: '共享教程', icon: 'description', path: '/tutorial' },
    { name: 'help', text: '问题互助', icon: 'question-o', path: '/help' },
    { name: 'gpt', text: 'GPT问答', icon: 'chat-o', path: '/gpt' },
    { name: 'server', text: '开服宣传', icon: 'cluster-o', path: '/server' }
]);

// 添加 Post 接口定义
interface Post {
    id: number;
    image: string;
    title: string;
}

// 修改 hotPosts 的类型声明
const hotPosts = ref<Post[]>([
    {
        id: 1,
        image: 'https://picsum.photos/300/300?random=1',
        title: '加载动画',
    },
    {
        id: 2,
        image: 'https://picsum.photos/300/300?random=2',
        title: 'NPC创建脚本插件',
    },
    {
        id: 3,
        image: 'https://picsum.photos/300/300?random=3',
        title: '阿波罗evo流水灯',
    },
    {
        id: 4,
        image: 'https://picsum.photos/300/300?random=4',
        title: '加载动画',
    },
    {
        id: 5,
        image: 'https://picsum.photos/300/300?random=5',
        title: 'NPC创建脚本插件',
    },
    {
        id: 6,
        image: 'https://picsum.photos/300/300?random=6',
        title: '阿波罗evo流水灯',
    }
]);

// 定义 TagType 类型
type TagType = 'primary' | 'success' | 'warning' | 'danger';

interface Topic {
    id: number;
    title: string;
    views: string;
    tag: string;
    tagType: TagType;  // 使用定义的 TagType
}

// 修改热门话题数据的类型声明
const hotTopics = ref<Topic[]>([
    {
        id: 1,
        title: '碧月港（中文服新人开服端）',
        views: '23573',
        tag: '火',
        tagType: 'danger' as TagType
    },
    {
        id: 2,
        title: '发放很多插件',
        views: '14961',
        tag: '火',
        tagType: 'danger' as TagType
    },
    {
        id: 3,
        title: '新版改车技工插件[ESX汉化版',
        views: '17028',
        tag: '火',
        tagType: 'danger' as TagType
    },
    {
        id: 4,
        title: '角色服务端（中文服新人开服',
        views: '19032',
        tag: '火',
        tagType: 'danger' as TagType
    },
    {
        id: 5,
        title: '国警EUP包',
        views: '19022',
        tag: '火',
        tagType: 'danger' as TagType
    },
    {
        id: 6,
        title: 'Lapizh Visuals | 画质包[N2',
        views: '16126',
        tag: '火',
        tagType: 'danger' as TagType
    },
    {
        id: 7,
        title: '猫咪咖啡厅+工作 拿走不谢',
        views: '12182',
        tag: '火',
        tagType: 'danger' as TagType
    }
]);

const openMenu = () => {
    popupRef.value?.open();
};

const viewMore = () => {
    // 处理查看更多逻辑
};

// 修改滚动监听逻辑
const handleScroll = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    showFloatButtons.value = scrollTop > 100; // 降低触发阈值
};

// 返回首页
const goHome = () => {
    router.push('/');
};

// 滚动到顶部
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

// 生命周期钩子
onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
.mobile-container {
    min-height: 100vh;
    background-color: #f7f8fa;
}

.nav-bar {
    :deep(.van-nav-bar__content) {
        background-color: #fff;
        height: 54px;

        .van-nav-bar__left {
            padding-left: 16px;
        }

        .van-nav-bar__right {
            padding-right: 16px;
        }

        .van-nav-bar__center {
            padding: 0 16px;
        }
    }
}

.banner-swipe {
    height: 30vh;
    margin: 2vmin;
    border-radius: 2vmin;
    overflow: hidden;

    .banner-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.feature-scroll {
    background-color: #fff;
    overflow-x: hidden;
    padding: 2vmin 0;
}

.feature-row {
    display: flex;
    justify-content: space-between;
    padding: 0 2vmin;
    white-space: nowrap;
    width: 90vw;
    margin: 0 auto;
}

.feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 1vmin;
}

.feature-icon {
    width: 8vmin;
    height: 8vmin;
    border-radius: 1.5vmin;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1vmin;
}

.feature-text {
    font-size: 3vmin;
    color: #333;
    white-space: nowrap;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3vmin 4vmin;
    background-color: #fff;
    margin-top: 2vmin;

    .title {
        font-size: 4vmin;
        font-weight: bold;
        color: #333;
    }

    .more-link {
        display: flex;
        align-items: center;
        color: #666;
        font-size: 3.2vmin;

        .van-icon {
            margin-left: 1vmin;
        }
    }
}

.recommend-grid {
    background-color: #fff;
    padding: 2vmin;

    .recommend-icon {
        width: 12vmin;
        height: 12vmin;
        text-align: center;
    }

    .recommend-text {
        font-size: 3.2vmin;
        color: #333;
    }
}

.sign-card {
    width: 100vw;
    margin-left: -0.5vmin;
    overflow: hidden;
    background-color: #f7f8fa;

    .sign-banner {
        width: 100%;
        height: auto;
        display: block;
    }
}

.float-buttons {
    position: fixed;
    right: 4vmin;
    bottom: 15vmin;
    z-index: 999; // 提高层级
    display: flex;
    flex-direction: column;
    gap: 2vmin;

    .van-button {
        width: 12vmin;
        height: 12vmin;
        padding: 0;
        border: none;
        background-color: rgba(255, 255, 255, 0.9);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

        :deep(.van-icon) {
            font-size: 6vmin;
            color: #666;
        }
    }
}

.community-section {
    background-color: #fff;
    margin-top: 2vmin;
}

.hot-posts {
    padding: 2vmin;

    .post-card {
        width: 100%;
        border-radius: 2vmin;
        overflow: hidden;
        background: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .post-image-wrapper {
        position: relative;
        width: 100%;
        aspect-ratio: 1;
        overflow: hidden;

        .post-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .post-tag {
            position: absolute;
            top: 2vmin;
            left: 2vmin;
            background-color: rgba(0, 0, 0, 0.6);
            color: #fff;
            padding: 1vmin 2vmin;
            border-radius: 1vmin;
            font-size: 2.8vmin;
        }
    }

    .post-info {
        padding: 2vmin;

        .post-title {
            font-size: 3vmin;
            color: #333;
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 20vw;
        }
    }
}

.topic-list {
    :deep(.van-cell) {
        padding: 2vmin 4vmin; // 缩短内部间距
        align-items: center;

        .van-cell__title {
            font-size: 3.2vmin;
            color: #333;
        }

        .van-cell__label {
            font-size: 2.8vmin;
            color: #999;
            margin-top: 0.5vmin; // 缩短标签间距
        }
    }
}
</style>