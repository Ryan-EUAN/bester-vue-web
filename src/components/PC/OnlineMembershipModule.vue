<template>
    <div class="online-membership-module">
        <div class="area-header">
            <div class="title-line">
                <span class="title-text">{{ titleText }}</span>
            </div>
            <a-tooltip :title="isCollapsed ? '展开' : '折叠'">
                <a-button type="text" class="collapse-btn" @click="toggleCollapse">
                    <template #icon>
                        <MinusOutlined v-if="!isCollapsed" />
                        <PlusOutlined v-else />
                    </template>
                </a-button>
            </a-tooltip>
        </div>

        <transition name="module-slide">
            <div class="module-content" v-show="!isCollapsed">
                <a-flex :gap="20" justify="space-between">
                    <a-flex v-for="(item, index) in memberTypes" :key="index" vertical align="center"
                        class="member-item">
                        <component :is="item.icon" :style="`font-size: 24px; color: ${item.color};`" />
                        <span>{{ item.name }}</span>
                        <span>在线：{{ item.count }}</span>
                    </a-flex>
                </a-flex>
                <div class="statistics">
                    <span v-for="(stat, index) in statistics" :key="index">
                        {{ stat.label }}：{{ stat.value }}
                    </span>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { UserOutlined, CrownOutlined, StarOutlined, GoldOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons-vue';
import ModuleApi from '../../services/module';
import { message } from 'ant-design-vue';

const isCollapsed = ref(false);
const titleText = ref('在线会员');

// 会员类型数据
const memberTypes = ref([
    {
        name: '管理员',
        icon: UserOutlined,
        color: '#1890ff',
        count: 0
    },
    {
        name: '版主',
        icon: CrownOutlined,
        color: '#fadb14',
        count: 0
    },
    {
        name: '超级版主',
        icon: StarOutlined,
        color: '#fa541c',
        count: 0
    },
    {
        name: '普通用户',
        icon: UserOutlined,
        color: '#52c41a',
        count: 0
    },
    {
        name: 'VIP',
        icon: GoldOutlined,
        color: '#722ed1',
        count: 0
    }
]);

// 统计数据
const invisibleCount = ref(0);
const guestCount = ref(0);

// 获取在线会员数据
const getOnlineMembers = async () => {
    try {
        const res = await ModuleApi.GET_ONLINE_MEMBERS_API();
        if (res.code === 200 && Array.isArray(res.data)) {
            // 更新会员类型数据的count
            memberTypes.value.forEach(memberType => {
                const matchedData = res.data.find((item: { label: string; value: number }) => item.label === memberType.name);
                if (matchedData) {
                    memberType.count = matchedData.value;
                }
            });

            // 更新隐身和游客数量
            const invisibleData = res.data.find((item: { label: string; value: number }) => item.label === "隐身人数");
            const guestData = res.data.find((item: { label: string; value: number }) => item.label === "游客人数");

            invisibleCount.value = invisibleData?.value ?? 0;
            guestCount.value = guestData?.value ?? 0;
        }
    } catch (error) {
        console.error('获取在线会员数据出错:', error);
        message.error('获取在线会员数据失败');
    }
};

// 计算总在线人数
const totalOnline = computed(() => {
    return memberTypes.value.reduce((sum, item) => sum + item.count, 0) + invisibleCount.value;
});

// 统计信息数组
const statistics = computed(() => [
    { label: '总在线人数', value: totalOnline.value },
    { label: '隐身人数', value: invisibleCount.value },
    { label: '游客人数', value: guestCount.value }
]);

// 切换折叠状态
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};

// 组件挂载时获取数据
onMounted(async () => {
    await getOnlineMembers();
});
</script>

<style scoped lang="scss">
.online-membership-module {
    margin-top: 1vh;
    border: 0.05vw solid #e8e8e8;
    border-radius: 0.4vw;
    margin-bottom: 1vh;
    background: #fff;

    .area-header {
        position: relative;
        padding: 1vh 1vw;
        border-bottom: 0.05vw solid #e8e8e8;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fafafa;
        border-radius: 0.4vw 0.4vw 0 0;

        .title-line {
            position: relative;
            flex: 1;

            &::before {
                content: '';
                position: absolute;
                left: -1vw;
                top: 50%;
                transform: translateY(-50%);
                width: 0.2vw;
                height: 2vh;
                background: #1890ff;
                border-radius: 0 0.1vw 0.1vw 0;
            }

            .title-text {
                font-size: 0.9vw;
                font-weight: bold;
                color: #333;
                margin-left: 0.2vw;
            }
        }

        .collapse-btn {
            padding: 0.4vh 0.4vw;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;

            &:hover {
                background: #e6f7ff;
            }

            :deep(.anticon) {
                font-size: 1rem;
            }
        }
    }

    .module-content {
        padding: 1vh 1vw;
        transition: all 0.3s ease;
    }

    // 动画效果
    .module-slide-enter-active,
    .module-slide-leave-active {
        transition: all 0.3s ease;
        max-height: 500px;
        overflow: hidden;
    }

    .module-slide-enter-from,
    .module-slide-leave-to {
        opacity: 0;
        max-height: 0;
        padding-top: 0;
        padding-bottom: 0;
    }

    .member-item {
        padding: 1vh 1vw;
        border: 0.05vw solid #f0f0f0;
        border-radius: 0.2vw;
        width: 6vw;
        transition: all 0.3s;

        &:hover {
            transform: translateY(-0.2vh);
            box-shadow: 0 0.1vh 0.4vh rgba(0, 0, 0, 0.1);
        }

        span {
            margin-top: 0.5vh;
            font-size: 0.7vw;

            &:last-child {
                color: #666;
            }
        }
    }

    .statistics {
        margin-top: 1.5vh;
        padding-top: 1vh;
        border-top: 0.05vw solid #f0f0f0;

        span {
            margin-right: 2vw;
            color: #666;
            font-size: 0.7vw;
        }
    }
}

// 折叠状态下的样式
.online-membership-module:has(.module-content[style*="display: none"]) {
    .area-header {
        border-bottom: none;
        border-radius: 0.4vw;
    }
}
</style>