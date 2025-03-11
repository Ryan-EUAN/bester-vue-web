<template>
    <a-flex gap="large">
        <ElCarousel height="47vh" style="width: 26vw;border-radius: 0.3rem;">
            <ElCarouselItem v-for="item in 4" :key="item">
                <h3 class="small justify-center" text="2xl">{{ item }}</h3>
            </ElCarouselItem>
        </ElCarousel>
        <a-tabs v-model:activeKey="blogKey" type="card" size="small">
            <a-tab-pane v-for="blog in blogTabsInfos" :key="blog.id" :tab="blog.label">
                <PostListColumnComponent :tabsId="blog.id" :listInfo="first" type="blog" />
            </a-tab-pane>
        </a-tabs>
        <a-tabs v-model:activeKey="userKey" type="card" size="small" style="width: 15vw;">
            <a-tab-pane v-for="user in userTabsInfos" :key="user.id" :tab="user.label">
                <PostListColumnComponent :tabsId="user.id" :listInfo="second" type="user" />
            </a-tab-pane>
        </a-tabs>
    </a-flex>
    <div style="width: 27vw;margin-top: 1vh;">
        <a-carousel arrows dots-class="slick-thumb" dot-position="right" :autoplay="true">
            <template #customPaging="props">
                <a>
                    <img :src="getImgUrl(props.i)" />
                </a>
            </template>
            <div v-for="item in 4" :key="item">
                <img :src="getImgUrl(item - 1)" />
            </div>
        </a-carousel>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PostListColumnComponent from '../../components/PostListColumnComponent.vue';

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

type tabsType = {
    id: number,
    label: string,
    end: string
}
let first = ref<tabsType[]>([])
let second = ref<tabsType[]>([])

const baseUrl = 'https://raw.githubusercontent.com/vueComponent/ant-design-vue/main/components/carousel/demo/';

function getImgUrl(i: number) {
    return `${baseUrl}abstract0${i + 1}.jpg`;
}

onMounted(() => {
    for (let index = 1; index <= 10; index++) {
        first.value.push({
            id: index,
            label: '最新主题爱上单丝耐受度耐受度i啊上班地阿三爸爸嗲生病i啊上班啊是的呢啊' + index,
            end: '10小时前'
        })
        second.value.push({
            id: index,
            label: '金币排行榜阿萨德暗示' + index,
            end: Math.floor(Math.random() * 10000000).toString()
        })
    }
})
</script>
<style lang="less" scoped>
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
</style>