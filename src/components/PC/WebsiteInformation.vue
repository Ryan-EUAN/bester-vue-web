<template>
    <div class="website-info">
        <a-flex align="center" justify="space-between" class="info-container">
            <!-- 日期信息 -->
            <div class="date-info">
                <div class="date">{{ currentDate }}</div>
                <div class="weekday">{{ currentWeekday }}</div>
            </div>

            <!-- 统计数据 -->
            <a-flex gap="large" class="statistics">
                <div v-for="(item, index) in statisticsData" 
                    :key="index"
                    class="stat-item">
                    <div class="value">{{ item.value }}</div>
                    <div class="label">{{ item.label }}</div>
                </div>
            </a-flex>

            <!-- 个人昵称 -->
            <div class="user-info">
                <span class="username">{{ userInfo.nickname }}</span>
                <span class="label">尊敬的用户，欢迎回归</span>
            </div>

            <!-- 快捷操作 -->
            <a-flex gap="middle" class="quick-actions">
                <a-button type="link" @click="handleViewPosts">
                    <template #icon><MessageOutlined /></template>
                    我的帖子
                </a-button>
                <a-button type="link" @click="handleViewReplies">
                    <template #icon><CommentOutlined /></template>
                    最新回复
                </a-button>
            </a-flex>
        </a-flex>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MessageOutlined, CommentOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 用户信息
const userInfo = ref({
    nickname: '海绵宝宝OX',
    userId: '10086'
});

// 统计数据
const statisticsData = ref([
    { label: '今日', value: 47 },
    { label: '昨日', value: 91 },
    { label: '帖子', value: 138117 },
    { label: '会员', value: 8750 }
]);

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
    router.push('/my-posts');
};

const handleViewReplies = () => {
    router.push('/latest-replies');
};

onMounted(() => {
    updateDateTime();
});
</script>

<style scoped lang="scss">
.website-info {
    background: #fff;
    border-radius: 8px;
    padding: 12px 20px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    .info-container {
        width: 100%;
    }

    .date-info {
        .date {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
        }

        .weekday {
            font-size: 0.8rem;
            color: #666;
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
                background: #eee;
            }

            .value {
                font-size: 1.2rem;
                font-weight: 600;
                color: #1890ff;
            }

            .label {
                font-size: 0.8rem;
                color: #666;
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
            color: #1890ff;
            font-weight: 500;
        }

        .label {
            font-size: 0.8rem;
            color: #666;
            margin-top: 2px;
        }
    }

    .quick-actions {
        :deep(.ant-btn) {
            padding: 4px 0;
            height: auto;
            font-size: 0.9rem;

            .anticon {
                font-size: 1rem;
            }

            &:hover {
                color: #1890ff;
            }
        }
    }
}
</style>