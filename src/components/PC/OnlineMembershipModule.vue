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
            </div>
        </transition>

        <!-- 统计信息部分，不参与折叠 -->
        <div class="statistics">
            <span v-for="(stat, index) in statistics" :key="index">
                {{ stat.label }}：{{ stat.value }}
            </span>
            <span>系统运行：{{ runningTime }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { UserOutlined, CrownOutlined, StarOutlined, GoldOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons-vue';
import ModuleApi from '../../services/module';
import heartbeatService from '../../services/heartbeat';
import statisticsApi from '../../services/statistics';
import { formatRunningTime } from '../../utils/timeUtils';
import type { HeartbeatVO } from '../../types/online';
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
const membersCount = ref(0);
const totalOnlineCount = ref(0);

// 系统运行时间相关变量
const runningTime = ref('获取中...');
const serverStartTime = ref<number | null>(null);
const localOffset = ref(0);
let syncTimerInterval: number | null = null;
let updateTimerInterval: number | null = null;
let onlineMembersInterval: number | null = null;

// 获取在线会员数据的两种方式
// 1. 通过ModuleApi获取
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

// 2. 通过心跳服务获取
const getOnlineMembersViaHeartbeat = async () => {
    try {
        const res = await heartbeatService.SEND_HEARTBEAT_API();
        if (res.code === 200 && res.data) {
            const heartbeatData = res.data as HeartbeatVO;
            
            // 直接更新总数值
            totalOnlineCount.value = heartbeatData.totalOnline;
            membersCount.value = heartbeatData.members;
            guestCount.value = heartbeatData.guests;
            invisibleCount.value = heartbeatData.invisible;
            
            // 更新会员类型数据
            if (heartbeatData.userGroups) {
                memberTypes.value.forEach(memberType => {
                    // 根据会员类型名称匹配userGroups中的数据
                    const count = heartbeatData.userGroups[memberType.name];
                    memberType.count = count !== undefined ? count : 0;
                });
            }
        }
    } catch (error) {
        console.error('通过心跳获取在线会员数据出错:', error);
        // 如果心跳服务获取失败，尝试使用传统方式获取
        await getOnlineMembers();
    }
};

// 从服务器同步系统运行时间
const syncSystemRunningTime = async () => {
    try {
        const res = await statisticsApi.GET_SYSTEM_RUNNING_TIME_API();
        if (res.code === 200 && typeof res.data === 'number') {
            // 存储服务器返回的运行时间（毫秒）
            const serverRunningTime = res.data;
            
            // 计算服务器启动时间 = 当前时间 - 运行时间
            serverStartTime.value = Date.now() - serverRunningTime;
            
            // 更新本地时间偏移量
            localOffset.value = Date.now();
            
            // 立即更新显示
            updateRunningTimeDisplay();
        } else {
            console.error('获取系统运行时间失败:', res.message);
            runningTime.value = '获取失败';
        }
    } catch (error) {
        console.error('获取系统运行时间出错:', error);
        runningTime.value = '获取失败';
    }
};

// 更新运行时间显示
const updateRunningTimeDisplay = () => {
    if (serverStartTime.value === null) {
        return;
    }
    
    // 计算当前的运行时间 = 当前时间 - 服务器启动时间
    const currentRunningTime = Date.now() - serverStartTime.value;
    
    // 使用时间工具格式化显示
    runningTime.value = formatRunningTime(currentRunningTime);
};

// 计算总在线人数
const totalOnline = computed(() => {
    // 如果通过心跳获取了总在线人数，优先使用
    if (totalOnlineCount.value > 0) {
        return totalOnlineCount.value;
    }
    // 否则使用原来的计算方式
    return memberTypes.value.reduce((sum, item) => sum + item.count, 0) + invisibleCount.value;
});

// 统计信息数组
const statistics = computed(() => [
    { label: '总在线人数', value: totalOnline.value },
    { label: '会员人数', value: membersCount.value > 0 ? membersCount.value : memberTypes.value.reduce((sum, item) => sum + item.count, 0) },
    { label: '游客人数', value: guestCount.value },
    { label: '隐身人数', value: invisibleCount.value }
]);

// 切换折叠状态
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};

// 组件挂载时获取数据
onMounted(async () => {
    // 首先尝试通过心跳服务获取数据
    await getOnlineMembersViaHeartbeat();
    
    // 如果心跳服务不可用或数据不完整，使用传统方式获取
    if (totalOnlineCount.value === 0) {
        await getOnlineMembers();
    }
    
    // 获取系统运行时间
    await syncSystemRunningTime();
    
    // 设置定时同步服务器时间（每5分钟同步一次）
    syncTimerInterval = window.setInterval(async () => {
        await syncSystemRunningTime();
    }, 5 * 60 * 1000);
    
    // 设置定时更新显示（每秒更新一次）
    updateTimerInterval = window.setInterval(() => {
        updateRunningTimeDisplay();
    }, 1000);
    
    // 设置定时获取在线会员数据（每分钟更新一次）
    onlineMembersInterval = window.setInterval(async () => {
        // 优先使用心跳服务获取数据
        await getOnlineMembersViaHeartbeat();
    }, 60 * 1000);
});

// 组件卸载前清理资源
onBeforeUnmount(() => {
    // 清除定时器
    if (syncTimerInterval !== null) {
        clearInterval(syncTimerInterval);
    }
    
    if (updateTimerInterval !== null) {
        clearInterval(updateTimerInterval);
    }
    
    if (onlineMembersInterval !== null) {
        clearInterval(onlineMembersInterval);
    }
});
</script>

<style scoped lang="scss">
.online-membership-module {
    margin-top: 1vh;
    border: 0.05vw solid var(--border-color, #e8e8e8);
    border-radius: 0.4vw;
    margin-bottom: 1vh;
    background: var(--card-bg, #f5f5f5);

    .area-header {
        position: relative;
        padding: 1vh 1vw;
        border-bottom: 0.05vw solid var(--border-color, #e8e8e8);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--secondary-bg, #fafafa);
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
                background: var(--accent-color, #1890ff);
                border-radius: 0 0.1vw 0.1vw 0;
            }

            .title-text {
                font-size: 0.9vw;
                font-weight: bold;
                color: var(--primary-text, #333);
                margin-left: 0.2vw;
            }
        }

        .collapse-btn {
            padding: 0.4vh 0.4vw;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary-text, #333);

            &:hover {
                background: rgba(0, 174, 224, 0.1);
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
        border: 0.05vw solid var(--border-color, #f0f0f0);
        border-radius: 0.2vw;
        width: 6vw;
        transition: all 0.3s;
        background-color: var(--list-item-bg, #fff);

        &:hover {
            transform: translateY(-0.2vh);
            box-shadow: 0 0.1vh 0.4vh var(--shadow-color, rgba(0, 0, 0, 0.1));
            background-color: var(--list-item-hover, #f9f9f9);
        }

        span {
            margin-top: 0.5vh;
            font-size: 0.7vw;
            color: var(--primary-text, #333);

            &:last-child {
                color: var(--secondary-text, #666);
            }
        }
    }

    .statistics {
        margin-top: 1.5vh;
        padding: 1vh 1vw;
        border-top: 0.05vw solid var(--border-color, #f0f0f0);

        span {
            margin-right: 2vw;
            color: var(--secondary-text, #666);
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