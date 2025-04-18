<template>
    <div class="website-info" :class="{ 'dark-theme': isDarkMode, 'light-theme': !isDarkMode }">
        <a-flex align="center" justify="space-between" class="info-container">
            <!-- 日期信息 -->
            <div class="date-info">
                <div class="date">{{ currentDate }}</div>
                <div class="weekday">{{ currentWeekday }}</div>
            </div>

            <!-- 统计数据 -->
            <a-flex gap="large" class="statistics">
                <div v-for="(item, index) in statisticsData" :key="index" class="stat-item">
                    <div class="value">
                        <a-spin v-if="loading" size="small" />
                        <span v-else>{{ item.value }}</span>
                    </div>
                    <div class="label">{{ item.label }}</div>
                </div>
            </a-flex>

            <!-- 个人昵称 -->
            <div class="user-info">
                <span class="username" v-if="userInfo.nickname">{{ userInfo.nickname }}</span>
                <span class="label" v-else>登录享受不一样的体验！！！</span>
            </div>

            <!-- 快捷操作 -->
            <a-flex gap="middle" class="quick-actions">
                <a-button type="link" @click="handleViewPosts">
                    <template #icon>
                        <MessageOutlined />
                    </template>
                    我的帖子
                </a-button>
                <a-button type="link" @click="handleViewReplies">
                    <template #icon>
                        <CommentOutlined />
                    </template>
                    最新回复
                </a-button>
            </a-flex>
        </a-flex>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { MessageOutlined, CommentOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import statisticsApi from '@/services/statistics';
import Notification from '@/utils/notification';
import type { WebsiteStatistics } from '@/model/statistics';
import { getCurrentTheme, onThemeChange } from '@/utils/themeUtils';

const isDarkMode = ref(getCurrentTheme() === 'dark');
let themeChangeUnsubscribe: (() => void) | null = null;

const router = useRouter();

// 用户信息
const userInfo = ref({
    nickname: '',
    userId: '10086'
});

// 统计数据项类型
interface StatItem {
    label: string;
    value: number;
}

// 统计数据
const statisticsData = ref<StatItem[]>([
    { label: '今日', value: 0 },
    { label: '昨日', value: 0 },
    { label: '帖子', value: 0 },
    { label: '会员', value: 0 }
]);

// 加载状态
const loading = ref(false);

// 定时器
const statsRefreshTimer = ref<number | null>(null);

// 获取网站统计数据
const fetchStatisticsData = async () => {
    loading.value = true;
    try {
        const res = await statisticsApi.GET_WEBSITE_STATISTICS_API();
        if (res.code === 200 && res.data) {
            const data: WebsiteStatistics = res.data;
            statisticsData.value = [
                { label: '今日', value: data.todayPosts },
                { label: '昨日', value: data.yesterdayPosts },
                { label: '帖子', value: data.totalPosts },
                { label: '会员', value: data.totalMembers }
            ];
        } else {
            console.error('获取统计数据失败:', res.message);
        }
    } catch (error) {
        console.error('获取统计数据异常:', error);
        Notification.error('获取网站统计数据失败', '网站信息', 2000, false);
    } finally {
        loading.value = false;
    }
};

// 设置定时刷新
const setupRefreshTimer = () => {
    // 每5分钟刷新一次统计数据
    statsRefreshTimer.value = window.setInterval(() => {
        fetchStatisticsData();
    }, 5 * 60 * 1000);
};

// 日期相关
const currentDate = ref('');
const currentWeekday = ref('');

// 获取当前日期和星期
const updateDateTime = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    currentDate.value = `${month}月${day}日`;

    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    currentWeekday.value = weekdays[now.getDay()];
};

// 快捷操作处理函数
const handleViewPosts = () => {
    router.push('/my-articles');
};

const handleViewReplies = () => {
    router.push('/my-replies');
};

// 检查用户登录状态
const checkLoginStatus = () => {
    const userInfoStr = localStorage.getItem('userInfo');
    const tokenStr = localStorage.getItem('token');

    // 如果token不存在，表示用户已退出登录
    if (!tokenStr) {
        userInfo.value.nickname = '';
        return;
    }

    // 如果用户信息存在，更新昵称
    if (userInfoStr) {
        try {
            const parsedUserInfo = JSON.parse(userInfoStr);
            userInfo.value.nickname = parsedUserInfo.name || '';
        } catch (error) {
            console.error('解析用户信息失败:', error);
            userInfo.value.nickname = '';
        }
    } else {
        userInfo.value.nickname = '';
    }
};

// 定时检查用户登录状态的定时器
let userStatusCheckTimer: number | null = null;

onMounted(() => {
    updateDateTime();
    fetchStatisticsData();
    setupRefreshTimer();
    checkLoginStatus();

    // 监听主题变化
    themeChangeUnsubscribe = onThemeChange((theme) => {
        isDarkMode.value = theme === 'dark';
    });

    // 添加用户登录事件监听，以便在用户登录后刷新统计数据和用户信息
    window.addEventListener('userInfoUpdated', () => {
        fetchStatisticsData();
        checkLoginStatus(); // 登录后更新用户信息
    });

    // 每10秒检查一次登录状态，以处理退出登录的情况
    userStatusCheckTimer = window.setInterval(() => {
        checkLoginStatus();
    }, 10000);
});

onBeforeUnmount(() => {
    // 清除统计数据刷新定时器
    if (statsRefreshTimer.value) {
        clearInterval(statsRefreshTimer.value);
    }

    // 清除用户状态检查定时器
    if (userStatusCheckTimer) {
        clearInterval(userStatusCheckTimer);
    }

    // 移除事件监听器
    window.removeEventListener('userInfoUpdated', () => {
        fetchStatisticsData();
        checkLoginStatus();
    });

    // 移除主题变化监听器
    if (themeChangeUnsubscribe) {
        themeChangeUnsubscribe();
    }
});
</script>

<style scoped lang="scss">
.website-info {
    height: 8vh;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
    padding: 0 1vw;
    display: flex;
    align-items: center;
    margin-top: 1vh;

    // 浅色主题（默认）
    &.light-theme {
        background: #fff;
        --text-primary: #333;
        --text-secondary: #666;
        --border-color: #eee;
        --primary-color: #1890ff;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    // 深色主题
    &.dark-theme {
        background: var(--card-bg, #0c1426);
        --text-primary: #e1e1e1;
        --text-secondary: #a7a7a7;
        --border-color: rgba(255, 255, 255, 0.1);
        --primary-color: #177ddc;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .info-container {
        width: 100%;
        height: 100%;
        align-items: center;
    }

    .date-info {
        .date {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .weekday {
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin-top: 2px;
        }
    }

    .statistics {
        .stat-item {
            text-align: center;
            padding: 0 15px;
            position: relative;

            &:not(:last-child)::after {
                content: '';
                position: absolute;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                height: 70%;
                width: 1px;
                background: var(--border-color);
            }

            .value {
                font-size: 1.2rem;
                font-weight: 600;
                color: var(--primary-color);
            }

            .label {
                font-size: 0.8rem;
                color: var(--text-secondary);
                margin-top: 2px;
            }
        }
    }

    .user-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .username {
            font-size: 0.9rem;
            color: var(--primary-color);
            font-weight: 500;
        }

        .label {
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin-top: 2px;
        }
    }

    .quick-actions {
        :deep(.ant-btn) {
            padding: 4px 0;
            height: auto;
            font-size: 0.9rem;
            color: var(--text-primary);

            .anticon {
                font-size: 1rem;
            }

            &:hover {
                color: var(--primary-color);
            }
        }
    }
}
</style>