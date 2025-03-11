<template>
    <a-flex justify="space-between" v-for="(list, index) in listInfo" :key="index" v-if="listInfo.length > 0">
        <a-flex gap="small" style="margin-bottom: 0.6vh;">
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
            {{ type == 'blog' ? list.end : PriceInit(list.end) }}
        </div>
    </a-flex>
    <a-empty description="暂无数据" v-else />
</template>
<script setup lang="ts">
import { ElText } from "element-plus";
import { onMounted, ref, watch } from "vue";
import ranking from '../services/ranking'
import type { ListInfoType } from "../model/listInfo";

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
function SelectList(list: any) {
    console.log('类型', type);
    console.log('导航', props.tabsId);
    console.log(list)
}
// 价格格式化
function PriceInit(price: string) {
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
// 加载用户列表
async function LoadUserList() {
    if (props.tabsId == 'gold_coin') {
        let goldCoinList = await ranking.GET_USER_GOLD_COIN_RANKING_LIST_API();
        if (goldCoinList.code != 200) return alert(goldCoinList.message);
        // console.log('结果', goldCoinList.data);
        listInfo.value = goldCoinList.data;
    }
}
// 加载博客列表
function LoadBlogList() {
    console.log('博客列表')
}

watch(() => props.tabsId, (newVal, oldVal) => {
    console.log(newVal, oldVal)
})
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