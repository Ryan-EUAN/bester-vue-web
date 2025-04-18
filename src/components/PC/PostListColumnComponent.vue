<template>
    <a-flex justify="space-between" v-for="(list, index) in listInfo" :key="index" v-if="listInfo.length > 0">
        <a-flex gap="small">
            <div :class="type == 'user' ? 'star' : 'index'" :style="{ backgroundColor: GetBackgroundColor(index + 1) }">
                {{ GetIndex(index + 1) }}
            </div>
            <a-space style="line-height: 1vw;">
                <a-avatar
                    src="https://img1.baidu.com/it/u=728383910,3448060628&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=800"
                    :size="25" v-if="type == 'user'" />
                <ElText truncated class="tabsList_css" @click="SelectList(list)"
                    :style="{ width: type == 'blog' ? '27vw' : '6.5vw', fontSize: type == 'blog' ? '0.9rem' : '0.8rem' }">
                    {{ list.label }}
                </ElText>
            </a-space>
        </a-flex>
        <div style="font-size: 0.7rem;color:#a5a5a5;line-height: 3vh;">
            {{ type == 'blog' ? TimeInit(list.end) : PriceInit(list.end) }}
        </div>
    </a-flex>
    <a-empty description="暂无数据" v-else />
</template>
<script setup lang="ts">
import { ElText } from "element-plus";
import { onMounted, ref } from "vue";
import ranking from '@/services/ranking'
import articleApi from '@/services/article';
import type { ListInfoType } from "../../model/listInfo";
import router from "@/router";

const props = defineProps(["tabsId", "listInfo", "type"])

let type = props.type;
let listInfo = ref<ListInfoType[]>([]);

// 获取序号
function GetIndex(index: number) {
    if (type == 'blog') return index;
    if (index <= 3) return index;
    return ''
}
// 获取背景色
function GetBackgroundColor(index: number) {
    return index == 1 ? '#ed741c' : index == 2 ? '#f3ac27' : index == 3 ? '#f9d375' : '#E0E0E0'
}
// 点击列表
async function SelectList(list: any) {
    if (type == "blog") {
        try {
            // 更新文章查看次数
            await articleApi.UPDATE_ARTICLE_VIEW_COUNT_API(list.id);
        } catch (error) {
            console.error('更新文章查看次数失败:', error);
            // 继续导航，不影响用户体验
        }
        router.push(`/article/${list.id}`);
    }
}
// 价格格式化
function PriceInit(price: string) {
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function TimeInit(time: string) {
    const now = new Date();
    const postTime = new Date(time);
    const diff = now.getTime() - postTime.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 60) {
        return `${seconds}秒前`;
    } else if (minutes < 60) {
        return `${minutes}分钟前`;
    } else if (hours < 24) {
        return `${hours}小时前`;
    } else if (days === 1) {
        return `昨天 ${postTime.getHours()}:${String(postTime.getMinutes()).padStart(2, '0')}`;
    } else if (days === 2) {
        return `前天 ${postTime.getHours()}:${String(postTime.getMinutes()).padStart(2, '0')}`;
    } else {
        return `${postTime.getFullYear()}-${String(postTime.getMonth() + 1).padStart(2, '0')}-${String(postTime.getDate()).padStart(2, '0')}`;
    }
}
// 加载用户列表
async function LoadUserList() {
    if (props.tabsId == 'gold_coin') {
        let goldCoinList = await ranking.GET_USER_GOLD_COIN_RANKING_LIST_API();
        if (goldCoinList.code != 200) return alert(goldCoinList.message);
        listInfo.value = goldCoinList.data;
    }
}
// 加载博客列表
async function LoadBlogList() {
    let postList = await articleApi.GET_ARTICLE_LIST_API(props.tabsId);
    if (postList.code != 200) return alert(postList.message);
    listInfo.value = postList.data;
}

onMounted(() => {
    switch (props.type) {
        case 'user':
            LoadUserList();
            break;
        case 'blog':
            LoadBlogList();
            break;
        default:
            break;
    }
})
</script>

<style lang="less" scoped>
.tabsList_css {
    cursor: pointer;
    font-size: 0.9rem;
    text-align: left;
}

.tabsList_css:hover {
    opacity: 0.7;
}

.index {
    margin: 0.2vw 0;
    width: 1.6vw;
    height: 1.6vw;
    line-height: 1.6vw;
    text-align: center;
    border-radius: 1rem;
}

.star {
    width: 2vw;
    height: 2vw;
    line-height: 2vw;
    font-size: 0.6rem;
    font-weight: bold;
    text-align: center;
    clip-path: polygon(50% 0%,
            61% 35%,
            98% 35%,
            68% 57%,
            79% 91%,
            50% 70%,
            21% 91%,
            32% 57%,
            2% 35%,
            39% 35%);
}
</style>