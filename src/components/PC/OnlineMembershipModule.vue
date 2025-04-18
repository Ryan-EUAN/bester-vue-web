<template>
    <div class="online-membership-module" :class="{ 'dark-theme': isDarkMode }">
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
        <div class="statistics" style="user-select: none;">
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
import { getCurrentTheme, onThemeChange } from '@/utils/themeUtils';

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

const isDarkMode = ref(getCurrentTheme() === 'dark');
let themeChangeUnsubscribe: (() => void) | null = null;

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

    // 监听主题变化
    themeChangeUnsubscribe = onThemeChange((theme) => {
        isDarkMode.value = theme === 'dark';
    });
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

    // 清理主题监听器
    if (themeChangeUnsubscribe) {
        themeChangeUnsubscribe();
    }
});
</script>

<style scoped lang="scss">
.online-membership-module {
    border-radius: 0.8vw;
    background: var(--card-bg, #fff);
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    &.dark-theme {
        background: var(--forum-card-bg, #182338);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

        .area-header {
            background: var(--forum-header-bg, #1f2c45);
            border: none;

            .title-text {
                color: var(--primary-text, #fff);
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }

            .collapse-btn {
                color: var(--primary-text, #fff);

                &:hover {
                    background: rgba(255, 255, 255, 0.08);
                }
            }

            .title-line {
                &::before {
                    background: var(--accent-color, #00aee0);
                    box-shadow: 0 0 8px rgba(0, 174, 224, 0.4);
                }
            }
        }

        .module-content {
            .member-item {
                background: var(--list-item-bg, #131c30);
                border: 1px solid rgba(255, 255, 255, 0.05);

                &:hover {
                    background: var(--list-item-hover, #1c2940);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
                    border-color: rgba(255, 255, 255, 0.1);
                }

                span {
                    color: var(--primary-text, #fff);
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

                    &:last-child {
                        color: var(--secondary-text, #b0b0b0);
                    }
                }
            }
        }

        .statistics {
            background: var(--forum-header-bg, #1f2c45);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 0 0 0.8vw 0.8vw;

            span {
                color: var(--secondary-text, #b0b0b0);
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
        }
    }

    .area-header {
        position: relative;
        padding: 1.2vh 1.5vw;
        border: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--secondary-bg, #f8f9fa);
        border-radius: 0.8vw 0.8vw 0 0;

        .title-line {
            position: relative;
            flex: 1;

            &::before {
                content: '';
                position: absolute;
                left: -1.2vw;
                top: 50%;
                transform: translateY(-50%);
                width: 0.25vw;
                height: 2.2vh;
                background: var(--accent-color, #1890ff);
                border-radius: 0 0.2vw 0.2vw 0;
                box-shadow: 0 0 8px rgba(24, 144, 255, 0.2);
            }

            .title-text {
                font-size: 1.1vw;
                font-weight: 600;
                color: var(--primary-text, #333);
                margin-left: 0.3vw;
            }
        }

        .collapse-btn {
            padding: 0.5vh 0.5vw;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary-text, #333);
            border-radius: 0.4vw;

            &:hover {
                background: rgba(0, 174, 224, 0.08);
            }

            :deep(.anticon) {
                font-size: 1.1rem;
            }
        }
    }

    .module-content {
        padding: 20px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        :deep(.ant-flex) {
            gap: 20px !important;
        }
    }

    .member-item {
        padding: 16px;
        border: 1px solid rgba(0, 0, 0, 0.05);
        border-radius: 12px;
        width: calc(20% - 16px);
        transition: all 0.3s;
        background-color: var(--list-item-bg, #fff);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
            background-color: var(--list-item-hover, #f8f9fa);
        }

        :deep(.anticon) {
            font-size: 28px !important;
        }

        span {
            font-size: 0.9vw;
            color: var(--primary-text, #333);
            font-weight: 500;

            &:last-child {
                font-size: 0.8vw;
                color: var(--secondary-text, #666);
            }
        }
    }

    .statistics {
        margin-top: 0;
        padding: 16px 24px;
        background: var(--secondary-bg, #f8f9fa);
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        border-radius: 0 0 0.8vw 0.8vw;

        span {
            margin-right: 24px;
            color: var(--secondary-text, #666);
            font-size: 0.85vw;
            font-weight: 500;

            &:last-child {
                margin-right: 0;
            }
        }
    }
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

// 折叠状态下的样式
.online-membership-module:has(.module-content[style*="display: none"]) {
    .area-header {
        border-radius: 0.8vw;
    }
}
</style>